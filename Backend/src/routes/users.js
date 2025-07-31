const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isSuperAdmin } = require('../middleware/auth.middleware');

// Todas requieren token de acceso
router.get('/', verifyToken, userController.getAllUsers);
router.post('/', verifyToken, isSuperAdmin, userController.createUser); // solo superadmin
router.put('/:id', verifyToken, isSuperAdmin, userController.updateUser); // solo superadmin
router.patch('/:id/status', verifyToken, isSuperAdmin, userController.changeUserStatus);
// Cambiar contraseña (usuario autenticado o admin)
router.put('/:id/password', verifyToken, userController.changePassword);

module.exports = router;