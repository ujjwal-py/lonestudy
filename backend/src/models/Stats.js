import mongoose from "mongoose";

export const statsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    total_completed: {
        type: Number,
        default: 0
    },
    total_time: {
        type: Number,
        default: 0
    },
    tasks_completed: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Task",
        default: []
    }
}, {timestamps: true});

export default mongoose.model("Stats", statsSchema);