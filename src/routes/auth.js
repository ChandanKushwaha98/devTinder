const express = require('express');
const authRouter = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { validataSignupData } = require('../utils/validation');
authRouter.post("/signup", async (req, res) => {
    try {
        validataSignupData(req.body);
        const { firstName, lastName, emailId, password } = req.body;
        //encrypt password before saving to database
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });
        await user.save()
        res.send("User signed up successfully");

    } catch (err) {
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

        res.send("User logged in successfully");

    }
    catch (err) {
        res.status(400).send("Error during login: " + err.message);
    }
});


module.exports = authRouter;