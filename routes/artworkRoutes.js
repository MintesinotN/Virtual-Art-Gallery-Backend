import express from "express";
import upload from "../config/multerConfig.js";
import {
  uploadArtwork,
  getArtworks,
  getArtworkById,
  deleteArtwork,
  updateArtwork,
  rateArtwork,
  toggleLikeArtwork,
} from "../controllers/artworkController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const artworkRouter = express.Router();

artworkRouter.post(
  "/",
  authMiddleware,
  authorizeRoles("artist", "admin"),
  upload.single("artwork"),
  uploadArtwork
); // Create artwork
artworkRouter.get("/", getArtworks); // Get all artworks
artworkRouter.get("/:id", getArtworkById); // Get artwork by ID
artworkRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles("artist", "admin"),
  upload.single("artwork"),
  updateArtwork
); // Update artwork
artworkRouter.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("artist", "admin"),
  deleteArtwork
); // Delete artwork
artworkRouter.post("/:id/rate", authMiddleware, rateArtwork); // Rate artwork
artworkRouter.post("/:id/like", authMiddleware, toggleLikeArtwork); // Like/Unlike artwork

export default artworkRouter;
