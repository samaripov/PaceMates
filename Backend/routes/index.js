const express = require("express");
const { fetchTodos } = require("../controllers/todosController");
const router = express.Router();

router.get("/", function(req, res, next) {
  if (!req.user) { return res.render("home"); }
  next();
}, fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.render("index", { user: req.user });
});

module.exports = router;