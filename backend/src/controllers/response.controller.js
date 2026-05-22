import * as responseService from "../services/response.service.js";
import * as pollService from "../services/poll.service.js";
import { emitPollUpdate } from "../config/socket.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildAnonymousFingerprint } from "../middlewares/security.middleware.js";

export const submitResponse = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const { answers } = req.body;
        const respondentId = req.userId || null; // null if anonymous
        const anonymousFingerprint = buildAnonymousFingerprint(req);

        const poll = await pollService.getPollBySlug(slug);
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found",
            });
        }

        const response = await responseService.submitResponse(slug, answers, respondentId, anonymousFingerprint);
        const analytics = await responseService.getPublicPollAnalytics(response.pollId);

        emitPollUpdate(response.pollId, "response-update", {
            responseCount: analytics.totalResponses,
            analytics,
        });

        return res.status(201).json({
            success: true,
            message: "Response submitted successfully",
            response,
        });
});

export const getPublicResults = asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const poll = await pollService.getPollBySlug(slug);
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found",
            });
        }

        if (!poll.isPublished) {
            return res.status(403).json({
                success: false,
                message: "Poll results are not published yet",
            });
        }

        const analytics = await responseService.getPublicPollAnalytics(poll.id);

        return res.status(200).json({
            success: true,
            analytics,
        });
});
