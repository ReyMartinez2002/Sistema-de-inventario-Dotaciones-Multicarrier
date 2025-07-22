import express from 'express';
import DotacionController from '../controllers/dotacion.controller';
import { check } from 'express-validator';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Validaciones
const createUpdateValidations = [
  check('id_subcategoria').isInt().withMessage('ID de subcategoría debe ser un número'),
  check('descripcion').optional().isString(),
  check('genero').optional().isString(),
  check('stock_nuevo').optional().isInt({ min: 0 }),
  check('stock_reutilizable').optional().isInt({ min: 0 }),
  check('stock_minimo').optional().isInt({ min: 0 }),
  check('precio_unitario').optional().isFloat({ min: 0 })
];

// Rutas
router.get('/', verifyToken, DotacionController.getAll);
router.get('/categorias', verifyToken, DotacionController.getCategorias);
router.get('/subcategorias', verifyToken, DotacionController.getSubcategorias);

router.post(
  '/',
  verifyToken,
  isAdmin,
  createUpdateValidations,
  DotacionController.create
);

router.get('/:id', verifyToken, DotacionController.getById);
router.put(
  '/:id',
  verifyToken,
  isAdmin,
  createUpdateValidations,
  DotacionController.update
);

router.patch(
  '/:id/estado',
  verifyToken,
  isAdmin,
  [check('estado').isIn(['nuevo', 'reutilizable', 'dañado', 'devuelto'])],
  DotacionController.changeStatus
);

router.get('/:id/historial', verifyToken, DotacionController.getStatusHistory);
router.delete('/:id', verifyToken, isAdmin, DotacionController.delete);

export default router;