import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {userSchema} from "../validators/validators.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async(req, res) => {
    try {
        const {email, username} = req.body.email;
        const isExist = await User.findOne({email});
        if(isExist){
            return res.status(400).json({error: "Email has been used"});
        }
        const notUnique = await User.findOne({username}).select("+password");
        if(notUnique){
            return res.status(400).json({error: "Username has been used"});
        }
        const validate = userSchema.safeParse(req.body);
        if(!validate.success){
            return res.status(400).json({error: validate.error.issues});
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
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "User not found"});
        }
        const validate = userSchema.safeParse(req.body);
        if(!validate.success){
            return res.status(400).json({error: validate.error.issues});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({error: "Invalid password"});
        }

        const token = generateToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({msg: "User logged in successfully"});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}