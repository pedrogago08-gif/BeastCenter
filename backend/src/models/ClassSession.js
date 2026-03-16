const mongoose = require("mongoose");

const classSessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        trainerName: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            default: ""
        },
        dayOfWeek: {
            type: String,
            required: true,
            enum: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
        },
        time: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            default: 45,
            min: 15
        },
        capacity: {
            type: Number,
            default: 20,
            min: 1
        },
        enrolledCount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ["ativa", "inativa"],
            default: "ativa"
        },
        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ClassSession", classSessionSchema);
