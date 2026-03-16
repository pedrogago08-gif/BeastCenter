const express = require("express");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password");
const { serializeUser } = require("../utils/serializers");

const router = express.Router();

router.post("/register", async function (req, res, next) {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json({ error: "Este email ja esta registado" });
        }

        const createdUser = await User.create({
            name: String(req.body.name || "").trim(),
            email: email,
            passwordHash: hashPassword(password),
            plan: req.body.plan || "basico",
            role: "cliente",
            status: "ativo",
            phone: req.body.phone || "",
            lastActivity: new Date()
        });

        return res.status(201).json({
            user: serializeUser(createdUser)
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async function (req, res, next) {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const user = await User.findOne({ email: email });

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: "Credenciais invalidas" });
        }

        user.lastActivity = new Date();
        await user.save();

        return res.json({
            user: serializeUser(user)
        });
    } catch (error) {
        next(error);
    }
});

router.post("/admin-login", async function (req, res, next) {
    try {
        const username = String(req.body.username || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const admin = await User.findOne({ username: username, role: "admin" });

        if (!admin || !verifyPassword(password, admin.passwordHash)) {
            return res.status(401).json({ error: "Credenciais administrativas invalidas" });
        }

        admin.lastActivity = new Date();
        await admin.save();

        return res.json({
            user: serializeUser(admin)
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
