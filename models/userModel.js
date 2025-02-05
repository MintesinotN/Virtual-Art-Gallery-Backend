import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  profilePic: { type: String }, // Cloudinary URL for profile picture
  socialLinks: [String], // Array of social media links
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
