import express from 'express';
import upload from '../config/multerConfig.js';
import { uploadArtwork, getArtworks } from '../controllers/artworkController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const artworkRouter = express.Router();

artworkRouter.post('/', authMiddleware, upload.single('image'), uploadArtwork);  // Create artwork
artworkRouter.get('/', getArtworks);     // Get all artworks

export default artworkRouter;
