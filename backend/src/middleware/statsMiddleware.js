import Stats from "../models/Stats.js";


export const newDay  = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const today = new Date().toISOString().split("T")[0];
        const isExist = await Stats.findOne({ user_id: user_id, date: today });
        if (!isExist) {
            const newDate = await Stats.create({
                user_id: user_id,
                date: today
            });
            req.body.stats_id = newDate._id;
            return next();
        }
        req.body.stats_id = isExist._id;
        next();
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}