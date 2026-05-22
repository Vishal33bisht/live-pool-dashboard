export const pollQuestionInclude = {
    orderBy: { order: "asc" },
    include: {
        options: {
            orderBy: { order: "asc" },
        },
    },
};

export const getPollInclude = (includeResponses = false) => ({
    questions: {
        ...pollQuestionInclude,
        include: {
            ...pollQuestionInclude.include,
            responses: includeResponses ? { select: { id: true } } : false,
        },
    },
    creator: {
        select: { id: true, name: true, email: true },
    },
    responses: includeResponses ? { select: { id: true } } : false,
});

export const userPollInclude = {
    questions: pollQuestionInclude,
    _count: {
        select: { responses: true },
    },
};
