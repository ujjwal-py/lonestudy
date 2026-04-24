import Stats from "../models/Stats.js"
import Task from "../models/Task.js"
import ApiError from "../utils/apiError.js";



export const updateStats = async (req, res) => {
    const stats = await Stats.findById(req.body.stats_id);
    if(!stats){
        throw new ApiError(404, "Stats not found");
    }
    stats.total_completed += 1;
    stats.tasks_completed.push(req.body.task_id);
    await stats.save();
    res.status(200).json({ stats });

}

export const getStats = async (req, res) => {
        const user_id = req.user.user_id;
        const now = new Date();

        // Completed tasks should remain in stats even after soft delete.
        const completedTasks = await Task.find({
            user_id,
            status: 'completed'
        });

        // Define date ranges
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        // does not move historical stats into a different day/week/month.
        const filterByDateRange = (tasks, startDate, endDate) => 
            tasks.filter(task => {
                const completedOn = task.completedAt || task.updatedAt;
                return completedOn >= startDate && completedOn <= endDate;
            });

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
}
