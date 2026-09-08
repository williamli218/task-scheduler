import express, { Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Task" WHERE user_id = $1 ORDER BY due_date ASC', [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, dueDate, categoryId } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const result = await pool.query(
            'INSERT INTO "Task" (title, description, due_date, user_id, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, description || null, dueDate || null, req.userId, categoryId || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, completed, categoryId } = req.body;

        const result = await pool.query(
            'UPDATE "Task" SET title = $1, description = $2, due_date = $3, completed = $4, category_id = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [title, description || null, dueDate || null, completed, categoryId || null, id, req.userId]

        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM "Task" WHERE id = $1 and user_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;