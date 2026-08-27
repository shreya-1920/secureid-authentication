const { authenticator } = require("otplib");

function generateSecret() {
    return authenticator.generateSecret();
}

function generateCode(secret) {
    return authenticator.generate(secret);
}

function verifyCode(code, secret) {
    return authenticator.verify({
        token: code,
        secret: secret
    });
}

module.exports = {
    generateSecret,
    generateCode,
    verifyCode
};