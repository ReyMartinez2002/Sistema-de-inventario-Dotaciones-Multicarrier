const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleado.controller');
const authenticateToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');

router.get('/', authenticateToken, empleadoController.getAll);
router.get('/:id', authenticateToken, empleadoController.getById);
router.post('/', authenticateToken, allowRoles('admin'), empleadoController.create);
router.put('/:id', authenticateToken, allowRoles('admin'), empleadoController.update);
router.delete('/:id', authenticateToken, allowRoles('admin'), empleadoController.remove);

module.exports = router;