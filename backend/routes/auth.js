const testOtps = new Map();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const OTPChallenge = require("../models/OTPChallenge");
const {
    generateSecret,
    generateURI,
    verify
} = require("otplib");
const QRCode = require("qrcode");
const {
    generateOTP,
    generateChallengeId
} = require("../utils/otp");

const router = express.Router();

const OTP_EXPIRY = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000;
// TEST-ONLY OTP STORAGE
const testOtps = new Map();

// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            mobile,
            password,
            confirmPassword
        } = req.body;

        if (!name || !email || !mobile || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

       const existingByEmail = await User.findOne({
    email: email.toLowerCase()
});

const existingByMobile = await User.findOne({
    mobile: mobile
});

console.log("================================");
console.log("REGISTER CHECK");
console.log("Email:", email.toLowerCase());
console.log("Mobile:", mobile);
console.log("Existing by email:", existingByEmail);
console.log("Existing by mobile:", existingByMobile);
console.log("================================");

if (existingByEmail) {
    return res.status(409).json({
        success: false,
        message: "Email already registered"
    });
}

if (existingByMobile) {
    return res.status(409).json({
        success: false,
        message: "Mobile number already registered"
    });
}

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            mobile,
            password: passwordHash
        });

        const otp = generateOTP();
        const challengeId = generateChallengeId();
        const otpHash = await bcrypt.hash(otp, 10);
// TEST-ONLY: keep OTP temporarily for evaluator testing
testOtps.set(challengeId, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY
});
        await OTPChallenge.create({
            challengeId,
            userId: user._id,
            channel: "email",
            otpHash,
            expiresAt: new Date(Date.now() + OTP_EXPIRY),
            attempts: 0,
            verified: false
        });

        console.log("\n================================");
        console.log("[SIMULATED EMAIL]");
        console.log("To:", user.email);
        console.log("OTP:", otp);
        console.log("================================\n");

        res.status(201).json({
            success: true,
            message: "Registration successful. Verify your email.",
            challengeId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// VERIFY EMAIL OTP
// =====================================================

router.post("/verify-email-otp", async (req, res) => {
    try {
        const { challengeId, otp } = req.body;

        if (!challengeId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Challenge ID and OTP are required"
            });
        }

        const challenge = await OTPChallenge.findOne({
            challengeId,
            channel: "email"
        });

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "Invalid OTP challenge"
            });
        }

        if (challenge.verified) {
            return res.status(400).json({
                success: false,
                message: "OTP has already been used"
            });
        }

        if (new Date() > challenge.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Maximum attempts exceeded"
            });
        }

        const valid = await bcrypt.compare(
            otp,
            challenge.otpHash
        );

        if (!valid) {
            challenge.attempts++;
            await challenge.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                remainingAttempts:
                    MAX_OTP_ATTEMPTS - challenge.attempts
            });
        }

        challenge.verified = true;
        await challenge.save();

        await User.findByIdAndUpdate(
            challenge.userId,
            {
                emailVerified: true
            }
        );

        res.json({
            success: true,
            message: "Email verified successfully",
            emailVerified: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// SEND SMS OTP
// =====================================================

router.post("/send-sms-otp", async (req, res) => {
    try {
        const { challengeId } = req.body;

        const emailChallenge = await OTPChallenge.findOne({
            challengeId,
            channel: "email"
        });

        if (!emailChallenge || !emailChallenge.verified) {
            return res.status(400).json({
                success: false,
                message: "Email must be verified first"
            });
        }

        const user = await User.findById(
            emailChallenge.userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = generateOTP();
        const smsChallengeId = generateChallengeId();
        const otpHash = await bcrypt.hash(otp, 10);
// TEST-ONLY: keep OTP temporarily for evaluator testing
testOtps.set(smsChallengeId, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY
});
        await OTPChallenge.create({
            challengeId: smsChallengeId,
            userId: user._id,
            channel: "sms",
            otpHash,
            expiresAt: new Date(Date.now() + OTP_EXPIRY),
            attempts: 0,
            verified: false
        });

        console.log("\n================================");
        console.log("[SIMULATED SMS]");
        console.log("To:", user.mobile);
        console.log("OTP:", otp);
        console.log("================================\n");

        res.json({
            success: true,
            message: "SMS OTP sent",
            challengeId: smsChallengeId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// VERIFY SMS OTP
// =====================================================

router.post("/verify-sms-otp", async (req, res) => {
    try {
        const { challengeId, otp } = req.body;

        const challenge = await OTPChallenge.findOne({
            challengeId,
            channel: "sms"
        });

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "Invalid OTP challenge"
            });
        }

        if (challenge.verified) {
            return res.status(400).json({
                success: false,
                message: "OTP has already been used"
            });
        }

        if (new Date() > challenge.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Maximum attempts exceeded"
            });
        }

        const valid = await bcrypt.compare(
            otp,
            challenge.otpHash
        );

        if (!valid) {
            challenge.attempts++;
            await challenge.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                remainingAttempts:
                    MAX_OTP_ATTEMPTS - challenge.attempts
            });
        }

        challenge.verified = true;
        await challenge.save();

        await User.findByIdAndUpdate(
            challenge.userId,
            {
                mobileVerified: true,
               
            }
        );

        res.json({
            success: true,
            message: "Mobile verified.",
            mobileVerified: true,
            mfaEnabled: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check lock
        if (
            user.lockedUntil &&
            user.lockedUntil > new Date()
        ) {
            return res.status(423).json({
                success: false,
                message: "Account temporarily locked",
                lockedUntil: user.lockedUntil
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {

            user.failedLoginAttempts++;

            if (
                user.failedLoginAttempts >=
                MAX_LOGIN_ATTEMPTS
            ) {
                user.lockedUntil = new Date(
                    Date.now() + LOCK_TIME
                );

                user.failedLoginAttempts = 0;
            }

            await user.save();

            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Reset failed attempts
        user.failedLoginAttempts = 0;
        await user.save();

        // MFA required
        if (user.mfaEnabled) {

            const otp = generateOTP();
            const challengeId = generateChallengeId();
            const otpHash = await bcrypt.hash(otp, 10);

            await OTPChallenge.create({
                challengeId,
                userId: user._id,
                channel: "email",
                otpHash,
                expiresAt:
                    new Date(Date.now() + OTP_EXPIRY),
                attempts: 0,
                verified: false
            });

            console.log("\n================================");
            console.log("[LOGIN OTP]");
            console.log("To:", user.email);
            console.log("OTP:", otp);
            console.log("================================\n");

            return res.json({
                success: true,
                mfaRequired: true,
                method: "email",
                challengeId
            });
        }

        // Login without MFA
        req.session.userId = user._id.toString();

        res.json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// VERIFY LOGIN OTP
// =====================================================

router.post("/verify-login-otp", async (req, res) => {
    try {
        const { challengeId, otp } = req.body;

        const challenge = await OTPChallenge.findOne({
            challengeId,
            channel: "email"
        });

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "Invalid OTP challenge"
            });
        }

        if (challenge.verified) {
            return res.status(400).json({
                success: false,
                message: "OTP already used"
            });
        }

        if (new Date() > challenge.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Maximum attempts exceeded"
            });
        }

        const valid = await bcrypt.compare(
            otp,
            challenge.otpHash
        );

        if (!valid) {
            challenge.attempts++;
            await challenge.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                remainingAttempts:
                    MAX_OTP_ATTEMPTS - challenge.attempts
            });
        }

        challenge.verified = true;
        await challenge.save();

        // CREATE SERVER SESSION
        req.session.userId =
            challenge.userId.toString();

        res.json({
            success: true,
            message: "Login successful",
            authenticated: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// GET CURRENT USER
// =====================================================

router.get("/me", async (req, res) => {
    try {

        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user = await User.findById(
            req.session.userId
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// LOGOUT
// =====================================================

router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});


// =====================================================
// JWT TOKEN
// =====================================================

router.post("/token", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const token = jwt.sign(
        {
            userId: req.session.userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    res.json({
        success: true,
        token
    });
});


// =====================================================
// PROTECTED JWT API
// =====================================================

router.get("/protected", async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader ||
            !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "JWT required"
            });
        }

        const token =
            authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.userId
        ).select("-password");

        res.json({
            success: true,
            message: "Protected resource accessed",
            user
        });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired JWT"
        });
    }
});
router.post("/setup-mfa", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.emailVerified || !user.mobileVerified) {
            return res.status(400).json({
                success: false,
                message: "Email and mobile must be verified first"
            });
        }

        // Generate secret
      const secret = generateSecret();

        user.mfaSecret = secret;
        await user.save();

        // Create authenticator URI
        const otpauth = generateURI({
    issuer: "SecureID",
    label: user.email,
    secret: secret
});

        // Generate QR code
        const qrCode = await QRCode.toDataURL(otpauth);

        console.log("\n================================");
        console.log("[MFA SETUP]");
        console.log("User:", user.email);
        console.log("Secret:", secret);
        console.log("================================\n");

        res.json({
            success: true,
            message: "MFA setup initialized",
            qrCode
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to setup MFA"
        });
    }
});
router.post("/verify-mfa", async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and code are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.mfaSecret) {
            return res.status(400).json({
                success: false,
                message: "MFA has not been setup"
            });
        }

        const result = await verify({
    token: code,
    secret: user.mfaSecret
});

const isValid = result.valid;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid MFA code"
            });
        }

        user.mfaEnabled = true;
        await user.save();

        res.json({
            success: true,
            message: "MFA verified successfully",
            mfaEnabled: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "MFA verification failed"
        });
    }
});
// =====================================================
// TEST-ONLY OTP RETRIEVAL
// =====================================================

router.get("/test/otp/:challengeId", (req, res) => {

    // Only allow this endpoint when explicitly enabled
    if (process.env.TEST_MODE !== "true") {
        return res.status(404).json({
            success: false,
            message: "Not found"
        });
    }

    const { challengeId } = req.params;

    const testOtp = testOtps.get(challengeId);

    if (!testOtp) {
        return res.status(404).json({
            success: false,
            message: "OTP not found or expired"
        });
    }

    if (Date.now() > testOtp.expiresAt) {
        testOtps.delete(challengeId);

        return res.status(410).json({
            success: false,
            message: "OTP expired"
        });
    }

    return res.json({
        success: true,
        challengeId,
        otp: testOtp.otp,
        expiresAt: new Date(testOtp.expiresAt)
    });
});
// TEST-ONLY OTP RETRIEVAL
router.get("/test/otp/:challengeId", (req, res) => {

    if (process.env.TEST_MODE !== "true") {
        return res.status(404).json({
            success: false,
            message: "Not found"
        });
    }

    const { challengeId } = req.params;

    const testOtp = testOtps.get(challengeId);

    if (!testOtp) {
        return res.status(404).json({
            success: false,
            message: "OTP not found or expired"
        });
    }

    if (Date.now() > testOtp.expiresAt) {
        testOtps.delete(challengeId);

        return res.status(410).json({
            success: false,
            message: "OTP expired"
        });
    }

    return res.json({
        success: true,
        challengeId,
        otp: testOtp.otp,
        expiresAt: new Date(testOtp.expiresAt)
    });
});
module.exports = router;