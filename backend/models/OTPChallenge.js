const mongoose = require("mongoose");

const otpChallengeSchema = new mongoose.Schema(
    {
        challengeId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        channel: {
            type: String,
            enum: ["email", "sms"],
            required: true
        },

        otpHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        attempts: {
            type: Number,
            default: 0
        },

        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "OTPChallenge",
    otpChallengeSchema
);