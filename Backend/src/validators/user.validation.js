const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener caracteres alfanuméricos',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder los 30 caracteres',
      'any.required': 'El nombre de usuario es requerido'
    }),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe tener entre 6 y 30 caracteres alfanuméricos',
      'any.required': 'La contraseña es requerida'
    }),
  nombre: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  id_rol: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'El rol debe ser un número válido',
      'number.min': 'El rol no es válido',
      'any.required': 'El rol es requerido'
    })
});

const updateSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres'
    }),
  id_rol: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': 'El rol debe ser un número válido',
      'number.min': 'El rol no es válido'
    }),
  estado: Joi.string()
    .valid('activo', 'inactivo')
    .messages({
      'any.only': 'El estado debe ser activo o inactivo'
    })
}).min(1); // Al menos un campo debe ser proporcionado

const changeStatusSchema = Joi.object({
  estado: Joi.string()
    .valid('activo', 'inactivo')
    .required()
    .messages({
      'any.only': 'El estado debe ser activo o inactivo',
      'any.required': 'El estado es requerido'
    })
});

module.exports = {
  register: registerSchema,
  update: updateSchema,
  changeStatus: changeStatusSchema
};