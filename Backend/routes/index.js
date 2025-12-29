const express = require("express");
const { fetchTodos } = require("../controllers/todosController");
const router = express.Router();

function redirectToLandingIfNotAuthenticated(req, res, next) {
  if (!req.user) { return res.render("landing"); }
  next();
}

function renderIndexIfAuthenticated(req, res, next) {
  res.locals.filter = null;
  res.render("index", { user: req.user });
  next();
}

router.get("/",
  redirectToLandingIfNotAuthenticated,
  fetchTodos,
  renderIndexIfAuthenticated
);

module.exports = router;