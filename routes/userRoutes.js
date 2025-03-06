import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  toggleFavorite,
  getUserFavorites,
  getArtistProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multerConfig.js";

const userRouter = express.Router();

// Route for registering a new user
userRouter.post("/register", upload.single("profilePic"), registerUser);

// Route for logging in an existing user
userRouter.post("/login", loginUser);

// Route for getting user profile
userRouter.get("/profile", authMiddleware, getProfile);

// Route for updating user profile
userRouter.put(
  "/profile",
  authMiddleware,
  upload.single("profilePic"),
  updateProfile
);

// Route for toggling favorite
userRouter.post("/favorites/:artworkId", authMiddleware, toggleFavorite);

// Route for getting user favorites
userRouter.get("/favorites", authMiddleware, getUserFavorites);

// Route for getting artist profile
userRouter.get("/artist/:id", getArtistProfile);

// Route for requesting account deletion
// userRouter.post('/request-delete', authMiddleware, requestAccountDeletion);

// Route for confirming account deletion
// userRouter.post('/confirm-delete', confirmAccountDeletion);

export default userRouter;
