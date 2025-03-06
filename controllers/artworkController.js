import cloudinary from "../config/cloudinaryConfig.js";
import artworkModel from "../models/artworkModel.js";
import userModel from "../models/userModel.js";
import { unlink } from "fs/promises";

export const uploadArtwork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "virtual-art-gallery",
    });

    // Delete the local file
    await unlink(req.file.path);

    // Save artwork details in MongoDB
    const newArtwork = new artworkModel({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      imageUrl: result.secure_url, // Cloudinary URL
      imagePublicId: result.public_id, // Cloudinary public ID
      artist: req.user.id, // Assuming user ID is stored in req.user
    });

    await newArtwork.save();

    res
      .status(201)
      .json({ message: "Artwork uploaded successfully", artwork: newArtwork });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error });
  }
};

export const getArtworks = async (req, res) => {
  try {
    const artworks = await artworkModel.find().populate("artist", "name"); // Populate artist name
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching artworks", error });
  }
};

export const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const artwork = await artworkModel.findById(id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user is owner or admin
    if (
      artwork.artist.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this artwork" });
    }

    // **Delete from Cloudinary before removing from DB**
    await cloudinary.uploader.destroy(artwork.imagePublicId);

    await artworkModel.findByIdAndDelete(id);
    res.json({ message: "Artwork deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting artwork", error });
  }
};

export const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;
    const artwork = await artworkModel.findById(id).populate("artist", "name");

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json(artwork);
  } catch (error) {
    res.status(500).json({ message: "Error fetching artwork", error });
  }
};

export const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const artwork = await artworkModel.findById(id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if the user is the owner
    if (artwork.artist.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this artwork" });
    }

    // If a new image is uploaded, delete the old one from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(artwork.imagePublicId);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "virtual-art-gallery",
      });

      // Delete the local file
      await unlink(req.file.path);

      artwork.imageUrl = result.secure_url;
      artwork.imagePublicId = result.public_id;
    }

    // Update artwork details
    artwork.title = title || artwork.title;
    artwork.description = description || artwork.description;
    artwork.category = category || artwork.category;

    await artwork.save();

    res.status(200).json({ message: "Artwork updated successfully", artwork });
  } catch (error) {
    res.status(500).json({ message: "Error updating artwork", error });
  }
};

export const rateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const artwork = await artworkModel.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user already rated
    const existingRating = artwork.ratings.find(
      (r) => r.user.toString() === req.user.id
    );
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      artwork.ratings.push({ user: req.user.id, rating });
    }

    // Calculate new average rating
    const totalRating = artwork.ratings.reduce((sum, r) => sum + r.rating, 0);
    artwork.averageRating = totalRating / artwork.ratings.length;

    await artwork.save();
    res.status(200).json({ message: "Rating submitted", artwork });
  } catch (error) {
    res.status(500).json({ message: "Error rating artwork", error });
  }
};

export const toggleLikeArtwork = async (req, res) => {
  try {
    const { id } = req.params; // Artwork ID
    const userId = req.user.id; // Logged-in User ID

    const user = await userModel.findById(userId);
    const artwork = await artworkModel.findById(id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    let isLiked = user.likedArtworks.get(id) || false; // Default to false if not found

    if (isLiked) {
      // If already liked, remove the like
      user.likedArtworks.set(id, false);
      artwork.likesCount -= 1;
    } else {
      // If not liked, add like
      user.likedArtworks.set(id, true);
      artwork.likesCount += 1;
    }

    await user.save();
    await artwork.save();

    res.status(200).json({
      message: isLiked ? "Like removed" : "Artwork liked",
      likedByUser: !isLiked,
      likesCount: artwork.likesCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error });
  }
};
