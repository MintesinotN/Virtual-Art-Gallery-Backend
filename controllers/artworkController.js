import cloudinary from '../config/cloudinaryConfig.js';
import artworkModel from '../models/artworkModel.js';

export const uploadArtwork = async (req, res) => {
  try {
    const image = req.file; // File from Multer

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.path, {
      folder: 'virtual-art-gallery',
    });

    // Save artwork details in MongoDB
    const newArtwork = new artworkModel({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      imageUrl: result.secure_url, // Cloudinary URL
      artist: req.user.id, // Assuming user ID is stored in req.user
    });

    await newArtwork.save();

    res.status(201).json({ message: 'Artwork uploaded successfully', artworkModel: newArtwork });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error });
  }
};

export const getArtworks = async (req, res) => {
  try {
    const artworks = await artworkModel.find();
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks', error });
  }
};