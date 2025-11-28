const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    emailId: {
        type: String, required: true, unique: true, lowercase: true, trim: true, validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    },
    password: {
        type: String, required: true, minlength: 6, maxlength: 100, validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong password with min 6 characters, including uppercase, lowercase, number, and symbol.");
            }
        }
    },
    age: { type: Number },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
                throw new Error("Gender must be 'male', 'female', or 'other'");
            }
        }
    },
    photoUrl: {
        type: String, default: "https://as1.ftcdn.net/jpg/11/28/72/58/1000_F_1128725808_hckpy1JZOnVoTR0jMrHk8IMjctH69C3I.jpg", validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photo URL:  " + value);
            }
        }
    },
    about: { type: String, default: "This is default about user" },
    skills: { type: [String] }
}, { timestamps: true });
mongoose.model('User', userSchema);
module.exports = mongoose.model('User');