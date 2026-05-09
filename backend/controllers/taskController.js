const db = require("../db");

// CREATE TASK
exports.createTask = (req, res) => {
    const { title, description, due_date } = req.body;
    const user_id = req.user.id;

    const sql = "INSERT INTO tasks (title, description, due_date, user_id) VALUES (?, ?, ?, ?)";

    db.query(sql, [title, description, due_date, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating task" });
        res.json({ message: "Task created successfully ✅" });
    });
};

// GET ALL TASKS (for logged-in user only)
exports.getTasks = (req, res) => {
    const user_id = req.user.id;

    const sql = "SELECT * FROM tasks WHERE user_id = ?";
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching tasks" });
        res.json(results);
    });
};

// UPDATE TASK
exports.updateTask = (req, res) => {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;
    const user_id = req.user.id;

    const sql = `
        UPDATE tasks 
        SET 
          title = COALESCE(NULLIF(?, ''), title),
          description = COALESCE(NULLIF(?, ''), description),
          status = COALESCE(NULLIF(?, ''), status),
          due_date = COALESCE(NULLIF(?, ''), due_date)
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [title, description, status, due_date, id, user_id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating task" });
        res.json({ message: "Task updated successfully ✅" });
    });
};

// DELETE TASK
exports.deleteTask = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";

    db.query(sql, [id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting task" });
        res.json({ message: "Task deleted successfully ✅" });
    });
};