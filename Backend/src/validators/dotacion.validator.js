const Joi = require('joi');

const dotacionSchema = Joi.object({
  id_subcategoria: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'La subcategoría debe ser un número',
      'number.integer': 'La subcategoría debe ser un entero',
      'number.positive': 'La subcategoría debe ser positiva',
      'any.required': 'La subcategoría es requerida'
    }),
    
  descripcion: Joi.string().max(150).trim().required()
    .messages({
      'string.base': 'La descripción debe ser texto',
      'string.max': 'La descripción no puede exceder los 150 caracteres',
      'string.empty': 'La descripción no puede estar vacía',
      'any.required': 'La descripción es requerida'
    }),
    
  genero: Joi.string().valid('M', 'F', 'U', null).optional()
    .messages({
      'string.base': 'El género debe ser texto',
      'any.only': 'El género debe ser M, F, U o nulo'
    }),
    
  estado: Joi.string().valid('nuevo', 'reutilizable', 'dañado', 'devuelto').default('nuevo')
    .messages({
      'string.base': 'El estado debe ser texto',
      'any.only': 'Estado no válido'
    }),
    
  stock_nuevo: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'Stock nuevo debe ser un número',
      'number.integer': 'Stock nuevo debe ser entero',
      'number.min': 'Stock nuevo no puede ser negativo'
    }),
    
  stock_reutilizable: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'Stock reutilizable debe ser un número',
      'number.integer': 'Stock reutilizable debe ser entero',
      'number.min': 'Stock reutilizable no puede ser negativo'
    }),
    
  stock_minimo: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'Stock mínimo debe ser un número',
      'number.integer': 'Stock mínimo debe ser entero',
      'number.min': 'Stock mínimo no puede ser negativo'
    }),
    
  precio_unitario: Joi.number().precision(2).min(0).default(0.00)
    .messages({
      'number.base': 'Precio debe ser un número',
      'number.precision': 'Precio debe tener máximo 2 decimales',
      'number.min': 'Precio no puede ser negativo'
    })
}).options({ abortEarly: false });

module.exports = {
  dotacionSchema
};