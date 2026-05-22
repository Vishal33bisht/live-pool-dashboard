import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, "Route not found"));
};

const errorHandler = (error, req, res, next) => {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const shouldExpose = error instanceof ApiError;

    if (statusCode >= 500) {
        logger.error("Unhandled request error", {
            error,
            method: req.method,
            path: req.originalUrl,
        });
    }

    res.status(statusCode).json({
        success: false,
        message: shouldExpose ? error.message : "Internal server error",
        errors: error.errors || undefined,
    });
};

export default errorHandler;
