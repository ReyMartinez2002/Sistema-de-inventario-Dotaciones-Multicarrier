require('dotenv').config();
console.log('JWT_SECRET cargado:', process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importación de rutas
const authRoutes = require('./routes/auth.routes');
const users = require('./routes/users');
const dotacionRoutes = require('./routes/dotacion.routes');
const rolesRoutes = require('./routes/roles');

// Middlewares
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const port = process.env.PORT || 3001;

// 1. Configuración de Seguridad
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de peticiones
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.'
  }
}));

// 2. Configuración CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 3. Middlewares de parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Configuración de rutas
const apiRouter = express.Router();

// Rutas públicas
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Rutas protegidas
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', users);
apiRouter.use('/dotaciones', dotacionRoutes);
apiRouter.use('/roles', rolesRoutes);

// Montar todas las rutas bajo /api
app.use('/api', apiRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Gestión de Dotaciones EPP');
});

// 5. Manejo de errores
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada' 
  });
});

app.use(errorHandler);

// 6. Inicio del servidor
const server = app.listen(port, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${port}`);
});

// Manejo de errores de servidor
server.on('error', (error) => {
  console.error('Error en el servidor:', error);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = server;