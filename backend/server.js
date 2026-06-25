import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/connections/db.js";
import authRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV === "development";
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/stats", statsRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (isDevelopment) {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});


connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || "production"} mode`);
});
