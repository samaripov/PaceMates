const db = require("../db");
const { getIO } = require("../socketIO");

function fetchTodos(req, res, next) {
  db.all("SELECT * FROM todos WHERE owner_id = ?", [
    req.user.id
  ], function (err, rows) {
    if (err) { return next(err); }

    var todos = rows.map(function (row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
        url: "/" + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function (todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
}

function createTodo(req, res, next) {
  db.run("INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)", [
    req.user.id,
    req.body.title,
    0
  ], function (err) {
    if (err) {
      return next(err);
    }
    const newTodo = {
      id: this.lastID,
      owner_id: req.user.id,
      title: req.body.title,
      complete: false
    }
    res.locals.newTodo = newTodo;
    next();
  });
}
function notifyTodoListUpdate(req, res, next) {
  const io = getIO();
  io.to(`user_${req.user.id}`).emit("todo_update", res.locals.newTodo);
  next();
}

function toggleComplete(req, _, next) {
  const complete = req.body.completeness_marker === "on" ? 1 : 0;
  db.run("UPDATE todos SET completed = ? WHERE id = ?", [complete, req.body.todo_id]);
  next();
}
function notifyTodoToggled(req, _, next) {
  const io = getIO();
  io.to(`user_${req.user.id}`).emit("todo_toggle_completed", {
    id: req.body.todo_id,
    completeness_marker: req.body.completeness_marker
  });
  next();
}

function deleteTodo(req, _, next) {
  const todoId = req.params.id;
  db.run("DELETE FROM todos WHERE id = ?", [todoId]);
  next();
}

function notifyTodoDeleted(req, _, next) {
  const io = getIO();
  const todoId = req.params.id;
  io.to(`user_${req.user.id}`).emit("todo_delete", { id: todoId });
  next();
}

module.exports = {
  fetchTodos,
  createTodo,
  notifyTodoToggled,
  toggleComplete,
  notifyTodoListUpdate,
  deleteTodo,
  notifyTodoDeleted
}