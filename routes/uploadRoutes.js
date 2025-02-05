import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js";

const uploadRouter = express.Router();

uploadRouter.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
                if (error) return res.status(500).json({ error: error.message });
                res.status(200).json({ imageUrl: result.secure_url });
            }
        ).end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default uploadRouter;
