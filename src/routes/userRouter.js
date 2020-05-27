import express from "express";
import { userRegistration, userLogin } from "../controllers/userController";

const router = express.Router();

router.post("/", userRegistration);
router.post("/login", userLogin);

export default router;
