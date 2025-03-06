import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    description: { type: String, default: "" },
    profilePic: { type: String }, // Cloudinary URL for profile picture
    profilePicPublicId: { type: String },
    socialLinks: { type: Map, of: String }, // Map of social media links
    role: { type: String, enum: ["user", "artist", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
    likedArtworks: { type: Map, of: Boolean, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
