const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { verifyToken, isSuperAdmin } = require("../middleware/auth.middleware");
const dotacionController = require("../controllers/dotacion.controller");

// Validaciones comunes para artículos
const articuloValidations = [
  check("nombre").isString().notEmpty().withMessage("Nombre es requerido"),
  check("descripcion").optional().isString(),
  check("genero").isIn(["Masculino", "Femenino", "Unisex"]).withMessage("Género inválido"),
  check("id_subcategoria").isInt().withMessage("Subcategoría inválida")
];

// Rutas para estructura jerárquica
router.get("/categorias", verifyToken, dotacionController.getCategorias);
router.get("/subcategorias", verifyToken, dotacionController.getSubcategorias);
router.get("/subcategorias/:id_categoria", verifyToken, dotacionController.getSubcategoriasByCategoria);
router.get("/articulos", verifyToken, dotacionController.getArticulos);
router.get("/articulos/:id_subcategoria", verifyToken, dotacionController.getArticulosBySubcategoria);

// Rutas CRUD completas
router.get("/", verifyToken, dotacionController.getAllArticulos);
router.get("/:id", verifyToken, dotacionController.getArticuloById);
router.get("/:id/tallas", verifyToken, dotacionController.getTallasByArticulo);

router.post(
  "/",
  verifyToken,
  isSuperAdmin,
  [...articuloValidations, check("tallas").optional().isArray()],
  dotacionController.createArticulo
);

router.put(
  "/:id",
  verifyToken,
  isSuperAdmin,
  [...articuloValidations, check("tallas").optional().isArray()],
  dotacionController.updateArticulo
);

router.delete(
  "/:id",
  verifyToken,
  isSuperAdmin,
  dotacionController.deleteArticulo
);

module.exports = router;