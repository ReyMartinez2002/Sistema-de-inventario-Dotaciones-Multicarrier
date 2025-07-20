const Joi = require('joi');

const dotacionSchema = Joi.object({
  id_subcategoria: Joi.number().integer().required(),
  descripcion: Joi.string().max(150).required(),
  genero: Joi.string().max(20).optional(),
  estado: Joi.string().valid('nuevo', 'reutilizable', 'dañado', 'devuelto').required(),
  stock_nuevo: Joi.number().integer().min(0).required(),
  stock_reutilizable: Joi.number().integer().min(0).required(),
  stock_minimo: Joi.number().integer().min(0).required(),
  precio_unitario: Joi.number().precision(2).min(0).required()
});

module.exports = {
  dotacionSchema
};