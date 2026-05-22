import prisma from "../config/prisma.js";
import { isPollExpired, verifyPollOwnership } from "./poll.service.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { pollQuestionInclude } from "./pollInclude.service.js";

const buildAnalytics = ({
    poll,
    totalResponses,
    totalAnswered,
    authenticatedResponses,
    latestResponseAt,
    answerCountsByQuestion,
    optionCounts,
    responseTrend,
}) => {
    const totalQuestions = poll.questions.length;
    const mandatoryQuestionCount = poll.questions.filter((question) => question.isMandatory).length;
    const possibleAnswers = totalResponses * totalQuestions;
    const optionCountMap = new Map(
        optionCounts.map((item) => [`${item.questionId}:${item.selectedOptionId}`, item._count._all])
    );
    const questionAnswerCountMap = new Map(
        answerCountsByQuestion.map((item) => [item.questionId, item._count._all])
    );

    return {
        totalResponses,
        pollDetails: {
            id: poll.id,
            title: poll.title,
            slug: poll.slug,
            description: poll.description,
            isAnonymous: poll.isAnonymous,
            isPublished: poll.isPublished,
            isExpired: isPollExpired(poll),
            expiresAt: poll.expiresAt,
            createdAt: poll.createdAt,
        },
        participation: {
            totalQuestions,
            mandatoryQuestionCount,
            optionalQuestionCount: totalQuestions - mandatoryQuestionCount,
            authenticatedResponses,
            anonymousResponses: totalResponses - authenticatedResponses,
            averageCompletionRate: possibleAnswers
                ? Number(((totalAnswered / possibleAnswers) * 100).toFixed(2))
                : 0,
            latestResponseAt,
        },
        responseTrend,
        questions: poll.questions.map((question) => {
            const answeredCount = questionAnswerCountMap.get(question.id) || 0;

            const options = question.options.map((option) => {
                const count = optionCountMap.get(`${question.id}:${option.id}`) || 0;

                return {
                    id: option.id,
                    text: option.text,
                    count,
                    percentage: answeredCount
                        ? Number(((count / answeredCount) * 100).toFixed(2))
                        : 0,
                };
            });

            return {
                id: question.id,
                text: question.text,
                isMandatory: question.isMandatory,
                totalAnswers: answeredCount,
                skipped: totalResponses - answeredCount,
                options,
            };
        }),
    };
};

const getPollForAnalytics = async (pollId) => {
    return prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            questions: pollQuestionInclude,
        },
    });
};

const getAggregatedAnalytics = async (poll) => {
    const [
        totalResponses,
        authenticatedResponses,
        totalAnswered,
        latestResponse,
        answerCountsByQuestion,
        optionCounts,
        responseTrendRows,
    ] = await Promise.all([
        prisma.response.count({ where: { pollId: poll.id } }),
        prisma.response.count({
            where: {
                pollId: poll.id,
                respondentId: { not: null },
            },
        }),
        prisma.questionResponse.count({
            where: {
                response: { pollId: poll.id },
            },
        }),
        prisma.response.findFirst({
            where: { pollId: poll.id },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        }),
        prisma.questionResponse.groupBy({
            by: ["questionId"],
            where: {
                response: { pollId: poll.id },
            },
            _count: { _all: true },
        }),
        prisma.questionResponse.groupBy({
            by: ["questionId", "selectedOptionId"],
            where: {
                response: { pollId: poll.id },
            },
            _count: { _all: true },
        }),
        prisma.$queryRaw`
            SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::int AS count
            FROM "Response"
            WHERE "pollId" = ${poll.id}
            GROUP BY day
            ORDER BY day ASC
        `,
    ]);

    return buildAnalytics({
        poll,
        totalResponses,
        totalAnswered,
        authenticatedResponses,
        latestResponseAt: latestResponse?.createdAt || null,
        answerCountsByQuestion,
        optionCounts,
        responseTrend: responseTrendRows.map((item) => ({
            date: item.day instanceof Date ? item.day.toISOString().slice(0, 10) : String(item.day).slice(0, 10),
            count: Number(item.count),
        })),
    });
};

export const submitResponse = async (pollSlug, answers, respondentId = null, anonymousFingerprint = null) => {
    try {
        const poll = await prisma.poll.findUnique({
            where: { slug: pollSlug },
            include: {
                questions: pollQuestionInclude,
            },
        });

        if (!poll) {
            throw new ApiError(404, "Poll not found");
        }

        if (poll.isPublished) {
            throw new ApiError(400, "Poll results are already published");
        }

        if (isPollExpired(poll)) {
            throw new ApiError(400, "Poll has expired");
        }

        if (!poll.isAnonymous && !respondentId) {
            throw new ApiError(401, "Login is required to submit this poll");
        }

        const storedRespondentId = poll.isAnonymous ? null : respondentId;
        const storedAnonymousFingerprint = poll.isAnonymous ? anonymousFingerprint : null;
        const answerList = Array.isArray(answers) ? answers : [];
        const answeredQuestionIds = answerList.map((answer) => answer.questionId);
        const uniqueAnsweredQuestionIds = new Set(answeredQuestionIds);

        if (uniqueAnsweredQuestionIds.size !== answeredQuestionIds.length) {
            throw new ApiError(400, "Each question can only be answered once");
        }

        for (const question of poll.questions) {
            if (question.isMandatory && !uniqueAnsweredQuestionIds.has(question.id)) {
                throw new ApiError(400, `Mandatory question "${question.text}" must be answered`);
            }
        }

        for (const answer of answerList) {
            const question = poll.questions.find((item) => item.id === answer.questionId);
            if (!question) {
                throw new ApiError(404, `Question ${answer.questionId} not found`);
            }

            const option = question.options.find((item) => item.id === answer.selectedOptionId);
            if (!option) {
                throw new ApiError(400, `Invalid option for question ${answer.questionId}`);
            }
        }

        if (storedRespondentId) {
            const existingResponse = await prisma.response.findFirst({
                where: {
                    pollId: poll.id,
                    respondentId: storedRespondentId,
                },
            });

            if (existingResponse) {
                throw new ApiError(400, "You have already submitted a response for this poll");
            }
        }

        if (storedAnonymousFingerprint) {
            const existingResponse = await prisma.response.findFirst({
                where: {
                    pollId: poll.id,
                    anonymousFingerprint: storedAnonymousFingerprint,
                },
            });

            if (existingResponse) {
                throw new ApiError(400, "You have already submitted a response for this poll");
            }
        }

        try {
            return await prisma.response.create({
                data: {
                    pollId: poll.id,
                    respondentId: storedRespondentId,
                    anonymousFingerprint: storedAnonymousFingerprint,
                    questionResponses: {
                        create: answerList.map((answer) => ({
                            questionId: answer.questionId,
                            selectedOptionId: answer.selectedOptionId,
                        })),
                    },
                },
                include: {
                    questionResponses: {
                        include: {
                            question: true,
                            selectedOption: true,
                        },
                    },
                },
            });
        } catch (error) {
            if (error.code === "P2002") {
                throw new ApiError(400, "You have already submitted a response for this poll");
            }

            throw error;
        }
    } catch (error) {
        logger.error("Error submitting response", error);
        throw error;
    }
};

export const getPollAnalytics = async (pollId, userId) => {
    try {
        const poll = await verifyPollOwnership(pollId, userId, {
            questions: pollQuestionInclude,
        });

        return getAggregatedAnalytics(poll);
    } catch (error) {
        logger.error("Error getting poll analytics", error);
        throw error;
    }
};

export const getPublicPollAnalytics = async (pollId) => {
    try {
        const poll = await getPollForAnalytics(pollId);

        if (!poll) {
            throw new ApiError(404, "Poll not found");
        }

        return getAggregatedAnalytics(poll);
    } catch (error) {
        logger.error("Error getting public poll analytics", error);
        throw error;
    }
};

export const getPollResponses = async (pollId, userId) => {
    try {
        const poll = await verifyPollOwnership(pollId, userId);

        const responses = await prisma.response.findMany({
            where: { pollId },
            include: {
                questionResponses: {
                    include: {
                        question: true,
                        selectedOption: true,
                    },
                },
                respondent: poll.isAnonymous
                    ? false
                    : {
                        select: { id: true, name: true, email: true },
                    },
            },
            orderBy: { createdAt: "desc" },
        });

        return responses;
    } catch (error) {
        logger.error("Error getting poll responses", error);
        throw error;
    }
};
