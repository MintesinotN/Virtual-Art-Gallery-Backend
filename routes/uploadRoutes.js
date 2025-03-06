import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js";

const uploadRouter = express.Router();

uploadRouter.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error });
  }
});

export default uploadRouter;
