import express from "express";
import { createTask, displayTasks, updateTask, deleteTask, addTime, addCycle, seeDecoded, updateTimeElapsed } from "../controllers/taskController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { taskSchema } from "../validators/validators.js";
import { asynHandler } from "../middleware/asyncMiddleware.js";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello World");
})
router.post("/create", protect, validate(taskSchema), createTask);
router.get("/display", protect, displayTasks);
router.put("/update/:id", protect, validate(taskSchema), updateTask);
router.delete("/delete/:id", protect, deleteTask);
router.put("/addTime", protect, addTime);
router.put("/addCycle", protect, addCycle);
router.put("/update-time", protect, updateTimeElapsed);

router.get("/seeuser", protect, seeDecoded);

export default router;