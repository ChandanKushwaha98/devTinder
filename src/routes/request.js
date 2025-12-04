const express = require('express');
const { userAuth } = require('../middlewares/auth');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectRequest');
const User = require('../models/user');




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