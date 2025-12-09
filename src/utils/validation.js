const validator = require('validator');

const validateSignupData = (data) => {
    const { firstName, lastName, emailId, password } = data;

    if (!firstName || !lastName) {
        throw new Error("First name and last name are required.");
    }
    if (!emailId) {
        throw new Error("Email address is required.");
    }
    if (!validator.isEmail(emailId.trim())) {
        throw new Error("Invalid email address.");
    }
    if (!password) {
        throw new Error("Password is required.");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be at least 6 characters long and include uppercase, lowercase, number, and symbol.");
    }
}

const validateProfileEditData = (req) => {
    const allowedEditFields = ['firstName', 'lastName', 'photoUrl', 'about', 'age', 'gender', 'skills'];
    const isUpdateAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));
    return isUpdateAllowed;
}

module.exports = { validateSignupData, validateProfileEditData };