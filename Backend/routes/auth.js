const express = require("express");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");

//Routes
router.get("/login", function(req, res, next) {
    res.render("login");
})

router.post("/login/password", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}))

router.post("/logout", function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    })
})

//Auth Strategy
passport.use(new LocalStrategy(function verify(username, password, done) {
    db.get("SELECT * FROM users WHERE username = ?", [username], function(err, row) {
        if(err) { done(err); }
        if(!row) { return done(null, false, { message: "Incorrect username or password"}); }

        crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function(err, hashedPassword){
            if (err) { return done(err); }
            if(!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return done(null, false, { message: "Incorrect username or password"});
            }
            return done(null, row);
        });
    })
}))

module.exports = router;