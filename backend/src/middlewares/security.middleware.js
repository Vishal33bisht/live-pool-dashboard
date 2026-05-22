import crypto from "crypto";
import { allowedOrigins } from "../config/cors.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 300;
const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const buckets = new Map();

export const rateLimiter = (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const bucket = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };

    if (bucket.resetAt <= now) {
        bucket.count = 0;
        bucket.resetAt = now + WINDOW_MS;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS - bucket.count)));

    if (bucket.count > MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later.",
        });
    }

    next();
};

export const csrfProtection = (req, res, next) => {
    if (!mutatingMethods.has(req.method)) return next();

    const origin = req.get("origin");
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            success: false,
            message: "Request origin is not allowed",
        });
    }

    next();
};

export const buildAnonymousFingerprint = (req) => {
    const clientId = req.get("x-anonymous-id") || "";
    const ip = req.ip || req.socket.remoteAddress || "";
    const userAgent = req.get("user-agent") || "";

    return crypto
        .createHash("sha256")
        .update(`${clientId}:${ip}:${userAgent}`)
        .digest("hex");
};
