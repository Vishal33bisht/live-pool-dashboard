import logger from "../utils/logger.js";

export const registerPollSocketHandlers = (socket) => {
    logger.info("Socket connected", { socketId: socket.id });

    socket.on("join-poll", (pollId) => {
        if (!pollId) return;
        socket.join(`poll-${pollId}`);
    });

    socket.on("leave-poll", (pollId) => {
        if (!pollId) return;
        socket.leave(`poll-${pollId}`);
    });

    socket.on("disconnect", () => {
        logger.info("Socket disconnected", { socketId: socket.id });
    });
};
