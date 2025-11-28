const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://ckushwaha981:UKCEIcjV7nqtR8Qt@cluster0.ynsg7i7.mongodb.net/devTinder');
};

module.exports = connectDB;