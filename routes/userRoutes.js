import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();

// Route for registering a new user
userRouter.post('/register', registerUser);

// Route for logging in an existing user
userRouter.post('/login', loginUser);

export default userRouter;
