import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CustomError from '../utils/customError.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;

    // Optional fallback: Check Bearer token in Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new CustomError('Not authorized, token missing', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req object excluding passwordHash
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      throw new CustomError('User not found or account deactivated', 401);
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new CustomError('Invalid token authorization', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError('Token expired, please login again', 401));
    }
    next(error);
  }
};