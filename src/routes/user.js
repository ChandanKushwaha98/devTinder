const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectRequest');
const User = require('../models/user');
const { USER_SAFE_DATA } = require('../utils/constants');

//Get all the pending connection requests for a user

userRouter.get('/user/requests/received', userAuth, async (req, res) => {

    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({ toUserId: loggedInUser._id, status: 'interested' })
            .populate('fromUserId', USER_SAFE_DATA);
        // .populate('fromUserId', ['firstName', 'lastName']);

        res.status(200).json({
            message: "Connection requests fetched successfully",
            data: connectionRequests
        });

    } catch (error) {
        res.status(400).json({
            message: "Error fetching connection requests",
            error: error.message
        });
    }

});

userRouter.get('/user/connections', userAuth, async (req, res) => {

    try {
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: req.user._id, status: 'accepted' },
                { toUserId: req.user._id, status: 'accepted' }]
        }).populate('fromUserId toUserId', USER_SAFE_DATA);


        const data = connectionRequests
            .filter((request) => request.fromUserId && request.toUserId)
            .map((request) => {
                return request.fromUserId._id.toString() === req.user._id.toString() ? request.toUserId : request.fromUserId
            });

        res.status(200).json({
            message: "Connections fetched successfully",
            data: data
        });

    } catch (error) {
        res.status(400).json({
            message: "Error fetching connections",
            error: error.message
        });
    }

});

userRouter.get('/feed', userAuth, async (req, res) => {

    //interested , accepted, ignored, rejected and his own requests should not be in the feed
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }]
        }).select('fromUserId toUserId')

        const hideusersFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideusersFromFeed.add(request.fromUserId.toString());
            hideusersFromFeed.add(request.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideusersFromFeed) } },
                { _id: { $ne: loggedInUser._id } }

            ]
        })
            .select(USER_SAFE_DATA)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "User profile fetched successfully",
            data: users
        });
    } catch (error) {
        res.status(400).json({
            message: "Error fetching user profile",
            error: error.message
        });
    }
});


module.exports = userRouter;
