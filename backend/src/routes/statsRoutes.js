import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { newDay } from "../middleware/statsMiddleware.js";
import { updateStats, getStats } from "../controllers/statsController.js";
const router = express.Router();

router.post("/update", protect, newDay, updateStats);
router.get("/", protect, getStats);

export default router;
