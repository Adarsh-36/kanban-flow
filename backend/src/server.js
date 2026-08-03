import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

// Connect DB once
connectDB();


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;