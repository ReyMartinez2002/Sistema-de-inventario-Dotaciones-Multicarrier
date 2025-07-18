require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const empleadoRoutes = require('./routes/empleado.routes');
const dotacionRoutes = require('./routes/dotacion.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/dotaciones', dotacionRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/auditoria', auditoriaRoutes);

app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});