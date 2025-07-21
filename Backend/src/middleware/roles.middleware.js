const db = require('../config/db');
exports.getRoles = async (req, res) => {
  const [rows] = await db.query('SELECT id_rol AS id, nombre AS value, nombre AS label FROM roles');
  res.json(rows);
};