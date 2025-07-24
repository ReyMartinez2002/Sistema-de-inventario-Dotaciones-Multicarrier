const pool = require('../config/db');
const logger = require('../utils/logger'); 

const UserModel = {
  /**
   * Busca un usuario por nombre de usuario
   * @param {string} username - Nombre de usuario a buscar
   * @returns {Promise<object|null>} Usuario encontrado o null
   */
  findByUsername: async (username) => {
    try {
      if (!username || typeof username !== 'string') {
        throw new Error('Nombre de usuario inválido');
      }

      const [rows] = await pool.query(
        'SELECT id_usuario, username, password_hash, nombre, rol, id_rol, estado FROM usuarios_login WHERE username = ? LIMIT 1', 
        [username]
      );
      
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error en findByUsername: ${error.message}`, { username });
      throw error;
    }
  },

  /**
   * Obtiene usuarios por rol
   * @param {number} id_rol - ID del rol a filtrar
   * @returns {Promise<array>} Lista de usuarios
   */
  getByRole: async (id_rol) => {
    try {
      if (!id_rol || isNaN(Number(id_rol))) {
        throw new Error('ID de rol inválido');
      }

      const [rows] = await pool.query(
        `SELECT id_usuario, username, nombre, rol, id_rol, estado 
         FROM usuarios_login 
         WHERE id_rol = ? AND estado = 'activo'`,
        [id_rol]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Error en getByRole: ${error.message}`, { id_rol });
      throw error;
    }
  },

  /**
   * Crea un nuevo usuario
   * @param {object} data - Datos del usuario
   * @returns {Promise<object>} Usuario creado
   */
  create: async (data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validaciones básicas
      if (!data.username || !data.password_hash || !data.nombre || !data.id_rol) {
        throw new Error('Datos incompletos para crear usuario');
      }

      const estado = data.estado ? 'activo' : 'inactivo';

      // Insertar usuario
      const [result] = await connection.query(
        `INSERT INTO usuarios_login 
          (username, password_hash, nombre, rol, id_rol, estado, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [data.username, data.password_hash, data.nombre, data.rol, data.id_rol, estado]
      );

      // Obtener usuario recién creado
      const [newUserRows] = await connection.query(
        `SELECT id_usuario, username, nombre, rol, id_rol, estado, fecha_creacion
         FROM usuarios_login 
         WHERE id_usuario = ? LIMIT 1`,
        [result.insertId]
      );

      if (!newUserRows[0]) {
        throw new Error('No se pudo recuperar el usuario recién creado');
      }

      await connection.commit();
      logger.info(`Usuario creado: ${data.username}`, { userId: result.insertId });

      return {
        ...newUserRows[0],
        estado: newUserRows[0].estado === 'activo' // Convertir a booleano
      };
    } catch (error) {
      await connection.rollback();
      logger.error(`Error en create: ${error.message}`, { data });
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Busca un usuario por ID
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<object|null>} Usuario encontrado o null
   */
  findById: async (id_usuario) => {
    try {
      if (!id_usuario || isNaN(Number(id_usuario))) {
        throw new Error('ID de usuario inválido');
      }

      const [rows] = await pool.query(
        `SELECT id_usuario, username, nombre, rol, id_rol, estado, fecha_creacion
         FROM usuarios_login 
         WHERE id_usuario = ? LIMIT 1`,
        [id_usuario]
      );
      
      if (!rows[0]) return null;
      
      return {
        ...rows[0],
        estado: rows[0].estado === 'activo' // Convertir a booleano
      };
    } catch (error) {
      logger.error(`Error en findById: ${error.message}`, { id_usuario });
      throw error;
    }
  },

  /**
   * Registra un intento de login en el historial
   * @param {object} data - Datos del intento
   * @param {number} data.id_usuario - ID del usuario
   * @param {boolean} data.exito - Si el login fue exitoso
   * @param {string} data.ip_acceso - IP del cliente
   * @returns {Promise<void>}
   */
  insertLoginHistory: async ({ id_usuario, exito, ip_acceso }) => {
    try {
      if (!id_usuario || typeof exito !== 'boolean' || !ip_acceso) {
        throw new Error('Datos incompletos para historial de login');
      }

      await pool.query(
        `INSERT INTO usuarios_login_historial 
          (id_usuario, fecha_acceso, exito, ip_acceso)
         VALUES (?, NOW(), ?, ?)`,
        [id_usuario, exito, ip_acceso]
      );
      
      logger.info(`Historial de login registrado`, { id_usuario, exito });
    } catch (error) {
      logger.error(`Error en insertLoginHistory: ${error.message}`, { id_usuario, exito, ip_acceso });
      throw error;
    }
  },

  /**
   * Obtiene todos los usuarios (sin información sensible)
   * @returns {Promise<array>} Lista de usuarios
   */
  getAll: async () => {
  try {
    const [rows] = await pool.query(
      `SELECT id_usuario, username, nombre, rol, id_rol, 
       CAST(estado AS CHAR) as estado, fecha_creacion
       FROM usuarios_login`
    );
    
    return rows;
  } catch (error) {
    logger.error(`Error en getAll: ${error.message}`);
    throw error;
  }
},

  /**
   * Verifica si existe al menos un superadmin
   * @returns {Promise<boolean>} True si existe al menos un superadmin
   */
  checkSuperadminExists: async () => {
    try {
      const [rows] = await pool.query(
        `SELECT 1 FROM usuarios_login 
         WHERE rol = 'superadmin' AND estado = 'activo'
         LIMIT 1`
      );
      
      return rows.length > 0;
    } catch (error) {
      logger.error(`Error en checkSuperadminExists: ${error.message}`);
      throw error;
    }
  },

  /**
   * Actualiza un usuario
   * @param {number} id_usuario - ID del usuario a actualizar
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object>} Usuario actualizado
   */
  update: async (id_usuario, data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validar que el usuario exista
      const userExists = await UserModel.findById(id_usuario);
      if (!userExists) {
        throw new Error('Usuario no encontrado');
      }

      // Construir query dinámica
      const fieldsToUpdate = [];
      const values = [];
      
      if (data.nombre !== undefined) {
        fieldsToUpdate.push('nombre = ?');
        values.push(data.nombre);
      }
      
      if (data.rol !== undefined) {
        fieldsToUpdate.push('rol = ?');
        values.push(data.rol);
      }
      
      if (data.id_rol !== undefined) {
        fieldsToUpdate.push('id_rol = ?');
        values.push(data.id_rol);
      }
      
      if (data.estado !== undefined) {
        // Validar que el estado sea correcto
        if (!['activo', 'inactivo'].includes(data.estado)) {
          throw new Error('Estado debe ser "activo" o "inactivo"');
        }
        fieldsToUpdate.push('estado = ?');
        values.push(data.estado);
      }

      if (fieldsToUpdate.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // Siempre actualizar la fecha de actualización
      fieldsToUpdate.push('fecha_actualizacion = NOW()');
      
      values.push(id_usuario);

      const query = `
        UPDATE usuarios_login 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_usuario = ?`;

      await connection.query(query, values);

      // Obtener usuario actualizado
      const [updatedUserRows] = await connection.query(
        `SELECT id_usuario, username, nombre, rol, id_rol, estado, 
                fecha_creacion, fecha_actualizacion
         FROM usuarios_login 
         WHERE id_usuario = ? LIMIT 1`,
        [id_usuario]
      );
      
      if (!updatedUserRows[0]) {
        throw new Error('No se pudo recuperar el usuario actualizado');
      }

      await connection.commit();
      logger.info(`Usuario actualizado: ${id_usuario}`);

      return updatedUserRows[0];
    } catch (error) {
      await connection.rollback();
      logger.error(`Error en update: ${error.message}`, { id_usuario, data });
      throw error;
    } finally {
      connection.release();
    }
    
  },

  /**
   * Cambia el estado de un usuario
   * @param {number} id_usuario - ID del usuario
   * @param {boolean} estado - Nuevo estado (true/false)
   * @returns {Promise<object>} Usuario actualizado
   */
  changeStatus: async (id_usuario, estado) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validar que el estado sea válido
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      // Actualizar estado
      const [result] = await connection.query(
        `UPDATE usuarios_login 
         SET estado = ?, fecha_actualizacion = NOW() 
         WHERE id_usuario = ?`,
        [estado, id_usuario]
      );

      if (result.affectedRows === 0) {
        throw new Error('No se actualizó ningún usuario');
      }

      // Obtener usuario actualizado
      const [updatedUserRows] = await connection.query(
        `SELECT id_usuario, username, nombre, rol, id_rol, estado, 
                fecha_creacion, fecha_actualizacion
         FROM usuarios_login 
         WHERE id_usuario = ? LIMIT 1`,
        [id_usuario]
      );

      if (!updatedUserRows[0]) {
        throw new Error('No se pudo recuperar el usuario actualizado');
      }

      await connection.commit();
      logger.info(`Estado de usuario cambiado: ${id_usuario} -> ${estado}`);
      
      return updatedUserRows[0];
    } catch (error) {
      await connection.rollback();
      logger.error(`Error en changeStatus: ${error.message}`, { id_usuario, estado });
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = UserModel;