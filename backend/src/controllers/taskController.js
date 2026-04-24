import Task from "../models/Task.js";
import Stats from "../models/Stats.js";
import { taskSchema } from "../validators/validators.js";
import ApiError from "../utils/apiError.js";

export const createTask = async (req, res) => {
    const task = await Task.create({
        ...req.body,
        user_id: req.user.user_id
    });
    res.status(201).json({ task });

}

export const displayTasks = async (req, res) => {
    const query = { user_id: req.user.user_id, deleted: { $ne: true } };
    if (req.query.status) {
        query.status = req.query.status;
    }
    const tasks = await Task.find(query);
    res.status(200).json({ tasks });
}

export const updateTask = async (req, res) => {
    const existingTask = await Task.findOne({ _id: req.params.id, user_id: req.user.user_id });
    if (!existingTask) {
        throw new ApiError(404, "Task not found");
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

}

export const deleteTask = async (req, res) => {
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.user_id },
        { deleted: true },
        { new: true }
    );
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    res.status(200).json({ task });
}

export const updateTimeElapsed = async (req, res) => {
    const task = await Task.findById(req.body.id);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
    task.time_elapsed += req.body.time_elapsed;
    await task.save();
    res.status(200).json({ task });
}

export const addTime = async(req, res) => {
    const task = await Task.findById(req.body.id);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
    task.time_elapsed += req.body.time_elapsed;
    await task.save();
    res.status(200).json({ task });
}

export const addCycle = async(req, res) => {
    const task = await Task.findById(req.body.id);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
    task.cycles_completed += req.body.cycles_completed;
    await task.save();
    res.status(200).json({ task });

}


export const seeDecoded = async (req, res) => {
    res.status(200).json({user: req.user});
}

