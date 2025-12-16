const express = require('express');
const { Chat } = require('../models/chats');
const { userAuth } = require("../middlewares/auth")
const chatRouter = express.Router();

/**
 * @swagger
 * /chat/{targetUserId}:
 *   get:
 *     summary: Get chat history
 *     description: Retrieve chat messages between the authenticated user and a target user. Creates a new chat if one doesn't exist.
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to chat with
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Chat ID
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of user IDs in the chat
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           senderId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                           text:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Error message
 *       401:
 *         description: Unauthorized - Please login
 */
chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id
    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName"
        })
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId], messages: []
            })
            await chat.save();
        }
        res.json({ success: true, data: chat });
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = chatRouter