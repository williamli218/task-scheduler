import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});