const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectRequest');


const USER_SAFE_DATA = 'firstName lastName age about photoUrl skills'

//Get all the pending connection requests for a user

userRouter.get('/user/requests/recieved', userAuth, async (req, res) => {

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


        const data = connectionRequests.map((request) => {
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


module.exports = userRouter;
