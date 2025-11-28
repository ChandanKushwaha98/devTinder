const express = require('express');
const { userAuth } = require('../middlewares/auth');
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {

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

module.exports = profileRouter;