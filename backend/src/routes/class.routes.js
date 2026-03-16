const express = require("express");
const ClassSession = require("../models/ClassSession");

const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const classes = await ClassSession.find({}).sort({ dayOfWeek: 1, time: 1 });
        res.json(classes);
    } catch (error) {
        next(error);
    }
});

router.post("/", async function (req, res, next) {
    try {
        const classSession = await ClassSession.create({
            title: req.body.title,
            category: req.body.category,
            trainerName: req.body.trainerName,
            location: req.body.location || "",
            dayOfWeek: req.body.dayOfWeek,
            time: req.body.time,
            duration: Number(req.body.duration || 45),
            capacity: Number(req.body.capacity || 20),
            enrolledCount: Number(req.body.enrolledCount || 0),
            status: req.body.status || "ativa",
            description: req.body.description || ""
        });

        res.status(201).json(classSession);
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async function (req, res, next) {
    try {
        const updates = {};
        ["title", "category", "trainerName", "location", "dayOfWeek", "time", "status", "description"].forEach(function (field) {
            if (typeof req.body[field] !== "undefined") {
                updates[field] = req.body[field];
            }
        });

        ["duration", "capacity", "enrolledCount"].forEach(function (field) {
            if (typeof req.body[field] !== "undefined") {
                updates[field] = Number(req.body[field]);
            }
        });

        const classSession = await ClassSession.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!classSession) {
            return res.status(404).json({ error: "Aula nao encontrada" });
        }

        return res.json(classSession);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        const classSession = await ClassSession.findByIdAndDelete(req.params.id);
        if (!classSession) {
            return res.status(404).json({ error: "Aula nao encontrada" });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
