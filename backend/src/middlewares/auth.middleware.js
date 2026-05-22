import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const getTokenFromRequest = (req) => {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    return req.cookies.token || bearerToken;
};

const authMiddleware = (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized - No token provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        next(error instanceof ApiError ? error : new ApiError(401, "Unauthorized - Invalid token"));
    }
};

export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
        }

        next();
    } catch (error) {
        next();
    }
};

export default authMiddleware;
