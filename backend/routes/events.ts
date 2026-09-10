import express, { Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Event" WHERE user_id = $1 ORDER BY start_time ASC', 
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, startTime, endTime, location, recurring, categoryId } = req.body;
        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: "Title, start time and end time are required" })
        }

        const result = await pool.query(
            'INSERT INTO "Event" (title, description, start_time, end_time, location, recurring, user_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [title, description || null, startTime, endTime, location || null, recurring || false, req.userId, categoryId || null]
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
        const { title, description, startTime, endTime, location, recurring, categoryId } = req.body;

        const result = await pool.query(
            'UPDATE "Event" SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, recurring = $6, category_id = $7 WHERE id = $8 AND user_id = $9 RETURNING *',
            [title, description || null, startTime, endTime, location || null, recurring || false, categoryId || null, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
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
            'DELETE FROM "Event" WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;