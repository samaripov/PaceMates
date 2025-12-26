const express = require("express");
const path = require("path");
const createError = require('http-errors');
const passport = require("passport")
const session = require("express-session");

const SQLiteStore = require("connect-sqlite3")(session);
const app = express();
const PORT = 5000;

//Routers
const indexRouter = require('./routes/index');
const authRouter = require("./routes/auth");

//Session Support
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({db: "sessions.db", dir: "./var/db" })
}));
app.use(passport.authenticate("session"));

//Persist user information
passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function(user, done) {
    process.nextTick(function() {
        return done(null, user);
    })
});

//Save logged in user
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

//Middleware to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(`<h1>Error ${err.status || 500}</h1><p>${err.message}</p>`);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});