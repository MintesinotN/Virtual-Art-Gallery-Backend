import cloudinary from "../config/cloudinaryConfig.js";
import userModel from "../models/userModel.js";
import artworkModel from "../models/artworkModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { unlink } from "fs/promises";
// import sendEmail from '../utils/sendEmail.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Sign-up controller
export const registerUser = async (req, res) => {
  const { name, email, password, role, bio, description, socialLinks } =
    req.body;

  try {
    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    let formattedSocialLinks;

    if (socialLinks) {
      formattedSocialLinks = new Map(Object.entries(socialLinks));
    } else {
      formattedSocialLinks = new Map(); // Set to an empty Map instead of crashing
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle Image Upload
    let profilePic = "";
    let profilePicPublicId = "";

    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
      });

      // Delete the local file
      await unlink(req.file.path);

      // Store image details
      profilePic = result.secure_url;
      profilePicPublicId = result.public_id;
    }

    // Create a new user
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      bio,
      description,
      socialLinks: formattedSocialLinks,
      profilePic,
      profilePicPublicId,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password"); // Exclude password field
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, description, socialLinks } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle Image Upload if a file is provided
    let profilePic = user.profilePic; // Keep existing image by default
    let imagePublicId = user.imagePublicId; // Store public ID for deletion

    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
      });

      // Delete the local file
      await unlink(req.file.path);

      // Delete the old image from Cloudinary if it exists
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      // Store new image details
      profilePic = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Update user fields
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.description = description || user.description;
    user.socialLinks = socialLinks || user.socialLinks;
    user.profilePic = profilePic;
    user.imagePublicId = imagePublicId;

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const { artworkId } = req.params;

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.indexOf(artworkId);
    if (index > -1) {
      user.favorites.splice(index, 1); // Remove favorite if already exists
    } else {
      user.favorites.push(artworkId); // Add favorite if not exists
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Error updating favorites", error });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
};

export const getArtistProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await userModel.findById(id).select("-password"); // Exclude password field

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const artworks = await artworkModel.find({ artist: id });

    res.status(200).json({ artist, artworks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching artist profile", error });
  }
};

// Account deletion request controller
// export const requestAccountDeletion = async (req, res) => {
//   try {
//     // Check if the user exists
//     const user = await userModel.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Send confirmation email
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const deleteLink = `${process.env.FRONTEND_URL}/confirm-delete?token=${token}`;

//     // Send email
//     await sendEmail(user.email, 'Confirm Account Deletion', `Click here to delete your account: ${deleteLink}`);

//     res.status(200).json({ message: 'Confirmation email sent' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error sending email', error });
//   }
// };

// Account deletion confirmation controller
// export const confirmAccountDeletion = async (req, res) => {
//   try {
//     // Check if the token is valid
//     const { token } = req.body;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Delete the user
//     await userModel.findByIdAndDelete(decoded.id);

//     res.status(200).json({ message: 'Account deleted successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Invalid or expired token' });
//   }
// };
