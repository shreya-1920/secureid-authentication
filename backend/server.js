require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json());

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    }
}));
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "IAM Authentication API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});