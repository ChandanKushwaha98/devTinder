const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');
const { validataSignupData } = require('../utils/validation');
const User = require('../models/user');
authRouter.post("/signup", async (req, res) => {
    try {
        validataSignupData(req.body);
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
        await user.save()
        res.status(200).json({
            message: "User signed up successfully",
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }
        res.status(400).send("ERROR :" + err.message);
    }
});
authRouter.post("/login", async (req, res) => {
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

        res.cookie("token", token, { expires: new Date(Date.now() + 86400000) });

        res.status(200).json({
            message: "User logged in successfully",
        });
    }
    catch (err) {
        res.status(400).send("Error during login: " + err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    try {
        res.cookie("token", null, { expires: new Date() });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(400).send("Error during logout: " + error.message);
    }
})


module.exports = authRouter;