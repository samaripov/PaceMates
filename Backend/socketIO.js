const socketIo = require("socket.io");

let io = null;

function initializeIO(server, sessionMiddleware) {
    if (!io) {
        io = socketIo(server);

        // Share session with Socket.IO
        io.engine.use(sessionMiddleware);

        io.on("connection", (socket) => {
            console.log(`A user connected: ${socket.id}`);

            // Get userId from socket's session
            const session = socket.request.session;
            const userId = session?.passport?.user?.id;

            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined their room`);
            } else {
                console.log("Socket connected without authenticated user");
            }

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io is not initialized;");
    }
    return io;
}

module.exports = {
    initializeIO,
    getIO
};