const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimiento.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.get('/', authenticateToken, movimientoController.getAll);
router.get('/:id', authenticateToken, movimientoController.getById);
router.post('/', authenticateToken, movimientoController.create);

module.exports = router;