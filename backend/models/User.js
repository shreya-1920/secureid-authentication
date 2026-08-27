const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        emailVerified: {
            type: Boolean,
            default: false
        },

        mobileVerified: {
            type: Boolean,
            default: false
        },
mfaSecret: {
    type: String,
    default: null
},
        mfaEnabled: {
            type: Boolean,
            default: false
        },

        failedLoginAttempts: {
            type: Number,
            default: 0
        },

        lockedUntil: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);