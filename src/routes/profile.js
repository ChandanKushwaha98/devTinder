const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validation');
const profileRouter = express.Router();
const bcrypt = require('bcrypt');

profileRouter.get("/profile/view", userAuth, async (req, res) => {

    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send("Unauthorized");
        }
        res.send(req.user);
    } catch (error) {
        res.status(400).send("Unauthorized: " + error.message);

    }


});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {

    try {

        if (!validateProfileEditData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((field) => {
            loggedInUser[field] = req.body[field];
        });
        if (!loggedInUser) {
            return res.status(401).send("Unauthorized");
        }
        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, Your profile has been updated successfully`,
            data: loggedInUser
        });

    } catch (error) {
        res.status(400).send("Unauthorized: " + error.message);
    }


});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword, reEnteredNewPassword } = req.body;

        // 1. Validate old password against stored hash
        const isOldpasswordValid = await req.user.validatePassword(oldPassword);
        if (!isOldpasswordValid) {
            throw new Error("Current Password you've entered is incorrect");
        }

        // 2. New and re-entered must match
        if (newPassword !== reEnteredNewPassword) {
            throw new Error("New Password and Re-entered password do not match");
        }

        // 3. New password must be different from old
        if (oldPassword === newPassword) {
            throw new Error("New Password must be different from the old password");
        }

        // 4. Hash and save only the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        req.user.password = hashedNewPassword;
        await req.user.save();

        res.json({
            message: "Password has been updated successfully",
        });
    } catch (error) {
        res.status(400).send({ message: "Unauthorized: " + error.message });
    }
});


module.exports = profileRouter;