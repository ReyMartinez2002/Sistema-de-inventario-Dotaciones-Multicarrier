const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleado.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

router.get('/', verifyToken, empleadoController.getAll);
router.get('/:id', verifyToken, empleadoController.getById);
router.post('/', verifyToken, allowRoles('admin'), empleadoController.create);
router.put('/:id', verifyToken, allowRoles('admin'), empleadoController.update);
router.delete('/:id', verifyToken, allowRoles('admin'), empleadoController.remove);

module.exports = router;