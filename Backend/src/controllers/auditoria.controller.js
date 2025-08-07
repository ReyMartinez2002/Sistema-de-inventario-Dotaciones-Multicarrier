const Auditoria = require('../models/auditoria.model');

// Tu función logAuditoria
async function logAuditoria({
  id_usuario,
  accion,
  descripcion,
  tabla_afectada,
  id_registro_afectado,
  estado_anterior
}) {
  // Aquí deberías guardar el log en la base de datos usando tu modelo Auditoria.
  // Puedes adaptar esto según tu esquema:
  try {
    await Auditoria.create({
      id_usuario,
      accion,
      descripcion,
      tabla_afectada,
      id_registro_afectado,
      estado_anterior: estado_anterior ? JSON.stringify(estado_anterior) : null
    });
    // Puedes agregar aquí un log si quieres:
    console.log(`[Auditoría] Acción registrada: ${accion} en ${tabla_afectada}, usuario: ${id_usuario}`);
  } catch (error) {
    console.error('[Auditoría] Error al registrar auditoría:', error);
    // No lanzar el error para no interrumpir la lógica principal
  }
}

// Si quieres mantener getAll:
const getAll = async (req, res) => {
  try {
    const logs = await Auditoria.getAll();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener auditoría.' });
  }
};

module.exports = { getAll, logAuditoria };