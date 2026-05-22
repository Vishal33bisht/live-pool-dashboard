import * as pollService from "../services/poll.service.js";
import * as responseService from "../services/response.service.js";
import { emitPollUpdate } from "../config/socket.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPoll = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const pollData = req.body;

        const poll = await pollService.createPoll(userId, pollData);

        return res.status(201).json({
            success: true,
            message: "Poll created successfully",
            poll,
        });
});

export const getPollBySlug = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const poll = await pollService.getPollBySlug(slug);

        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found",
            });
        }

        const isExpired = pollService.isPollExpired(poll);
        const userId = req.userId;
        const isCreator = poll.createdBy === userId;
        const publicResults = poll.isPublished
            ? await responseService.getPublicPollAnalytics(poll.id)
            : null;

        return res.status(200).json({
            success: true,
            poll: {
                ...poll,
                isExpired,
                canRespond: !poll.isPublished && !isExpired && (poll.isAnonymous || Boolean(userId)),
                requiresAuth: !poll.isAnonymous,
                isCreator,
            },
            publicResults,
        });
});

export const getUserPolls = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const polls = await pollService.getUserPolls(userId);

        return res.status(200).json({
            success: true,
            polls,
        });
});

export const updatePoll = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { pollId } = req.params;
        const pollData = req.body;

        const poll = await pollService.updatePoll(pollId, userId, pollData);

        return res.status(200).json({
            success: true,
            message: "Poll updated successfully",
            poll,
        });
});

export const publishPoll = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { pollId } = req.params;

        const poll = await pollService.publishPoll(pollId, userId);
        const analytics = await responseService.getPublicPollAnalytics(poll.id);

        emitPollUpdate(poll.id, "poll-published", { analytics });

        return res.status(200).json({
            success: true,
            message: "Poll published successfully",
            poll,
        });
});

export const deletePoll = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { pollId } = req.params;

        await pollService.deletePoll(pollId, userId);

        return res.status(200).json({
            success: true,
            message: "Poll deleted successfully",
        });
});

export const getPollAnalytics = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { pollId } = req.params;

        const analytics = await responseService.getPollAnalytics(pollId, userId);

        return res.status(200).json({
            success: true,
            analytics,
        });
});

export const getPollResponses = asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { pollId } = req.params;

        const responses = await responseService.getPollResponses(pollId, userId);

        return res.status(200).json({
            success: true,
            responses,
        });
});
