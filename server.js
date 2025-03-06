import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import DB config
import userRouter from "./routes/userRoutes.js";
import artworkRouter from "./routes/artworkRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api", uploadRouter);

app.use("/api/users", userRouter);
app.use("/api/artworks", artworkRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
