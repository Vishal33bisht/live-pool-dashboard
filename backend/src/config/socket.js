import { Server } from "socket.io";
import { corsOptions } from "./cors.js";
import { registerPollSocketHandlers } from "../sockets/poll.socket.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: corsOptions,
    });

    io.on("connection", registerPollSocketHandlers);

    return io;
};

export const getIO = () => io;

export const emitPollUpdate = (pollId, event, payload) => {
    if (!io || !pollId) return;
    io.to(`poll-${pollId}`).emit(event, {
        pollId,
        ...payload,
        timestamp: new Date().toISOString(),
    });
};
