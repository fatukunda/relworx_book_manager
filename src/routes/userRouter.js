import express from "express";
import { userRegistration, userLogin, userProfile } from "../controllers/userController";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/", userRegistration);
router.post("/login", userLogin);
router.get("/profile", auth, userProfile);

export default router;
