const db = require('../config/db');
const { logAuditoria } = require('./auditoria.controller');

// Controlador para obtener todas las categorías
async function getCategorias(req, res) {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias_dotacion');
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener categorías',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener subcategorías
async function getSubcategorias(req, res) {
  try {
    const [subcategorias] = await db.query('SELECT * FROM subcategorias_dotacion');
    res.json({ success: true, data: subcategorias });
  } catch (error) {
    console.error('Error en getSubcategorias:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener subcategorías',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener subcategorías por categoría
async function getSubcategoriasByCategoria(req, res) {
  try {
    const { id_categoria } = req.params;
    const [subcategorias] = await db.query(
      'SELECT * FROM subcategorias_dotacion WHERE id_categoria = ?', 
      [id_categoria]
    );
    res.json({ success: true, data: subcategorias });
  } catch (error) {
    console.error('Error en getSubcategoriasByCategoria:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener subcategorías por categoría',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener artículos
async function getArticulos(req, res) {
  try {
    const [articulos] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE eliminado = 0'
    );
    res.json({ success: true, data: articulos });
  } catch (error) {
    console.error('Error en getArticulos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener artículos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener artículos por subcategoría
async function getArticulosBySubcategoria(req, res) {
  try {
    const { id_subcategoria } = req.params;
    const [articulos] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_subcategoria = ? AND eliminado = 0',
      [id_subcategoria]
    );
    res.json({ success: true, data: articulos });
  } catch (error) {
    console.error('Error en getArticulosBySubcategoria:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener artículos por subcategoría',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener todos los artículos con detalles
async function getAllArticulos(req, res) {
  try {
    const [articulos] = await db.query(
      `SELECT ad.*, sd.nombre as subcategoria, cd.nombre as categoria 
       FROM articulos_dotacion ad
       JOIN subcategorias_dotacion sd ON ad.id_subcategoria = sd.id_subcategoria
       JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
       WHERE ad.eliminado = 0`
    );

    for (const articulo of articulos) {
      const [tallas] = await db.query(
        `SELECT ta.*, 
         COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
         COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
         FROM tallas_articulos ta 
         WHERE ta.id_articulo = ?`,
        [articulo.id_articulo]
      );
      articulo.tallas = tallas;
    }

    res.json({ success: true, data: articulos });
  } catch (error) {
    console.error('Error en getAllArticulos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener artículos completos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener un artículo por ID
async function getArticuloById(req, res) {
  try {
    const { id } = req.params;
    const [articulos] = await db.query(
      `SELECT ad.*, sd.nombre as subcategoria, cd.nombre as categoria 
       FROM articulos_dotacion ad
       JOIN subcategorias_dotacion sd ON ad.id_subcategoria = sd.id_subcategoria
       JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
       WHERE ad.id_articulo = ? AND ad.eliminado = 0`,
      [id]
    );

    if (articulos.length === 0) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    const articulo = articulos[0];
    const [tallas] = await db.query(
      `SELECT ta.*, 
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
       FROM tallas_articulos ta 
       WHERE ta.id_articulo = ?`,
      [id]
    );

    articulo.tallas = tallas;
    res.json({ success: true, data: articulo });
  } catch (error) {
    console.error('Error en getArticuloById:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para crear un nuevo artículo
async function createArticulo(req, res) {
  try {
    const { nombre, descripcion, genero, id_subcategoria, tallas } = req.body;

    if (!nombre || !id_subcategoria) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y subcategoría son requeridos' 
      });
    }

    await db.query('START TRANSACTION');

    try {
      const [result] = await db.query(
        'INSERT INTO articulos_dotacion (nombre, descripcion, genero, id_subcategoria) VALUES (?, ?, ?, ?)',
        [nombre, descripcion || null, genero || 'Unisex', id_subcategoria]
      );

      const idArticulo = result.insertId;

      if (tallas && tallas.length > 0) {
        for (const talla of tallas) {
          if (!talla.talla) continue;

          const [tallaResult] = await db.query(
            'INSERT INTO tallas_articulos (id_articulo, talla) VALUES (?, ?)',
            [idArticulo, talla.talla]
          );

          const idTalla = tallaResult.insertId;

          if (talla.stock_nuevo > 0) {
            await db.query(
              'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "nuevo", ?)',
              [idTalla, talla.stock_nuevo]
            );
          }

          if (talla.stock_reutilizable > 0) {
            await db.query(
              'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "reutilizable", ?)',
              [idTalla, talla.stock_reutilizable]
            );
          }
        }
      }

      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR',
        descripcion: `Creación de artículo: ${nombre}`,
        tabla_afectada: 'articulos_dotacion',
        id_registro_afectado: idArticulo
      });

      await db.query('COMMIT');
      res.json({ success: true, id: idArticulo, message: 'Artículo creado exitosamente' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en createArticulo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para actualizar un artículo
async function updateArticulo(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, genero, id_subcategoria, tallas } = req.body;

    if (!nombre || !id_subcategoria) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y subcategoría son requeridos' 
      });
    }

    const [articuloExistente] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_articulo = ? AND eliminado = 0',
      [id]
    );

    if (articuloExistente.length === 0) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    await db.query('START TRANSACTION');

    try {
      await db.query(
        `UPDATE articulos_dotacion 
         SET nombre = ?, descripcion = ?, genero = ?, id_subcategoria = ?, fecha_actualizacion = NOW()
         WHERE id_articulo = ?`,
        [nombre, descripcion || null, genero || 'Unisex', id_subcategoria, id]
      );

      if (tallas) {
        const [tallasExistentes] = await db.query(
          'SELECT * FROM tallas_articulos WHERE id_articulo = ?',
          [id]
        );

        const tallasAEliminar = tallasExistentes.filter(te => 
          !tallas.some(t => t.id_talla === te.id_talla)
        );

        for (const talla of tallasAEliminar) {
          await db.query('DELETE FROM stock_dotacion WHERE id_talla = ?', [talla.id_talla]);
          await db.query('DELETE FROM tallas_articulos WHERE id_talla = ?', [talla.id_talla]);
        }

        for (const talla of tallas) {
          if (!talla.talla) continue;

          if (talla.id_talla) {
            await db.query(
              'UPDATE tallas_articulos SET talla = ? WHERE id_talla = ?',
              [talla.talla, talla.id_talla]
            );

            await db.query(
              `INSERT INTO stock_dotacion (id_talla, estado, cantidad)
               VALUES (?, 'nuevo', ?)
               ON DUPLICATE KEY UPDATE cantidad = ?`,
              [talla.id_talla, talla.stock_nuevo || 0, talla.stock_nuevo || 0]
            );

            await db.query(
              `INSERT INTO stock_dotacion (id_talla, estado, cantidad)
               VALUES (?, 'reutilizable', ?)
               ON DUPLICATE KEY UPDATE cantidad = ?`,
              [talla.id_talla, talla.stock_reutilizable || 0, talla.stock_reutilizable || 0]
            );
          } else {
            const [tallaResult] = await db.query(
              'INSERT INTO tallas_articulos (id_articulo, talla) VALUES (?, ?)',
              [id, talla.talla]
            );

            const idTalla = tallaResult.insertId;

            if (talla.stock_nuevo > 0) {
              await db.query(
                'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "nuevo", ?)',
                [idTalla, talla.stock_nuevo]
              );
            }

            if (talla.stock_reutilizable > 0) {
              await db.query(
                'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "reutilizable", ?)',
                [idTalla, talla.stock_reutilizable]
              );
            }
          }
        }
      }

      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR',
        descripcion: `Actualización de artículo ID ${id}`,
        tabla_afectada: 'articulos_dotacion',
        id_registro_afectado: parseInt(id)
      });

      await db.query('COMMIT');
      res.json({ success: true, message: 'Artículo actualizado exitosamente' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en updateArticulo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para eliminar un artículo (soft delete)
async function deleteArticulo(req, res) {
  try {
    const { id } = req.params;
    const [articulo] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_articulo = ? AND eliminado = 0',
      [id]
    );

    if (articulo.length === 0) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    await db.query(
      'UPDATE articulos_dotacion SET eliminado = 1, fecha_actualizacion = NOW() WHERE id_articulo = ?',
      [id]
    );

    await logAuditoria({
      id_usuario: req.user.id_usuario,
      accion: 'ELIMINAR',
      descripcion: `Eliminación de artículo: ${articulo[0].nombre}`,
      tabla_afectada: 'articulos_dotacion',
      id_registro_afectado: parseInt(id)
    });

    res.json({ success: true, message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteArticulo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para obtener tallas por artículo
async function getTallasByArticulo(req, res) {
  try {
    const { id } = req.params;
    const [tallas] = await db.query(
      `SELECT ta.*, 
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
       FROM tallas_articulos ta 
       WHERE ta.id_articulo = ?`,
      [id]
    );

    res.json({ success: true, data: tallas });
  } catch (error) {
    console.error('Error en getTallasByArticulo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener tallas del artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Exportación de todos los controladores
module.exports = {
  getCategorias,
  getSubcategorias,
  getSubcategoriasByCategoria,
  getArticulos,
  getArticulosBySubcategoria,
  getAllArticulos,
  getArticuloById,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  getTallasByArticulo
};