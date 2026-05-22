import prisma from "../config/prisma.js";
import slugify from "slugify";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { getPollInclude, pollQuestionInclude, userPollInclude } from "./pollInclude.service.js";

const normalizeExpiry = (expiresAt) => {
    if (!expiresAt) return null;

    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid expiry date");
    }

    if (date <= new Date()) {
        throw new ApiError(400, "Expiry time must be in the future");
    }

    return date;
};

export const verifyPollOwnership = async (pollId, userId, include = {}) => {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include,
    });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    if (poll.createdBy !== userId) {
        throw new ApiError(403, "Unauthorized - Not poll creator");
    }

    return poll;
};

const questionCreateInput = (questions) => questions.map((question, qIndex) => ({
    text: question.text,
    isMandatory: Boolean(question.isMandatory),
    order: qIndex,
    options: {
        create: question.options.map((option, oIndex) => ({
            text: option.text,
            order: oIndex,
        })),
    },
}));

export const createPoll = async (userId, pollData) => {
    try {
        const { title, description, isAnonymous, expiresAt, questions } = pollData;
        
        // Generate unique slug
        let slug = slugify(title, { lower: true, strict: true }) || `poll-${Date.now()}`;
        let counter = 0;
        let uniqueSlug = slug;
        
        while (await prisma.poll.findUnique({ where: { slug: uniqueSlug } })) {
            counter++;
            uniqueSlug = `${slug}-${counter}`;
        }

        // Create poll with questions and options
        const poll = await prisma.poll.create({
            data: {
                title,
                description,
                isAnonymous: Boolean(isAnonymous),
                expiresAt: normalizeExpiry(expiresAt),
                slug: uniqueSlug,
                createdBy: userId,
                questions: { create: questionCreateInput(questions) },
            },
            include: {
                questions: pollQuestionInclude,
            },
        });

        return poll;
    } catch (error) {
        logger.error("Error creating poll", error);
        throw error;
    }
};

export const getPollBySlug = async (slug, includeResponses = false) => {
    try {
        const poll = await prisma.poll.findUnique({
            where: { slug },
            include: getPollInclude(includeResponses),
        });

        return poll;
    } catch (error) {
        logger.error("Error getting poll by slug", error);
        throw error;
    }
};

export const getPollById = async (id, includeResponses = false) => {
    try {
        const poll = await prisma.poll.findUnique({
            where: { id },
            include: getPollInclude(includeResponses),
        });

        return poll;
    } catch (error) {
        logger.error("Error getting poll by id", error);
        throw error;
    }
};

export const getUserPolls = async (userId) => {
    try {
        const polls = await prisma.poll.findMany({
            where: { createdBy: userId },
            include: userPollInclude,
            orderBy: { createdAt: "desc" },
        });

        return polls;
    } catch (error) {
        logger.error("Error getting user polls", error);
        throw error;
    }
};

export const updatePoll = async (pollId, userId, pollData) => {
    try {
        const poll = await verifyPollOwnership(pollId, userId, {
            _count: { select: { responses: true } },
        });

        const data = {};
        if (Object.prototype.hasOwnProperty.call(pollData, "title")) data.title = pollData.title;
        if (Object.prototype.hasOwnProperty.call(pollData, "description")) data.description = pollData.description;
        if (Object.prototype.hasOwnProperty.call(pollData, "isAnonymous")) data.isAnonymous = pollData.isAnonymous;
        if (Object.prototype.hasOwnProperty.call(pollData, "expiresAt")) data.expiresAt = normalizeExpiry(pollData.expiresAt);

        if (Object.prototype.hasOwnProperty.call(pollData, "questions")) {
            if (poll._count.responses > 0) {
                throw new ApiError(400, "Questions cannot be edited after responses are submitted");
            }

            data.questions = {
                deleteMany: {},
                create: questionCreateInput(pollData.questions),
            };
        }

        const updatedPoll = await prisma.poll.update({
            where: { id: pollId },
            data,
            include: getPollInclude(),
        });

        return updatedPoll;
    } catch (error) {
        logger.error("Error updating poll", error);
        throw error;
    }
};

export const publishPoll = async (pollId, userId) => {
    try {
        await verifyPollOwnership(pollId, userId);

        const updatedPoll = await prisma.poll.update({
            where: { id: pollId },
            data: { isPublished: true },
            include: { questions: pollQuestionInclude },
        });

        return updatedPoll;
    } catch (error) {
        logger.error("Error publishing poll", error);
        throw error;
    }
};

export const deletePoll = async (pollId, userId) => {
    try {
        await verifyPollOwnership(pollId, userId);

        await prisma.poll.delete({ where: { id: pollId } });

        return { success: true };
    } catch (error) {
        logger.error("Error deleting poll", error);
        throw error;
    }
};

export const isPollExpired = (poll) => {
    if (!poll.expiresAt) return false;
    return new Date() > new Date(poll.expiresAt);
};
