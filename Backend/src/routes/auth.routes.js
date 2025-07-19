const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../models/user.model'); // Añade esta línea
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

// Endpoint público para crear el primer superadmin si no existe
router.post('/setup-first-admin', async (req, res, next) => {
  try {
    const superadminExists = await User.checkSuperadminExists(); // Cambia esta línea
    if (superadminExists) {
      return res.status(403).json({ error: 'Ya existe un superadmin en el sistema' });
    }
    // Temporalmente deshabilitar autenticación para este caso específico
    req.usuario = { rol: 'system' };
    next();
  } catch (error) {
    next(error);
  }
}, authController.register);

// Endpoint normal de registro (protegido)
router.post('/register', authenticateToken, allowRoles('superadmin'), authController.register);

// Endpoints públicos
router.post('/login', authController.login);
router.get('/usuarios', authController.getUsuarios);

module.exports = router;