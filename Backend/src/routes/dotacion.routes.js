const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { verifyToken, isSuperAdmin } = require("../middleware/auth.middleware");
const dotacionController = require("../controllers/dotacion.controller");

// Validaciones comunes
const articuloValidations = [
  check("nombre").isString().notEmpty().withMessage("Nombre es requerido"),
  check("descripcion").optional().isString(),
  check("genero")
    .isIn(["Masculino", "Femenino", "Unisex"])
    .withMessage("Género inválido"),
  check("id_subcategoria").isInt().withMessage("Subcategoría inválida"),
];

const tallaValidations = [
  check("talla").isString().notEmpty().withMessage("Talla es requerida"),
  check("stock_nuevo").optional().isInt({ min: 0 }),
  check("stock_reutilizable").optional().isInt({ min: 0 }),
];

// ==================== RUTAS PARA CATEGORÍAS ====================
router.get("/categorias", verifyToken, dotacionController.getCategorias);
router.post(
  "/categorias",
  verifyToken,
  isSuperAdmin,
  [check("nombre").isString().notEmpty().withMessage("Nombre es requerido")],
  dotacionController.createCategoria
);
router.delete(
  "/categorias/:id",
  verifyToken,
  isSuperAdmin,
  dotacionController.deleteCategoria
);

// ==================== RUTAS PARA SUBCATEGORÍAS ====================
router.get("/subcategorias", verifyToken, dotacionController.getSubcategorias);
router.get(
  "/subcategorias/:id_categoria",
  verifyToken,
  dotacionController.getSubcategoriasByCategoria
);
router.post(
  "/subcategorias",
  verifyToken,
  isSuperAdmin,
  [
    check("nombre").isString().notEmpty().withMessage("Nombre es requerido"),
    check("id_categoria").isInt().withMessage("ID de categoría inválido"),
    check("descripcion").optional().isString(),
  ],
  dotacionController.createSubcategoria
);
router.delete(
  "/subcategorias/:id",
  verifyToken,
  isSuperAdmin,
  dotacionController.deleteSubcategoria
);

// ==================== RUTAS PARA ARTÍCULOS ====================
router.get("/articulos", verifyToken, dotacionController.getArticulos);
router.get("/articulos/all", verifyToken, dotacionController.getAllArticulos);
router.get("/articulos/:id", verifyToken, dotacionController.getArticuloById);
router.get(
  "/articulos/subcategoria/:id_subcategoria",
  verifyToken,
  dotacionController.getArticulosBySubcategoria
);
router.post(
  "/articulos",
  verifyToken,
  isSuperAdmin,
  [...articuloValidations, check("tallas").optional().isArray()],
  dotacionController.createArticulo
);
router.put(
  "/articulos/:id",
  verifyToken,
  isSuperAdmin,
  [...articuloValidations, check("tallas").optional().isArray()],
  dotacionController.updateArticulo
);
router.delete(
  "/articulos/:id",
  verifyToken,
  isSuperAdmin,
  dotacionController.deleteArticulo
);

// ==================== RUTAS PARA TALLAS ====================
router.get(
  "/articulos/:id/tallas",
  verifyToken,
  dotacionController.getTallasByArticulo
);
router.post(
  "/articulos/:id/tallas",
  verifyToken,
  isSuperAdmin,
  tallaValidations,
  dotacionController.addTallaToArticulo
);
router.put(
  "/articulos/:id/tallas/:idTalla",
  verifyToken,
  isSuperAdmin,
  tallaValidations,
  dotacionController.updateTalla
);
router.delete(
  "/articulos/:id/tallas/:idTalla",
  verifyToken,
  isSuperAdmin,
  dotacionController.removeTalla
);

// ==================== RUTAS PARA STOCK ====================
router.get(
  "/stock/articulo/:idArticulo",
  verifyToken,
  dotacionController.getStockByArticulo
);
router.post(
  "/stock/ingresar",
  verifyToken,
  isSuperAdmin,
  [
    check("id_talla").isInt(),
    check("cantidad").isInt({ min: 1 }),
    check("estado").isIn(["nuevo", "reutilizable"]),
    check("motivo").optional().isString(),
  ],
  dotacionController.ingresarStock
);
router.post(
  "/stock/retirar",
  verifyToken,
  isSuperAdmin,
  [
    check("id_talla").isInt(),
    check("cantidad").isInt({ min: 1 }),
    check("motivo").isString(),
    check("id_empleado").optional().isInt(),
  ],
  dotacionController.retirarStock
);

module.exports = router;
