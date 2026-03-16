const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true,
            default: null
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["cliente", "admin"],
            default: "cliente"
        },
        plan: {
            type: String,
            enum: ["basico", "extra", "premium", "admin"],
            default: "basico"
        },
        status: {
            type: String,
            enum: ["ativo", "inativo", "suspenso"],
            default: "ativo"
        },
        phone: {
            type: String,
            default: ""
        },
        lastActivity: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
