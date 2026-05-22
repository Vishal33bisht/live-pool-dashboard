import { z } from "zod";

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date",
});

export const createPollSchema = z.object({
    title: z.string().trim().min(3).max(255),
    description: z.string().trim().max(1000).optional(),
    isAnonymous: z.boolean().default(false),
    expiresAt: dateString.optional().nullable(),
    questions: z.array(
        z.object({
            text: z.string().trim().min(3),
            isMandatory: z.boolean().default(false),
            options: z.array(
                z.object({
                    text: z.string().trim().min(1),
                })
            ).min(2, "At least 2 options required"),
        })
    ).min(1, "At least 1 question required"),
});

export const updatePollSchema = z.object({
    title: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().max(1000).optional(),
    isAnonymous: z.boolean().optional(),
    expiresAt: dateString.optional().nullable(),
    questions: createPollSchema.shape.questions.optional(),
});

export const publishPollSchema = z.object({
    isPublished: z.boolean(),
});
