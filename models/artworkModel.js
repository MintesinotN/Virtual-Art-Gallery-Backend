import mongoose from 'mongoose';

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  imageUrl: { type: String, required: true }, // Store Cloudinary URL
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
});

const artworkModel = mongoose.models.Artwork || mongoose.model('Artwork', ArtworkSchema);
export default artworkModel;
