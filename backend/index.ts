import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import eventRoutes from "./routes/events";
import categoryRoutes from "./routes/categories";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/events", eventRoutes);
app.use("/categories", categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});