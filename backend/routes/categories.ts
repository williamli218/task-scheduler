import express, { Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Category" WHERE user_id = $1 ORDER BY name ASC', 
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
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const result = await pool.query(
            'INSERT INTO "Category" (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
            [name, color || null, req.userId]
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
        const { name, color } = req.body;

        const result = await pool.query(
            'UPDATE "Category" SET name = $1, color = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [name, color || null, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
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
            'DELETE FROM "Category" WHERE id = $1 and user_id = $2 RETURNING *',
            [id, req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted" });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

export default router;