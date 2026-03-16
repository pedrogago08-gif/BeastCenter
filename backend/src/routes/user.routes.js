const express = require("express");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const { serializeUser } = require("../utils/serializers");

const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users.map(serializeUser));
    } catch (error) {
        next(error);
    }
});

router.post("/", async function (req, res, next) {
    try {
        const payload = {
            name: req.body.name,
            email: req.body.email,
            username: req.body.username || null,
            passwordHash: req.body.passwordHash || hashPassword(req.body.password || "temporary123"),
            role: req.body.role || "cliente",
            plan: req.body.plan || "basico",
            status: req.body.status || "ativo",
            phone: req.body.phone || "",
            lastActivity: req.body.lastActivity || null
        };

        const createdUser = await User.create(payload);
        res.status(201).json(serializeUser(createdUser));
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async function (req, res, next) {
    try {
        const updates = {};

        ["name", "email", "username", "role", "plan", "status", "phone", "lastActivity"].forEach(function (field) {
            if (typeof req.body[field] !== "undefined") {
                updates[field] = req.body[field];
            }
        });

        if (req.body.password) {
            updates.passwordHash = hashPassword(req.body.password);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ error: "Utilizador nao encontrado" });
        }

        return res.json(serializeUser(updatedUser));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
