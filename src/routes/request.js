const express = require('express');
const { userAuth } = require('../middlewares/auth');
const requestRouter = express.Router();




requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    console.log('here');
    const user = req.user;
    res.send("Connection request sent");
});

module.exports = requestRouter;