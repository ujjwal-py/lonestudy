import express from "express";
import { registerUser, loginUser, logoutUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { userSchema, userLogin } from "../validators/validators.js";


const router = express.Router();

router.post("/register", validate(userSchema), registerUser);
router.post("/login", validate(userLogin), loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
