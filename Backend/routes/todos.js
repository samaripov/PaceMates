const express = require("express");
const todosController = require("../controllers/todosController");

const router = express.Router();

function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.redirect("/login");
    }
    next();
}
function goHome(_, res) {
    res.redirect("/");
}

router.get("/new",
    isAuthenticated,
    function (_, res, next) {
        res.render("new_todo");
    });

router.post("/create",
    isAuthenticated,
    todosController.createTodo,
    todosController.notifyTodoListUpdate,
    todosController.fetchTodos,
    goHome
);

router.post("/toggle_complete",
    isAuthenticated,
    todosController.toggleComplete,
    todosController.notifyTodoToggled,
    todosController.fetchTodos,
    goHome
);

router.post("/:id/delete",
    isAuthenticated,
    todosController.deleteTodo,
    todosController.notifyTodoDeleted,
    todosController.fetchTodos,
    goHome
);

module.exports = router;