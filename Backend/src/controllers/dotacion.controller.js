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

// Controlador para crear categoría
async function createCategoria(req, res) {
  try {
    const { nombre } = req.body;

    // Validación mejorada
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'El nombre de la categoría es requerido' 
      });
    }

    const nombreTrimmed = nombre.trim();

    // Verificar si ya existe
    const [existe] = await db.query(
      'SELECT id_categoria FROM categorias_dotacion WHERE nombre = ?',
      [nombreTrimmed]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con este nombre'
      });
    }

    // Crear categoría
    const [result] = await db.query(
      'INSERT INTO categorias_dotacion (nombre) VALUES (?)',
      [nombreTrimmed]
    );

    // Auditoría
    try {
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR',
        descripcion: `Creación de categoría: ${nombreTrimmed}`,
        tabla_afectada: 'categorias_dotacion',
        id_registro_afectado: result.insertId
      });
    } catch (auditError) {
      console.error('Error en auditoría (no crítico):', auditError);
    }

    // Obtener y devolver la categoría creada
    const [nuevaCategoria] = await db.query(
      'SELECT * FROM categorias_dotacion WHERE id_categoria = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: nuevaCategoria[0],
      message: 'Categoría creada exitosamente'
    });

  } catch (error) {
    console.error('Error en createCategoria:', error);
    
    // Manejo específico de errores de base de datos
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        error: 'Ya existe una categoría con este nombre' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Error al crear categoría',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para eliminar categoría
async function deleteCategoria(req, res) {
  try {
    const { id } = req.params;

    // 1. Verificar si hay subcategorías asociadas
    const [subcategorias] = await db.query(
      'SELECT COUNT(*) as count FROM subcategorias_dotacion WHERE id_categoria = ?',
      [id]
    );

    if (subcategorias[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar la categoría porque tiene subcategorías asociadas',
        code: 'CATEGORIA_CON_SUBCATEGORIAS',
        metadata: {
          count: subcategorias[0].count
        }
      });
    }

    // 2. Obtener datos para auditoría y respuesta
    const [categoria] = await db.query(
      'SELECT nombre FROM categorias_dotacion WHERE id_categoria = ?',
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Categoría no encontrada',
        code: 'CATEGORIA_NO_ENCONTRADA'
      });
    }

    // 3. Ejecutar eliminación
    const [result] = await db.query(
      'DELETE FROM categorias_dotacion WHERE id_categoria = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Error inesperado al eliminar categoría',
        code: 'ERROR_ELIMINACION'
      });
    }

    // 4. Auditoría (con manejo seguro)
    try {
      if (req.user?.id_usuario) {
        await logAuditoria({
          id_usuario: req.user.id_usuario,
          accion: 'ELIMINAR',
          descripcion: `Eliminación de categoría: ${categoria[0].nombre}`,
          tabla_afectada: 'categorias_dotacion',
          id_registro_afectado: parseInt(id),
          estado_anterior: JSON.stringify(categoria[0])
        });
      }
    } catch (auditError) {
      console.error('Error no crítico en auditoría:', auditError);
      // No interrumpimos el flujo por errores de auditoría
    }

    // 5. Respuesta exitosa
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: {
        id: parseInt(id),
        nombre: categoria[0].nombre,
        deleted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error crítico en deleteCategoria:', error);
    
    // Respuesta de error estructurada
    const errorResponse = {
      success: false,
      error: 'Error interno al procesar la solicitud',
      code: 'SERVER_ERROR'
    };

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.details = error.message;
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
}

// Controlador para obtener subcategorías
async function getSubcategorias(req, res) {
  try {
    const [subcategorias] = await db.query(`
      SELECT sd.*, cd.nombre as categoria 
      FROM subcategorias_dotacion sd
      JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
    `);
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

// Controlador para crear subcategoría
// Controlador para crear subcategoría
async function createSubcategoria(req, res) {
  try {
    const { nombre, id_categoria, descripcion } = req.body;

    // Validaciones mejoradas
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la subcategoría es requerido'
      });
    }

    if (!id_categoria || isNaN(id_categoria)) {
      return res.status(400).json({
        success: false,
        error: 'ID de categoría inválido'
      });
    }

    const nombreTrimmed = nombre.trim();
    const descripcionTrimmed = descripcion ? descripcion.trim() : null;

    // Verificar si la categoría existe
    const [categoria] = await db.query(
      'SELECT id_categoria FROM categorias_dotacion WHERE id_categoria = ?',
      [id_categoria]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'La categoría especificada no existe'
      });
    }

    // Verificar si ya existe la subcategoría
    const [existe] = await db.query(
      'SELECT id_subcategoria FROM subcategorias_dotacion WHERE nombre = ? AND id_categoria = ?',
      [nombreTrimmed, id_categoria]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una subcategoría con este nombre en la categoría seleccionada'
      });
    }

    // Crear la subcategoría
    const [result] = await db.query(
      'INSERT INTO subcategorias_dotacion (nombre, id_categoria, descripcion) VALUES (?, ?, ?)',
      [nombreTrimmed, id_categoria, descripcionTrimmed]
    );

    // Registrar auditoría (manejando posibles errores)
    try {
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR',
        descripcion: `Creación de subcategoría: ${nombreTrimmed}`,
        tabla_afectada: 'subcategorias_dotacion',
        id_registro_afectado: result.insertId
      });
    } catch (auditError) {
      console.error('Error en auditoría (no crítico):', auditError);
    }

    // Obtener y devolver la subcategoría creada
    const [nuevaSubcategoria] = await db.query(
      'SELECT * FROM subcategorias_dotacion WHERE id_subcategoria = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: nuevaSubcategoria[0],
      message: 'Subcategoría creada exitosamente'
    });

  } catch (error) {
    console.error('Error en createSubcategoria:', error);
    
    // Manejo específico de errores de base de datos
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una subcategoría con este nombre'
      });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'La categoría especificada no existe'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error al crear subcategoría',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Controlador para eliminar subcategoría
async function deleteSubcategoria(req, res) {
  try {
    const { id } = req.params;

    // 1. Verificar si hay artículos asociados
    const [articulos] = await db.query(
      'SELECT COUNT(*) as count FROM articulos_dotacion WHERE id_subcategoria = ? AND eliminado = 0',
      [id]
    );

    if (articulos[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar la subcategoría porque tiene artículos asociados',
        code: 'SUBCATEGORIA_CON_ARTICULOS'
      });
    }

    // 2. Obtener datos de la subcategoría antes de eliminar (para auditoría)
    const [subcategoria] = await db.query(
      'SELECT nombre FROM subcategorias_dotacion WHERE id_subcategoria = ?',
      [id]
    );

    if (subcategoria.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subcategoría no encontrada',
        code: 'SUBCATEGORIA_NO_ENCONTRADA'
      });
    }

    // 3. Eliminar la subcategoría
    const [result] = await db.query(
      'DELETE FROM subcategorias_dotacion WHERE id_subcategoria = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No se pudo eliminar la subcategoría',
        code: 'ERROR_ELIMINACION'
      });
    }

    // 4. Registrar auditoría (con manejo de errores no críticos)
    try {
      if (req.user && req.user.id_usuario) {
        await logAuditoria({
          id_usuario: req.user.id_usuario,
          accion: 'ELIMINAR',
          descripcion: `Eliminación de subcategoría: ${subcategoria[0].nombre} (ID: ${id})`,
          tabla_afectada: 'subcategorias_dotacion',
          id_registro_afectado: parseInt(id)
        });
      }
    } catch (auditError) {
      console.error('Error no crítico en auditoría:', auditError);
    }

    // 5. Respuesta exitosa
    res.json({ 
      success: true, 
      message: 'Subcategoría eliminada exitosamente',
      data: {
        id: parseInt(id),
        nombre: subcategoria[0].nombre
      }
    });

  } catch (error) {
    console.error('Error en deleteSubcategoria:', error);
    
    // Manejo específico de errores de base de datos
    const errorResponse = {
      success: false,
      error: 'Error al eliminar subcategoría',
      code: 'ERROR_INTERNO'
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
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
// Agregar talla a artículo
async function addTallaToArticulo(req, res) {
  try {
    const { id } = req.params;
    const { talla, stock_nuevo = 0, stock_reutilizable = 0 } = req.body;

    // Verificar si el artículo existe
    const [articulo] = await db.query(
      'SELECT id_articulo FROM articulos_dotacion WHERE id_articulo = ? AND eliminado = 0',
      [id]
    );

    if (articulo.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Artículo no encontrado',
        code: 'ARTICULO_NO_ENCONTRADO'
      });
    }

    await db.query('START TRANSACTION');

    try {
      // Insertar talla
      const [tallaResult] = await db.query(
        'INSERT INTO tallas_articulos (id_articulo, talla) VALUES (?, ?)',
        [id, talla]
      );

      const idTalla = tallaResult.insertId;

      // Insertar stocks si es necesario
      if (stock_nuevo > 0) {
        await db.query(
          'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "nuevo", ?)',
          [idTalla, stock_nuevo]
        );
      }

      if (stock_reutilizable > 0) {
        await db.query(
          'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, "reutilizable", ?)',
          [idTalla, stock_reutilizable]
        );
      }

      // Auditoría
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'AGREGAR_TALLA',
        descripcion: `Agregada talla ${talla} al artículo ID ${id}`,
        tabla_afectada: 'tallas_articulos',
        id_registro_afectado: idTalla
      });

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Talla agregada exitosamente',
        data: {
          id_talla: idTalla,
          talla,
          stock_nuevo,
          stock_reutilizable
        }
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en addTallaToArticulo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar talla al artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
// Actualizar talla
async function updateTalla(req, res) {
  try {
    const { id, idTalla } = req.params;
    const { talla, stock_nuevo, stock_reutilizable } = req.body;

    await db.query('START TRANSACTION');

    try {
      // Actualizar talla
      await db.query(
        'UPDATE tallas_articulos SET talla = ? WHERE id_talla = ? AND id_articulo = ?',
        [talla, idTalla, id]
      );

      // Actualizar stocks
      if (stock_nuevo !== undefined) {
        await db.query(
          `INSERT INTO stock_dotacion (id_talla, estado, cantidad)
           VALUES (?, 'nuevo', ?)
           ON DUPLICATE KEY UPDATE cantidad = ?`,
          [idTalla, stock_nuevo, stock_nuevo]
        );
      }

      if (stock_reutilizable !== undefined) {
        await db.query(
          `INSERT INTO stock_dotacion (id_talla, estado, cantidad)
           VALUES (?, 'reutilizable', ?)
           ON DUPLICATE KEY UPDATE cantidad = ?`,
          [idTalla, stock_reutilizable, stock_reutilizable]
        );
      }

      // Auditoría
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR_TALLA',
        descripcion: `Actualizada talla ID ${idTalla} del artículo ID ${id}`,
        tabla_afectada: 'tallas_articulos',
        id_registro_afectado: idTalla
      });

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Talla actualizada exitosamente'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en updateTalla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar talla',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
// Eliminar talla
async function removeTalla(req, res) {
  try {
    const { id, idTalla } = req.params;

    // Obtener información para auditoría
    const [talla] = await db.query(
      'SELECT talla FROM tallas_articulos WHERE id_talla = ? AND id_articulo = ?',
      [idTalla, id]
    );

    if (talla.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Talla no encontrada',
        code: 'TALLA_NO_ENCONTRADA'
      });
    }

    await db.query('START TRANSACTION');

    try {
      // Eliminar stock primero
      await db.query(
        'DELETE FROM stock_dotacion WHERE id_talla = ?',
        [idTalla]
      );

      // Luego eliminar talla
      await db.query(
        'DELETE FROM tallas_articulos WHERE id_talla = ? AND id_articulo = ?',
        [idTalla, id]
      );

      // Auditoría
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'ELIMINAR_TALLA',
        descripcion: `Eliminada talla ${talla[0].talla} (ID: ${idTalla}) del artículo ID ${id}`,
        tabla_afectada: 'tallas_articulos',
        id_registro_afectado: idTalla
      });

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Talla eliminada exitosamente'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en removeTalla:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar talla',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
// Métodos para stock
async function getStockByArticulo(req, res) {
  try {
    const { idArticulo } = req.params;

    const [stock] = await db.query(
      `SELECT 
        ta.id_talla,
        ta.talla,
        COALESCE(SUM(CASE WHEN sd.estado = 'nuevo' THEN sd.cantidad ELSE 0 END), 0) as stock_nuevo,
        COALESCE(SUM(CASE WHEN sd.estado = 'reutilizable' THEN sd.cantidad ELSE 0 END), 0) as stock_reutilizable
      FROM tallas_articulos ta
      LEFT JOIN stock_dotacion sd ON ta.id_talla = sd.id_talla
      WHERE ta.id_articulo = ?
      GROUP BY ta.id_talla, ta.talla`,
      [idArticulo]
    );

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error en getStockByArticulo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener stock del artículo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
async function ingresarStock(req, res) {
  try {
    const { id_talla, cantidad, estado, motivo } = req.body;

    await db.query('START TRANSACTION');

    try {
      // Registrar ingreso
      await db.query(
        'INSERT INTO stock_dotacion (id_talla, estado, cantidad) VALUES (?, ?, ?)',
        [id_talla, estado, cantidad]
      );

      // Auditoría
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'INGRESO_STOCK',
        descripcion: `Ingreso de ${cantidad} unidades (${estado}) para talla ID ${id_talla}. Motivo: ${motivo || 'No especificado'}`,
        tabla_afectada: 'stock_dotacion',
        id_registro_afectado: id_talla
      });

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Stock ingresado exitosamente'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en ingresarStock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al ingresar stock',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function retirarStock(req, res) {
  try {
    const { id_talla, cantidad, motivo, id_empleado } = req.body;

    // Verificar stock disponible
    const [stock] = await db.query(
      'SELECT SUM(cantidad) as total FROM stock_dotacion WHERE id_talla = ?',
      [id_talla]
    );

    if (stock[0].total < cantidad) {
      return res.status(400).json({
        success: false,
        error: 'No hay suficiente stock disponible',
        code: 'STOCK_INSUFICIENTE'
      });
    }

    await db.query('START TRANSACTION');

    try {
      // Registrar retiro
      await db.query(
        'INSERT INTO movimientos_stock (id_talla, cantidad, tipo, motivo, id_empleado) VALUES (?, ?, "salida", ?, ?)',
        [id_talla, cantidad, motivo, id_empleado]
      );

      // Actualizar stock (estrategia FIFO)
      await db.query(
        `UPDATE stock_dotacion sd
         JOIN (
           SELECT id_stock 
           FROM stock_dotacion 
           WHERE id_talla = ? 
           ORDER BY fecha_ingreso ASC
           LIMIT ?
         ) as oldest ON sd.id_stock = oldest.id_stock
         SET sd.cantidad = sd.cantidad - ?`,
        [id_talla, cantidad, cantidad]
      );

      // Eliminar registros con cantidad 0
      await db.query(
        'DELETE FROM stock_dotacion WHERE cantidad <= 0',
        [id_talla]
      );

      // Auditoría
      await logAuditoria({
        id_usuario: req.user.id_usuario,
        accion: 'RETIRO_STOCK',
        descripcion: `Retiro de ${cantidad} unidades de talla ID ${id_talla}. Motivo: ${motivo}`,
        tabla_afectada: 'stock_dotacion',
        id_registro_afectado: id_talla
      });

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Stock retirado exitosamente'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error en retirarStock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al retirar stock',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
async function getStockGeneral(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.nombre AS producto,
        a.genero AS tipo,
        ta.talla,
        COALESCE(SUM(sd.cantidad), 0) AS cantidad
      FROM articulos_dotacion a
      JOIN tallas_articulos ta ON a.id_articulo = ta.id_articulo
      LEFT JOIN stock_dotacion sd ON ta.id_talla = sd.id_talla
      WHERE a.eliminado = 0
      GROUP BY a.nombre, a.genero, ta.talla
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getStockGeneral:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el stock general',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}



module.exports = {
  getCategorias,
  createCategoria,
  deleteCategoria,
  getSubcategorias,
  createSubcategoria,
  deleteSubcategoria,
  getSubcategoriasByCategoria,
  getArticulos,
  getArticulosBySubcategoria,
  getAllArticulos,
  getArticuloById,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  getTallasByArticulo,
  addTallaToArticulo,
  updateTalla,
  removeTalla,
  getStockByArticulo,
  ingresarStock,
  retirarStock,
  getStockGeneral
};