import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateAndSetTokens } from '../utils/generateToken.js';
import CustomError from '../utils/customError.js';

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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'MEMBER',
    });

    const token = generateAndSetTokens(res, user._id);

    res.status(201).json({
      success: true,
      token,
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

    const token = generateAndSetTokens(res, user._id);

    res.status(200).json({
      success: true,
      token,
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

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  };

  res.cookie('token', '', cookieOptions);
  res.cookie('jwt', '', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};