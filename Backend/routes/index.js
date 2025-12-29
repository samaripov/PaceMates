const express = require("express");
const { fetchTodos } = require("../controllers/todosController");
const router = express.Router();

function redirectHomeIfNotAuthenticated(req, res, next) {
  if (!req.user) { return res.render("home"); }
  next();
}

function renderIndexIfAuthenticated(req, res, next) {
  res.locals.filter = null;
  res.render("index", { user: req.user });
  next();
}

router.get("/",
  redirectHomeIfNotAuthenticated,
  fetchTodos,
  renderIndexIfAuthenticated
);

module.exports = router;