import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CustomError from '../utils/customError.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new CustomError('Not authorized, token missing', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return next(new CustomError('User not found', 404));
    }
    next();
  } catch (error) {
    return next(new CustomError('Not authorized, token invalid', 401));
  }
};