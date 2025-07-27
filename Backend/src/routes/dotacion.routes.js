const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { verifyToken, isSuperAdmin } = require("../middleware/auth.middleware");
const dotacionController = require("../controllers/dotacion.controller");

// Validaciones
const createUpdateValidations = [
  check("id_subcategoria")
    .isInt()
    .withMessage("ID de subcategoría debe ser un número"),
  check("descripcion").optional().isString(),
  check("genero")
    .optional()
    .isIn(["M", "F", "U"])
    .withMessage("Género no válido"),
  check("stock_nuevo").optional().isInt({ min: 0 }).toInt(),
  check("stock_reutilizable").optional().isInt({ min: 0 }).toInt(),
  check("stock_minimo").optional().isInt({ min: 0 }).toInt(),
  check("precio_unitario").optional().isFloat({ min: 0 }).toFloat(),
];

// Rutas protegidas
router.get("/", verifyToken, dotacionController.getAll);
router.get("/categorias", verifyToken, dotacionController.getCategorias);
router.get("/subcategorias", verifyToken, dotacionController.getSubcategorias);
router.get("/:id", verifyToken, dotacionController.getById);

router.post(
  "/",
  verifyToken,
  isSuperAdmin,
  createUpdateValidations,
  dotacionController.create
);

router.put(
  "/:id",
  verifyToken,
  isSuperAdmin,
  createUpdateValidations,
  dotacionController.update
);

// dotacion.routes.js
router.delete(
  "/:id",
  verifyToken,
  isSuperAdmin,
  dotacionController.remove
);

module.exports = router;
