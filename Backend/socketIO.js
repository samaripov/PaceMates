const socketIo = require("socket.io");

let io = null;

function initializeIO(server) {
    if (!io) {
        io = socketIo(server);

        io.on("connection", (socket) => {
            console.log(`A user connected: ${socket.id}`);

            socket.on("todo_update", (todo) => {
                console.log(`${todo} updated`);
                io.emit("todo_update", todo);
            });

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }
    return io;
}

function getIO() {
    if(!io) {
        throw new Error("Socket.io is not initialized;");
    }
    return io;
}

module.exports = {
    initializeIO,
    getIO
};