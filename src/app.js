const express = require('express');

const connectDB = require('./config/database');
const { userAuth } = require('./middlewares/auth');
const { validataSignupData } = require('./utils/validation');
const validator = require('validator');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = express()
const PORT = 7777;
app.use(express.json());
app.use(cookieParser());


const authRouter = require('./routes/auth');
const requestRouter = require('./routes/request');
const profileRouter = require('./routes/profile');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/request', requestRouter);

connectDB().then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
        console.log(`Server is listening at ${PORT}`);
    })
}).catch((err) => {
    console.error('Database connection error:', err);
});
