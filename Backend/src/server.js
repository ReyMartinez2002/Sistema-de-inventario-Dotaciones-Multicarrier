require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const empleadoRoutes = require('./routes/empleado.routes');
const dotacionRoutes = require('./routes/dotacion.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const port = process.env.PORT || 3001;

// Seguridad
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes. Intenta más tarde.'
}));

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/dotaciones', dotacionRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});

// Middleware de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
  console.log(`🌱 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
