import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// 1. CORS Configuration for HTTP-Only Cookie Support
const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true, // Required for HTTP-Only cookies across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Enables req.cookies for JWT extraction

// 3. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// 5. 44 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// 6. Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors,
    });
  }

  // Handle Mongoose Duplicate Key Error (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `A record with that ${field} already exists.`,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;