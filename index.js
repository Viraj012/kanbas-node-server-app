import express from 'express';
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kanbas/Users/routes.js";
import CourseRoutes from "./Kanbas/Courses/routes.js";
import ModuleRoutes from "./Kanbas/Modules/routes.js";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import AssignmentRoutes from './Kanbas/Assignments/routes.js';
import EnrollmentRoutes from "./Kanbas/Enrollments/routes.js";

// Initialize express app
const app = express();

// Validate environment variables
const requiredEnvVars = [
  'SESSION_SECRET',
  'NETLIFY_URL',
  'REMOTE_SERVER'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Warning: ${varName} not set in environment variables`);
  }
});

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NETLIFY_URL,
  process.env.REMOTE_SERVER
].filter(Boolean);

// 1. Configure CORS - MUST COME BEFORE ROUTES
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    console.log('Request Origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Rejected CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Body parsing middleware - MUST COME BEFORE ROUTES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session configuration - MUST COME BEFORE ROUTES
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

if (process.env.NODE_ENV === 'development') {
  console.log('Using development session configuration');
  sessionOptions.cookie.secure = false;
} else {
  console.log('Using production session configuration');
  app.set('trust proxy', 1);
  sessionOptions.cookie.secure = true;
  sessionOptions.cookie.sameSite = 'none';
}

app.use(session(sessionOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// 4. Routes - MUST COME AFTER ALL MIDDLEWARE
Hello(app);
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
Lab5(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// 5. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('\n=== Server Configuration ===');
  console.log(`Server running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log('Session cookie secure:', sessionOptions.cookie.secure);
  console.log('========================\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;