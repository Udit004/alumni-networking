const express = require("express");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const User = require("../models/user");

const router = express.Router();

// 📌 Verify Firebase Token & Issue JWT
router.post("/login", async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Missing Firebase token" });
        }

        // ✅ Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseUID = decodedToken.uid;

        // ✅ Find user in MongoDB
        let user = await User.findOne({ firebaseUID });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token }); // ✅ Send token to frontend

    } catch (error) {
        console.error("❌ Error verifying Firebase token:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
});

module.exports = router;
