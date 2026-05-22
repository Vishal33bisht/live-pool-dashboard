import express from "express";
import authMiddleware, { optionalAuthMiddleware } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createPollSchema, publishPollSchema, updatePollSchema } from "../validators/poll.validator.js";
import * as pollController from "../controllers/poll.controller.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/", authMiddleware, validate(createPollSchema), pollController.createPoll);
router.get("/my-polls", authMiddleware, pollController.getUserPolls);
router.put("/:pollId", authMiddleware, validate(updatePollSchema), pollController.updatePoll);
router.post("/:pollId/publish", authMiddleware, validate(publishPollSchema.partial().optional()), pollController.publishPoll);
router.delete("/:pollId", authMiddleware, pollController.deletePoll);
router.get("/:pollId/analytics", authMiddleware, pollController.getPollAnalytics);
router.get("/:pollId/responses", authMiddleware, pollController.getPollResponses);

// Public route - to view poll by slug
router.get("/view/:slug", optionalAuthMiddleware, pollController.getPollBySlug);

export default router;
