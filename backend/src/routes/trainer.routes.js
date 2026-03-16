const express = require("express");
const Trainer = require("../models/Trainer");

const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const trainers = await Trainer.find({}).sort({ createdAt: -1 });
        res.json(trainers);
    } catch (error) {
        next(error);
    }
});

router.post("/", async function (req, res, next) {
    try {
        const trainer = await Trainer.create({
            name: req.body.name,
            specialization: req.body.specialization,
            experience: Number(req.body.experience || 0),
            clients: Number(req.body.clients || 0),
            rating: Number(req.body.rating || 0),
            status: req.body.status || "ativo",
            image: req.body.image || "",
            description: req.body.description || "",
            tags: Array.isArray(req.body.tags) ? req.body.tags : []
        });

        res.status(201).json(trainer);
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async function (req, res, next) {
    try {
        const updates = {};
        ["name", "specialization", "status", "image", "description"].forEach(function (field) {
            if (typeof req.body[field] !== "undefined") {
                updates[field] = req.body[field];
            }
        });

        ["experience", "clients", "rating"].forEach(function (field) {
            if (typeof req.body[field] !== "undefined") {
                updates[field] = Number(req.body[field]);
            }
        });

        if (Array.isArray(req.body.tags)) {
            updates.tags = req.body.tags;
        }

        const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!trainer) {
            return res.status(404).json({ error: "Trainer nao encontrado" });
        }

        return res.json(trainer);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        const trainer = await Trainer.findByIdAndDelete(req.params.id);
        if (!trainer) {
            return res.status(404).json({ error: "Trainer nao encontrado" });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
