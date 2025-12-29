const express = require("express");
const path = require("path");
const createError = require('http-errors');
const passport = require("passport")
const session = require("express-session");

const SQLiteStore = require("connect-sqlite3")(session);
const app = express();
const PORT = 5000;

//Session Support
const sessionMiddleware = session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" })
});

app.use(express.static(path.join(__dirname, "public")));
app.use(sessionMiddleware);
app.use(passport.authenticate("session"));

//Persist user information
passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        done(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user);
    })
});

//Save logged in user
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

//Middleware to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// view engine setup
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Routers
const indexRouter = require('./routes/index');
const authRouter = require("./routes/auth");
const todosRouter = require('./routes/todos');

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/todo', todosRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(`<h1>Error ${err.status || 500}</h1><p>${err.message}</p>`);
});

const http = require("http");
const server = http.createServer(app);

const { initializeIO } = require("./socketIO");
initializeIO(server, sessionMiddleware);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { server, sessionMiddleware };

module.exports = server;