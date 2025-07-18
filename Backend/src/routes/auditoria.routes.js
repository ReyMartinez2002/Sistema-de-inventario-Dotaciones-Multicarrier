const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

router.get('/', authenticateToken, allowRoles('admin'), auditoriaController.getAll);

module.exports = router;