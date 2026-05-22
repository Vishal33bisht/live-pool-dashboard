import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { validateEnv } from "./config/env.js";
import logger from "./utils/logger.js";

validateEnv();

import app from "./app.js";
import { initSocket } from "./config/socket.js";

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info("Server started", { port: PORT });
});

export { io, server };
