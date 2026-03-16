const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB ligado com sucesso.");
}

module.exports = connectDatabase;
