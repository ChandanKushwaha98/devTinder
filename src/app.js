const express = require('express');

const connectDB = require('./config/database');
const { userAuth } = require('./middlewares/auth');
const { validataSignupData } = require('./utils/validation');
const validator = require('validator');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid Credentials");
        }
        //create JWT token
        //Add the token to cookie and send the response back to the client

        const token = jwt.sign({ _id: user._id }, 'SECRET_KEY', { expiresIn: '1h' });

        res.cookie("token", token);

        res.send("User logged in successfully");

    }
    catch (err) {
        res.status(400).send("Error during login: " + err.message);
    }
});
app.get("/user", async (req, res) => {
    const email = req.body.emailId;
    try {
        const user = await User.find({ email });
        res.send(user);
    }
    catch (err) {
        res.status(400).send("Error fetching user", err.message);
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
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    }
    catch (err) {
        res.status(400).send("Error fetching users", err.message);
    }
});

app.delete("/user", async (req, res) => {
    const id = req.body.userId;
    try {
        // await User.findByIdAndDelete(id);
        await User.findByIdAndDelete({ _id: id });
        res.send("User deleted successfully");
    } catch (err) {
        res.status(400).send("Error deleting user", err.message);
    }
});

app.patch("/user/:userId", async (req, res) => {
    const id = req.params.userId;
    const data = req.body;
    const ALLOWED_UPDATES = ['firstName', 'lastName', 'password', 'age', 'gender', 'photoUrl', 'about',];
    const isUpdteAllowed = Object.keys(data).every((key) => ALLOWED_UPDATES.includes(key));
    if (!isUpdteAllowed) {
        return res.status(400).send("Invalid updates!");
    }

    try {
        if (data?.skills?.length > 10) {
            return res.status(400).send("Cannot add more than 10 skills");
        }
        await User.findByIdAndUpdate({ _id: id }, data, { returnDocument: 'after', runValidators: true });
        res.send("User updated successfully");
    } catch (err) {
        res.status(400).send("Error updating user: " + err.message);
    }
});

connectDB().then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
        console.log(`Server is listening at ${PORT}`);
    })
}).catch((err) => {
    console.error('Database connection error:', err);
});
