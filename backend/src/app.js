const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const trainerRoutes = require("./routes/trainer.routes");
const classRoutes = require("./routes/class.routes");

const app = express();
const projectRoot = path.resolve(__dirname, "..", "..");

app.use(
    cors({
        origin: env.clientOrigin === "*" ? true : env.clientOrigin
    })
);
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/classes", classRoutes);

app.use(express.static(path.join(projectRoot, "Pages")));
app.use("/Pages", express.static(path.join(projectRoot, "Pages")));
app.use("/Style", express.static(path.join(projectRoot, "Style")));
app.use("/Script", express.static(path.join(projectRoot, "Script")));
app.use("/images", express.static(path.join(projectRoot, "images")));

app.get("/", function (req, res) {
    res.sendFile(path.join(projectRoot, "Pages", "Index.html"));
});

app.use(function (req, res) {
    res.status(404).json({
        error: "Rota nao encontrada"
    });
});

app.use(function (error, req, res, next) {
    console.error(error);

    if (error && error.code === 11000) {
        return res.status(409).json({
            error: "Ja existe um registo com esses dados"
        });
    }

    res.status(500).json({
        error: "Erro interno do servidor"
    });
});

module.exports = app;
