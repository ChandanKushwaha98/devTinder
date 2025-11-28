const validator = require('validator');
const validataSignupData = (data) => {
    const { firstName, lastName, emailId, password } = data;
    console.log(emailId, 'emailId');
    if (!firstName || !lastName) {
        throw new Error("First name and last name are required.");
    }
    else if (!validator.isEmail(emailId.trim())) {
        throw new Error("Invalid email address.");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be at least 6 characters long and include uppercase, lowercase, number, and symbol.");
    }
}

module.exports = { validataSignupData };