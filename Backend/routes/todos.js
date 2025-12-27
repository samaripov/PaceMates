const express = require("express");
const todosController = require("../controllers/todosController");

const router = express.Router();

router.get("/new", function (req, res, next) {
    res.render("new_todo");
})

router.post("/create", function (req, res, next) {
    if (!req.user) {
        return res.redirect("/");
    }
    next()
}, todosController.createTodo,
    todosController.fetchTodos,
    function (req, res) {
        res.redirect("/");
    });
    
router.post("/toggle_complete", function (req, res, next) {
    if (!req.user) {
        return res.redirect("/");
    }
    next()
}, todosController.toggleComplete,
    todosController.fetchTodos,
    function (req, res) {
        res.redirect("/");
    });
module.exports = router;