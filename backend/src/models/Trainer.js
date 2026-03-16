const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        experience: {
            type: Number,
            default: 0,
            min: 0
        },
        clients: {
            type: Number,
            default: 0,
            min: 0
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        status: {
            type: String,
            enum: ["ativo", "inativo"],
            default: "ativo"
        },
        image: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Trainer", trainerSchema);
