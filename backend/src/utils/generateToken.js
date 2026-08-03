import jwt from 'jsonwebtoken';

export const generateAndSetTokens = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // Must be true in production for HTTPS cross-domain cookies
    sameSite: isProduction ? 'none' : 'lax', // Must be 'none' for cross-domain Vercel apps
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};