const User = require("../models/User");
const { hashPassword } = require("../utils/password");

async function ensureDefaultAdmin() {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
        return existingAdmin;
    }

    const admin = await User.create({
        name: "Administrador",
        username: "beastadmin",
        email: "admin@beastcenter.com",
        passwordHash: hashPassword("admin123"),
        role: "admin",
        plan: "admin",
        status: "ativo"
    });

    console.log("Admin inicial criado: beastadmin");
    return admin;
}

module.exports = {
    ensureDefaultAdmin
};
