
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const userAuth = async (req, res, next) => {
    // read token from headers
    // validate token
    //find user from db

    try {

        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'Please login' });
        }
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedObj;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Unauthorized: ' + error.message });
    }
};

module.exports = { userAuth };