const express = require("express");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");

//Routes
// - Login
router.get("/login", function (req, res, next) {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("login");
});

router.post("/login/password", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}));

// - Logout
router.post("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

// - Signup
router.get("/signup", function (req, res, next) {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("signup");
});

router.post("/signup", function (req, res, next) {
    const salt = crypto.randomBytes(16);
    if (req.body.password !== req.body.confirm_password) {
        return res.redirect("/signup");
    }
    crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256", function (err, hashedPassword) {
        if (err) { return next(err); }
        db.run(
            "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)",
            [
                req.body.username,
                hashedPassword,
                salt
            ],
            function (err) {
                if (err) { return next(err); }
                const user = {
                    id: this.lastID,
                    username: req.body.username
                };
                req.login(user, function (err) {
                    if (err) { return next(err); }
                    res.redirect("/")
                });
            }
        );
    });
})
//Auth Strategy
passport.use(new LocalStrategy(function verify(username, password, done) {
    db.get("SELECT * FROM users WHERE username = ?", [username], function (err, row) {
        if (err) { done(err); }
        if (!row) { return done(null, false, { message: "Incorrect username or password" }); }

        crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function (err, hashedPassword) {
            if (err) { return done(err); }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return done(null, false, { message: "Incorrect username or password" });
            }
            return done(null, row);
        });
    })
}))

module.exports = router;