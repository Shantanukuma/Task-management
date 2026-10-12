const express = require("express");
const pool = require("./db/pool");
const env = require("./config/env");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();
app.use(express.json());
app.use(cors());



app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Backend and database are connected",
            databaseTime: result.rows[0].now,
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
});