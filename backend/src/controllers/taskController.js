import Task from "../models/Task.js";
import Stats from "../models/Stats.js";
import { taskSchema } from "../validators/validators.js";

export const createTask = async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            user_id: req.user.user_id
        });
        res.status(201).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const displayTasks = async (req, res) => {
    try {
        const query = { user_id: req.user.user_id, deleted: { $ne: true } };
        if (req.query.status) {
            query.status = req.query.status;
        }
        const tasks = await Task.find(query);
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateTask = async (req, res) => {
    try {
        const existingTask = await Task.findOne({ _id: req.params.id, user_id: req.user.user_id });
        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        const updateData = { ...req.body };

        if (existingTask.status !== "completed" && req.body.status === "completed") {
            updateData.completedAt = new Date();
        }

        if (req.body.status !== "completed" && existingTask.status === "completed") {
            updateData.completedAt = null;
        }

        const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.user_id },
            { deleted: true },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateTimeElapsed = async (req, res) => {
    try {
        const task = await Task.findById(req.body.id);
        if(!task){
            return res.status(400).json({error: "Task not found"});
        }
        task.time_elapsed += req.body.time_elapsed;
        await task.save();
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addTime = async(req, res) => {
    try {
        const task = await Task.findById(req.body.id);
        if(!task){
            return res.status(400).json({error: "Task not found"});
        }
        task.time_elapsed += req.body.time_elapsed;
        await task.save();
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addCycle = async(req, res) => {
    try {
        const task = await Task.findById(req.body.id);
        if(!task){
            return res.status(400).json({error: "Task not found"});
        }
        task.cycles_completed += req.body.cycles_completed;
        await task.save();
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export const seeDecoded = async (req, res) => {
    res.status(200).json({user: req.user});
}

