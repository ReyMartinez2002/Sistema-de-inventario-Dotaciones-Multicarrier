const express = require('express');
const router = express.Router();
const dotacionController = require('../controllers/dotacion.controller');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

router.get('/', authenticateToken, dotacionController.getAll);
router.get('/:id', authenticateToken, dotacionController.getById);
router.post('/', authenticateToken, allowRoles('admin'), dotacionController.create);
router.put('/:id', authenticateToken, allowRoles('admin'), dotacionController.update);
router.delete('/:id', authenticateToken, allowRoles('admin'), dotacionController.remove);

module.exports = router;