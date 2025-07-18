const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

// Registro de usuario (solo superadmin)
router.post('/register', authenticateToken, allowRoles('superadmin'), authController.register);

module.exports = router;