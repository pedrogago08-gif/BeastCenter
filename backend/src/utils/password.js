const crypto = require("crypto");

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return salt + ":" + hash;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || storedHash.indexOf(":") === -1) {
        return false;
    }

    const parts = storedHash.split(":");
    const salt = parts[0];
    const originalHash = parts[1];
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

module.exports = {
    hashPassword,
    verifyPassword
};
