import jwt from "jsonwebtoken";


export const protect = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({error: "Unauthorized"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user_id;
        next();
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


