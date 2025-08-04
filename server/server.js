if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "./config/.env",
    });
}

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const cors = require('cors');
// const connectDB = require('./db/db_connection.js')

// Routes 
const userRoutes = require('./routes/user/user_routes.js');
const apiRoutes = require('./routes/api/api_routes.js');
const aiRoutes = require('./routes/ai/ai_routes.js'); // Nueva ruta de IA

const app = express();
const port = process.env.PORT || 3030;

// App use middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Agregado puerto adicional
    credentials: true,
}));
  
// Session configuration
app.use(session({
  secret: process.env.SECRET || 'fallback-secret-key', // Fallback para desarrollo
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  } 
}));

// Rate limiting para rutas de IA (opcional)
const rateLimit = require('express-rate-limit');
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests per IP
  message: {
    success: false,
    error: 'Demasiadas consultas, intenta de nuevo en 15 minutos'
  }
});

// Middleware de logging personalizado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/api', userRoutes);
app.use('/apiv1', apiRoutes);
app.use('/ai', aiLimiter, aiRoutes); 

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AI-Powered E-commerce API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/*',
            api: '/apiv1/*',
            ai: '/ai/*',
            health: '/health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error Global:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'PRODUCTION' 
            ? 'Error interno del servidor' 
            : err.message,
        timestamp: new Date().toISOString()
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        message: 'La ruta solicitada no existe'
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Health Check: http://localhost:${port}/health`);
});