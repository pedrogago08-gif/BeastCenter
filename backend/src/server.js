const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/database");
const { ensureDefaultAdmin } = require("./services/bootstrap");

async function startServer() {
    try {
        await connectDatabase();
        await ensureDefaultAdmin();
        app.listen(env.port, "0.0.0.0", function () {
            console.log("API BeastCenter a correr na porta " + env.port);
        });
    } catch (error) {
        console.error("Falha ao iniciar a API:", error.message);
        process.exit(1);
    }
}

startServer();
