const express = require('express');
const { userAuth } = require('../middlewares/auth');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectRequest');
const User = require('../models/user');

const sendEmail = require("../utils/sendEmail")

/**
 * @swagger
 * /request/send/{status}/{userId}:
 *   post:
 *     summary: Send a connection request
 *     description: Send an interested or ignored connection request to another user
 *     tags: [Connections]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [interested, ignored]
 *         description: Type of connection request
 *         example: interested
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to send the request to
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionRequest'
 *       400:
 *         description: Invalid status or connection request already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A connection request already exists between these users.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The user you are trying to connect with does not exist.
 *       401:
 *         description: Unauthorized - Please login
 */
requestRouter.post("/request/send/:status/:userId", userAuth, async (req, res) => {

    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.userId;
        const status = req.params.status;
        const allowedStatuses = ['ignored', 'interested'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status value: ${status}.`,
            });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({
                message: "The user you are trying to connect with does not exist.",
            });
        }
        // Check if a request already exists between the two users
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });



        if (existingRequest) {
            return res.status(400).json({
                message: "A connection request already exists between these users.",
            });
        }

        const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
        const data = await connectionRequest.save();

        // Send email notification to the recipient
        const emailResponse = await sendEmail.sendConnectionEmail(toUser, req.user, status);
        console.log(emailResponse, 'emailResponse');

        res.status(200).json({
            message: "Connection request sent successfully",
            data
        })

    } catch (error) {
        res.status(400).json({
            message: "Error sending connection request",
            error: error.message
        });
    }

});

/**
 * @swagger
 * /request/review/{status}/{requestId}:
 *   post:
 *     summary: Review a connection request
 *     description: Accept or reject a pending connection request
 *     tags: [Connections]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accepted, rejected]
 *         description: Action to take on the request
 *         example: accepted
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the connection request
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Connection request reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request accepted successfully.
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionRequest'
 *       400:
 *         description: Invalid status or error reviewing request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid status value
 *       404:
 *         description: Connection request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request not found.
 *       401:
 *         description: Unauthorized - Please login
 */
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

    try {
        const allowedStatuses = ['accepted', 'rejected'];
        //validate the status

        if (!allowedStatuses.includes(req.params.status)) {
            return res.status(400).json({
                message: `Invalid status value: ${req.params.status}.`,
            });
        }
        // requestId should be valid
        const connectRequest = await ConnectionRequest.findOne({
            _id: req.params.requestId,
            toUserId: req.user._id,
            status: 'interested'
        });
        if (!connectRequest) {
            return res.status(404).json({
                message: "Connection request not found.",
            });
        }

        connectRequest.status = req.params.status;
        const data = await connectRequest.save();

        res.status(200).json({
            message: `Connection request ${req.params.status} successfully.`,
            data
        });

        //Akshay - to accept or reject the request
        //logged in user will be the toUserId
        //status will be accepted or rejected

    } catch (error) {
        res.status(400).json({
            message: "Error reviewing connection request",
            error: error.message
        });
    }

});

module.exports = requestRouter;