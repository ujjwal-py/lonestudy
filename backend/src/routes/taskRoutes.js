import express from "express";
import { createTask, displayTasks, updateTask, deleteTask, addTime, addCycle } from "../controllers/taskController.js";
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

export default router;