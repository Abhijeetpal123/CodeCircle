const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20
    },
    lastName: {
        type: String,
    },
    emailID: {
        type: String,
    },
    passWord: {
        type: String
    },
    age: {
        type: Number
    },
    gender: {
        type: String
    },
    about: {
        type: String
    },
    skills: {
        type: [String]
    }
})

module.exports = mongoose.model("User", userSchema);