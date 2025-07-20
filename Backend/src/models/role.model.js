const db = require('../config/db');

class Role {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM roles');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM roles WHERE id_rol = ?', [id]);
    return rows[0];
  }

  static async create({ nombre, descripcion }) {
    const [result] = await db.query(
      'INSERT INTO roles (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    return result.insertId;
  }

  static async update(id, { nombre, descripcion }) {
    const [result] = await db.query(
      'UPDATE roles SET nombre = ?, descripcion = ? WHERE id_rol = ?',
      [nombre, descripcion, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    if (id <= 3) {
      throw new Error('No se pueden eliminar los roles básicos del sistema');
    }

    const [users] = await db.query(
      'SELECT COUNT(*) as count FROM usuarios_login WHERE id_rol = ?',
      [id]
    );
    if (users[0].count > 0) {
      throw new Error('No se puede eliminar el rol porque hay usuarios asignados');
    }

    const [result] = await db.query('DELETE FROM roles WHERE id_rol = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Role;