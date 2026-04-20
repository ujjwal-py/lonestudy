import Task from "../models/Task.js";
import Stats from "../models/Stats.js";
import { taskSchema } from "../validators/validators.js";

export const createTask = async (req, res) => {
    try {
        const validate = taskSchema.safeParse(req.body);
        if (!validate.success) {
            return res.status(400).json({ error: validate.error.issues });
        }
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
        const validate = taskSchema.safeParse(req.body);
        if (!validate.success) {
            return res.status(400).json({ error: validate.error.issues });
        }
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
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

