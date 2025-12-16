const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validation');
const profileRouter = express.Router();
const bcrypt = require('bcrypt');

/**
 * @swagger
 * /profile/view:
 *   get:
 *     summary: View current user profile
 *     description: Get the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Please login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       400:
 *         description: Error fetching profile
 */
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

/**
 * @swagger
 * /profile/edit:
 *   patch:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               age:
 *                 type: number
 *                 example: 26
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/photo.jpg
 *               about:
 *                 type: string
 *                 example: Software developer passionate about technology
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Python", "React"]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: John, Your profile has been updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid edit request or validation error
 *       401:
 *         description: Unauthorized - Please login
 */
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

/**
 * @swagger
 * /profile/password:
 *   patch:
 *     summary: Change user password
 *     description: Update the authenticated user's password
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - reEnteredNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (must include uppercase, lowercase, number, and symbol)
 *                 example: NewPassword123!
 *               reEnteredNewPassword:
 *                 type: string
 *                 format: password
 *                 description: Re-enter new password for confirmation
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been updated successfully
 *       400:
 *         description: Validation error (incorrect old password, passwords don't match, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Current Password you've entered is incorrect"
 *       401:
 *         description: Unauthorized - Please login
 */
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