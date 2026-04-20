import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    cycles_required : {
        type: Number,
        required: true,
        default: 4,
    },
    cycles_completed: {
        type: Number,
        default: 0
    },
    time_elapsed : {
        type:Number,
        default: 0
    },
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

export default mongoose.model("Task", taskSchema);