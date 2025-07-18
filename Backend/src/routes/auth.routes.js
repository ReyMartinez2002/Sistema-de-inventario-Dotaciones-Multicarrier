const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware'); 

router.post('/register', authenticateToken, allowRoles('superadmin'), authController.register);
router.post('/login', authController.login);
router.get('/usuarios', authController.getUsuarios);

module.exports = router;