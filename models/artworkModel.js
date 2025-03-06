import mongoose from "mongoose";

const ArtworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    imageUrl: { type: String, required: true }, // Store Cloudinary URL
    imagePublicId: { type: String, required: true }, // Store Cloudinary public ID
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User model
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    averageRating: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

const artworkModel =
  mongoose.models.Artwork || mongoose.model("Artwork", ArtworkSchema);

export default artworkModel;
