import express from "express";
import { multerUploads } from "../middleware/multer";
import { cloudinaryConfig } from "../config/cloudinary";
import {
  createBook,
  imageUpload,
  getAllUserBooks,
  fetchSingleUserBook,
} from "../controllers/bookController";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/", auth, multerUploads, cloudinaryConfig, createBook);
router.put(
  "/:id/image-upload",
  auth,
  multerUploads,
  cloudinaryConfig,
  imageUpload
);
router.get("/", auth, getAllUserBooks);
router.get("/:id", auth, fetchSingleUserBook);

export default router;
