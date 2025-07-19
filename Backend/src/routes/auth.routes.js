const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

/**
 * @swagger
 * /api/auth/setup-first-admin:
 *   post:
 *     summary: Crea el primer superadmin del sistema
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Superadmin creado exitosamente
 *       403:
 *         description: Ya existe un superadmin en el sistema
 *       500:
 *         description: Error del servidor
 */
router.post('/setup-first-admin', async (req, res, next) => {
  try {
    const superadminExists = await User.checkSuperadminExists();
    if (superadminExists) {
      return res.status(403).json({ 
        error: 'Ya existe un superadmin en el sistema',
        code: 'SUPERADMIN_EXISTS'
      });
    }
    // Permitir temporalmente
    req.usuario = { rol: 'system' };
    next();
  } catch (error) {
    console.error('Error en setup-first-admin:', error);
    next(error);
  }
}, authController.register);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (Solo superadmin)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de registro inválidos
 *       403:
 *         description: No autorizado
 *       409:
 *         description: El usuario ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/register', authenticateToken, allowRoles('superadmin'), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios (Solo superadmin/admin)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuarios', authenticateToken, allowRoles('superadmin', 'admin'), authController.getUsuarios);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validar token y obtener información del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/validate', authenticateToken, (req, res) => {
  return res.json({
    usuario: req.usuario,
    message: 'Token válido',
    valid: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;