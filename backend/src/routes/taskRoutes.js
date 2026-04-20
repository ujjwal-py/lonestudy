import express from "express";
import { createTask, displayTasks, updateTask, deleteTask, addTime, addCycle, seeDecoded, updateTimeElapsed } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello World");
})
router.post("/create", protect, createTask);
router.get("/display", protect, displayTasks);
router.put("/update/:id", protect, updateTask);
router.delete("/delete/:id", protect, deleteTask);
router.put("/addTime", protect, addTime);
router.put("/addCycle", protect, addCycle);
router.put("/update-time", protect, updateTimeElapsed);

router.get("/seeuser", protect, seeDecoded);

export default router;