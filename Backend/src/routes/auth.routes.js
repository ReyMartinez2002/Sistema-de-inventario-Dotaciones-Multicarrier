const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Crear primer superadmin
router.post('/setup-first-admin', validate(registerSchema), authController.register);

// Registro de usuarios (requiere token válido)
router.post('/register', authenticateToken, validate(registerSchema), authController.register);

// Login (público)
router.post('/login', validate(loginSchema), authController.login);

// Logout (privado)
router.post('/logout', authenticateToken, authController.logout);

// Validar sesión/token actual
router.get('/validate', authenticateToken, authController.validateToken);

module.exports = router;
