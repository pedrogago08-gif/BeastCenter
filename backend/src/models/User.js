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
            default: undefined
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
            enum: ["none", "basico", "extra", "premium", "admin"],
            default: "none"
        },
        planStatus: {
            type: String,
            enum: ["none", "pending_payment", "active", "cancelled"],
            default: "none"
        },
        paymentStatus: {
            type: String,
            enum: ["none", "pending", "paid", "failed"],
            default: "none"
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
        authProvider: {
            type: String,
            enum: ["local", "google", "facebook"],
            default: "local"
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
