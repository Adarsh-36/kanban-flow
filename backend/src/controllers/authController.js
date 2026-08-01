import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateAndSetTokens } from '../utils/generateToken.js';
import CustomError from '../utils/customError.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new CustomError('Please provide all required fields', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('User already exists with this email', 400);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'MEMBER',
    });

    generateAndSetTokens(res, user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token in cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError('Please enter email and password', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    generateAndSetTokens(res, user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / Clear Cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Instantly expire cookie
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};