const express = require('express');

const connectDB = require('./config/database');
const { userAuth } = require('./middlewares/auth');
const { validataSignupData } = require('./utils/validation');
const validator = require('validator');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = express()
const PORT = 7777;
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
    try {
        validataSignupData(req.body);
        const { firstName, lastName, emailId, password } = req.body;
        //encrypt password before saving to database
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });
        await user.save()
        res.send("User signed up successfully");

    } catch (err) {
        res.status(400).send("ERROR :" + err.message);
    }
    // Signup logic here
});
app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) {
            return res.status(400).send("Email and password are required");
        } else if (!validator.isEmail(emailId.trim())) {
            return res.status(400).send("Invalid email address.");
        }
        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(400).send("Invalid Credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid Credentials");
        }

        const token = await user.getJWT();

        res.cookie("token", token, { expires: new Date(Date.now() + 86400000) });

        res.send("User logged in successfully");

    }
    catch (err) {
        res.status(400).send("Error during login: " + err.message);
    }
});


app.get("/profile", userAuth, async (req, res) => {

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


app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    console.log('here');
    const user = req.user;
    res.send("Connection request sent");
});


connectDB().then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
        console.log(`Server is listening at ${PORT}`);
    })
}).catch((err) => {
    console.error('Database connection error:', err);
});
