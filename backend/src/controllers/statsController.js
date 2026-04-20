import Stats from "../models/Stats.js"
import Task from "../models/Task.js"



export const updateStats = async (req, res) => {
    try {
        const stats = await Stats.findById(req.body.stats_id);
        if(!stats){
            return res.status(400).json({error: "Stats not found"});
        }
        stats.total_completed += 1;
        stats.tasks_completed.push(req.body.task_id);
        await stats.save();
        res.status(200).json({ stats });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const getStats = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const now = new Date();

        // Get all completed tasks for this user (excluding deleted)
        const completedTasks = await Task.find({ user_id, status: 'completed', deleted: { $ne: true } });

        // Define date ranges
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        // Filter tasks by completion date (using updatedAt field)
        const filterByDateRange = (tasks, startDate, endDate) => 
            tasks.filter(task => task.updatedAt >= startDate && task.updatedAt <= endDate);

        const todayTasks = filterByDateRange(completedTasks, todayStart, now);
        const weekTasks = filterByDateRange(completedTasks, weekStart, now);
        const monthTasks = filterByDateRange(completedTasks, monthStart, now);

        // Helper to aggregate stats from tasks
        const aggregateStats = (tasks) => ({
            total_completed: tasks.length,
            total_time: tasks.reduce((acc, task) => acc + task.time_elapsed, 0),
            tasks_completed: tasks.map(t => ({ _id: t._id, title: t.title }))
        });

        res.status(200).json({
            today: aggregateStats(todayTasks),
            week: aggregateStats(weekTasks),
            month: aggregateStats(monthTasks)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}