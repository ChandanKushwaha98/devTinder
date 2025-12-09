const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const { validateSignupData } = require('../utils/validation');
const User = require('../models/user');

// Auth rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
});

// Cookie options
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 86400000
});

authRouter.post("/signup", authLimiter, async (req, res) => {
    try {
        validateSignupData(req.body);
        const { firstName, lastName, emailId, password, age, gender } = req.body;
        //encrypt password before saving to database
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender
        });
        const savedUser = await user.save();
        const token = await user.getJWT();

        res.cookie("token", token, getCookieOptions());
        res.status(200).json({
            message: "User signed up successfully",
            data: savedUser
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }
        res.status(400).send("ERROR :" + err.message);
    }
});
authRouter.post("/login", authLimiter, async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) {
            return res.status(400).send("Email and password are required");
        } else if (!validator.isEmail(emailId.trim())) {
            return res.status(400).send("Invalid email address.");
        }
        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(400).send("Invalid Credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid Credentials");
        }

        const token = await user.getJWT();

        res.cookie("token", token, getCookieOptions());

        res.status(200).json({
            message: "User logged in successfully",
            data: user
        });
    }
    catch (err) {
        res.status(400).send("Error during login: " + err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    try {
        res.clearCookie("token", getCookieOptions());
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(400).send("Error during logout: " + error.message);
    }
})


module.exports = authRouter;