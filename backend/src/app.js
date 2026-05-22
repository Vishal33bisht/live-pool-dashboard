import express from "express"
import cors from "cors"
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import responseRoutes from "./routes/response.routes.js";
import { corsOptions } from "./config/cors.js";
import errorHandler, { notFoundHandler } from "./middlewares/error.middleware.js";
import { csrfProtection, rateLimiter } from "./middlewares/security.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(rateLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(csrfProtection);

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/responses", responseRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
