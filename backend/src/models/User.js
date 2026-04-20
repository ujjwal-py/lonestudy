import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        unique: true,
        required: true
    }, 
    username : {
        type: String, 
        unique: true,
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    time_studied: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true})

export default mongoose.model("User", userSchema);
