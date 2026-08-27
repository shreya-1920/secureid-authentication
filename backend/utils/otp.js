const crypto = require("crypto");

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const generateChallengeId = () => {
    return crypto.randomUUID();
};

module.exports = {
    generateOTP,
    generateChallengeId
};