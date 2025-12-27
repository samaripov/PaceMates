const express = require("express");
const todosController = require("../controllers/todosController");

const router = express.Router();

function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.redirect("/");
    }
    next();
}
function goHome(_, res) {
    res.redirect("/");
}

router.get("/new", function (_, res, next) {
    res.render("new_todo");
})

router.post("/create",
    isAuthenticated,
    todosController.createTodo,
    todosController.fetchTodos,
    goHome
);

router.post("/toggle_complete",
    isAuthenticated, 
    todosController.toggleComplete,
    todosController.fetchTodos,
    goHome
);

router.post("/:id/delete", 
    isAuthenticated,
    todosController.deleteTodo,
    todosController.fetchTodos,
    goHome
);
module.exports = router;