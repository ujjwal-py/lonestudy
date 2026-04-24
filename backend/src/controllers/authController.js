import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import ApiError from "../utils/apiError.js";

export const registerUser = async(req, res) => {
    const {email, username} = req.body;
    const isExist = await User.findOne({email});
    if(isExist){
        throw new ApiError(409, "Email already in use")
    }
    const notUnique = await User.findOne({username});
    if(notUnique){
        throw new ApiError(409, "Username already in use")
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const user = await User.create(req.body);

    // token gen and set
    const token = generateToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(201).json({msg: "User created successfully"});
}

export const loginUser = async(req, res) => {

    const {email, password} = req.body;
    const user = await User.findOne({email}).select("+password");
    if(!user){
        throw new ApiError(404, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new ApiError(401, "Unauthorized");
    }
    const token = generateToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(200).json({msg: "User logged in successfully"});

}

export const logoutUser = async(req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0)
    });
    res.status(200).json({msg: "Logged out successfully"});
}

export const getMe = async(req, res) => {

    const user = await User.findById(req.user.user_id);
    if(!user){
        throw new ApiError(404, "Unauthorized");
    }
    res.status(200).json({user});

}