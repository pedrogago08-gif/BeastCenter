const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/beastcenter",
    clientOrigin: process.env.CLIENT_ORIGIN || "*"
};

module.exports = env;
