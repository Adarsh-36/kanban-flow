import jwt from 'jsonwebtoken';

export const generateAndSetTokens = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS script access
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'strict', // Mitigates CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};