const pool = require("../db/pool");


const createTask = async (req, res) => {
  try {
    const { title, description, priority = "Medium" } = req.body;
    const userId = req.user.userId;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const allowedPriorities = ["Low", "Medium", "High"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be Low, Medium, or High",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, description,
                 completed, priority, created_at`,
      [userId, title.trim(), description || null, priority]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, title, description, completed,
              priority, created_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};







module.exports = {
  createTask,
  getTasks,
  deleteTask
};

