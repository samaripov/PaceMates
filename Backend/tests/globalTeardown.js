const server = require("../app");
const db = require("../db");

module.exports = async () => {
    return new Promise((resolve) => {
        db.close(() => {
            server.close(() => {
                resolve();
            });
        });
    });
};
