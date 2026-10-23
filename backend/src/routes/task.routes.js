const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const { createTask, getTasks, deleteTask } = require("../controllers/task.controller");

const router = express.Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.delete("/:id", authenticateToken, deleteTask);

module.exports = router;