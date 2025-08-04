-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-08-2025 a las 06:41:56
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dotacionesdb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesos_token`
--

CREATE TABLE `accesos_token` (
  `id` int(11) NOT NULL,
  `token` text NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `metodo` varchar(10) NOT NULL,
  `fecha_acceso` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `accesos_token`
--

INSERT INTO `accesos_token` (`id`, `token`, `id_usuario`, `ruta`, `metodo`, `fecha_acceso`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjo1LCJ1c2VybmFtZSI6ImZyYnNmcmJzMUBnbWFpbC5jb20iLCJub21icmUiOiJSZXluYWxkbyBKb3NlIE1hcnRpbmV6IEZ1ZW50ZXMiLCJyb2wiOiJzdXBlcmFkbWluIiwiaWRfcm9sIjozLCJzZXNzaW9uSWQiOiIwZTU4ZGMyMi00ZDZjLTQ5YWYtOTdmYy1kNjYyZmJkZDlkY2MiLCJpYXQiOjE3NTI5ODg4OTcsImV4cCI6MTc1MzU5MzY5N30.rMyoIZcV3gt_EFej5or5h85JrKJYp7NJMVPmir_xUvM', 5, '/validate', 'GET', '2025-07-20 05:21:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_adjuntos`
--

CREATE TABLE `archivos_adjuntos` (
  `id_archivo` int(11) NOT NULL,
  `tipo_tabla` enum('movimiento','asignacion') NOT NULL,
  `id_tabla` int(11) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `fecha_subida` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulos_dotacion`
--

CREATE TABLE `articulos_dotacion` (
  `id_articulo` int(11) NOT NULL,
  `id_subcategoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `genero` enum('Masculino','Femenino','Unisex') DEFAULT 'Unisex',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `eliminado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `articulos_dotacion`
--

INSERT INTO `articulos_dotacion` (`id_articulo`, `id_subcategoria`, `nombre`, `descripcion`, `genero`, `fecha_creacion`, `fecha_actualizacion`, `eliminado`) VALUES
(1, 5, 'Camisa multicarrier', 'Camisa institucional con logo bordado', 'Masculino', '2025-08-04 00:00:00', NULL, 0),
(2, 6, 'Pantalón Multicarrier', 'Pantalón cargo resistente', 'Masculino', '2025-08-04 00:00:00', NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `tabla_afectada` varchar(50) DEFAULT NULL,
  `id_registro_afectado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria`
--

INSERT INTO `auditoria` (`id_auditoria`, `id_usuario`, `accion`, `descripcion`, `fecha`, `tabla_afectada`, `id_registro_afectado`) VALUES
(1, 5, 'ACTUALIZAR', 'Actualización de dotación', '2025-07-27 17:12:45', 'dotaciones', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_dotacion`
--

CREATE TABLE `categorias_dotacion` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_dotacion`
--

INSERT INTO `categorias_dotacion` (`id_categoria`, `nombre`) VALUES
(3, 'Uniformes'),
(4, 'Tecnología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id_empleado` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `documento` varchar(30) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `cargo` varchar(50) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `estado` enum('activo','retirado') NOT NULL DEFAULT 'activo',
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_asignaciones`
--

CREATE TABLE `historial_asignaciones` (
  `id_historial` int(11) NOT NULL,
  `id_talla` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_usuario_entrega` int(11) NOT NULL,
  `fecha_entrega` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_devolucion` datetime DEFAULT NULL,
  `id_usuario_devolucion` int(11) DEFAULT NULL,
  `estado_al_devolver` enum('nuevo','reutilizable','dañado') DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_dotacion`
--

CREATE TABLE `movimientos_dotacion` (
  `id_movimiento` int(11) NOT NULL,
  `id_talla` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_movimiento` enum('ENTRADA','SALIDA','DEVOLUCION','AJUSTE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `cantidad` int(11) NOT NULL,
  `estado` enum('nuevo','reutilizable','dañado') DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre`, `descripcion`) VALUES
(1, 'superadmin', 'Acceso total y creación de usuarios'),
(2, 'admin', 'Gestión completa de dotaciones y empleados, pero no usuarios'),
(3, 'Visualizador', 'Solo visualización y descarga de reportes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock_dotacion`
--

CREATE TABLE `stock_dotacion` (
  `id_stock` int(11) NOT NULL,
  `id_talla` int(11) NOT NULL,
  `estado` enum('nuevo','reutilizable','dañado') NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `fecha_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `stock_dotacion`
--

INSERT INTO `stock_dotacion` (`id_stock`, `id_talla`, `estado`, `cantidad`, `fecha_actualizacion`) VALUES
(1, 1, 'nuevo', 10, '2025-08-04 00:00:00'),
(2, 1, 'reutilizable', 5, '2025-08-04 00:00:00'),
(3, 2, 'nuevo', 8, '2025-08-04 00:00:00'),
(4, 3, 'nuevo', 15, '2025-08-04 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategorias_dotacion`
--

CREATE TABLE `subcategorias_dotacion` (
  `id_subcategoria` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `subcategorias_dotacion`
--

INSERT INTO `subcategorias_dotacion` (`id_subcategoria`, `id_categoria`, `nombre`, `descripcion`) VALUES
(5, 3, 'Camisas', 'Camisas institucionales con logo bordado'),
(6, 3, 'Pantalones', 'Pantalones resistentes tipo cargo'),
(7, 4, 'Celulares empresariales', 'Dispositivos móviles asignados para trabajo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tallas_articulos`
--

CREATE TABLE `tallas_articulos` (
  `id_talla` int(11) NOT NULL,
  `id_articulo` int(11) NOT NULL,
  `talla` varchar(20) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tallas_articulos`
--

INSERT INTO `tallas_articulos` (`id_talla`, `id_articulo`, `talla`, `fecha_creacion`) VALUES
(1, 1, 'M', '2025-08-04 00:00:00'),
(2, 1, 'L', '2025-08-04 00:00:00'),
(3, 2, '38', '2025-08-04 00:00:00'),
(4, 2, '40', '2025-08-04 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tokens_invalidados`
--

CREATE TABLE `tokens_invalidados` (
  `id_token` int(11) NOT NULL,
  `token` varchar(512) NOT NULL,
  `fecha_invalidacion` datetime DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_login`
--

CREATE TABLE `usuarios_login` (
  `id_usuario` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_login`
--

INSERT INTO `usuarios_login` (`id_usuario`, `username`, `password_hash`, `nombre`, `rol`, `id_rol`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(5, 'frbsfrbs1@gmail.com', '$2b$12$9fyAJFTJ4UWnxm9d/r62fOS7lbj7gQILdx.k/9dz0EMABShCCg3DG', 'Reynaldo Jose Martinez Fuentes', 'superadmin', 3, 'activo', '2025-07-19 10:04:52', '2025-07-30 21:53:01'),
(6, 'rey@gmail.com', '$2b$12$NZXMkRn8/H/nC5UE6PHb8OlrB.kq8eaySiheQ6p8F.IYQSNivrmt.', 'reynaldo martinez fuentes', 'superadmin', 1, 'activo', '2025-07-21 20:11:51', '2025-07-30 20:21:12'),
(7, 'Marcela@gmail.com', '$2b$12$EzQnvGEbmnranElMQnwctu9MczB.ZpiAAxfOkvFgk.roBFoQBNWQ.', 'Marcela Isabel Contreras Soleras', 'visualizador', 3, 'inactivo', '2025-07-27 12:10:02', '2025-07-27 12:10:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_login_historial`
--

CREATE TABLE `usuarios_login_historial` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_acceso` datetime NOT NULL DEFAULT current_timestamp(),
  `ip_acceso` varchar(45) DEFAULT NULL,
  `exito` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_login_historial`
--

INSERT INTO `usuarios_login_historial` (`id`, `id_usuario`, `fecha_acceso`, `ip_acceso`, `exito`) VALUES
(12, 5, '2025-07-19 10:05:40', '::1', 1),
(156, 5, '2025-08-03 20:58:05', '::1', 1),
(157, 5, '2025-08-03 21:59:35', '::1', 1),
(158, 5, '2025-08-03 22:22:55', '::1', 1),
(159, 5, '2025-08-03 22:34:27', '::1', 1),
(160, 5, '2025-08-03 22:42:29', '::1', 1),
(161, 5, '2025-08-03 23:05:29', '::1', 1),
(162, 5, '2025-08-03 23:24:41', '::1', 1),
(163, 5, '2025-08-03 23:37:45', '::1', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_logout_historial`
--

CREATE TABLE `usuarios_logout_historial` (
  `id_logout` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_logout` datetime NOT NULL,
  `token` varchar(512) NOT NULL,
  `ip_logout` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accesos_token`
--
ALTER TABLE `accesos_token`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `archivos_adjuntos`
--
ALTER TABLE `archivos_adjuntos`
  ADD PRIMARY KEY (`id_archivo`);

--
-- Indices de la tabla `articulos_dotacion`
--
ALTER TABLE `articulos_dotacion`
  ADD PRIMARY KEY (`id_articulo`),
  ADD KEY `id_subcategoria` (`id_subcategoria`);

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `categorias_dotacion`
--
ALTER TABLE `categorias_dotacion`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `documento` (`documento`),
  ADD KEY `idx_empleados_documento` (`documento`);

--
-- Indices de la tabla `historial_asignaciones`
--
ALTER TABLE `historial_asignaciones`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_talla` (`id_talla`),
  ADD KEY `id_empleado` (`id_empleado`),
  ADD KEY `id_usuario_entrega` (`id_usuario_entrega`),
  ADD KEY `id_usuario_devolucion` (`id_usuario_devolucion`),
  ADD KEY `idx_historial_fecha_entrega` (`fecha_entrega`);

--
-- Indices de la tabla `movimientos_dotacion`
--
ALTER TABLE `movimientos_dotacion`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_talla` (`id_talla`),
  ADD KEY `id_empleado` (`id_empleado`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_movimientos_tipo` (`tipo_movimiento`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `stock_dotacion`
--
ALTER TABLE `stock_dotacion`
  ADD PRIMARY KEY (`id_stock`),
  ADD UNIQUE KEY `talla_estado` (`id_talla`,`estado`),
  ADD KEY `id_talla` (`id_talla`);

--
-- Indices de la tabla `subcategorias_dotacion`
--
ALTER TABLE `subcategorias_dotacion`
  ADD PRIMARY KEY (`id_subcategoria`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `tallas_articulos`
--
ALTER TABLE `tallas_articulos`
  ADD PRIMARY KEY (`id_talla`),
  ADD UNIQUE KEY `articulo_talla` (`id_articulo`,`talla`),
  ADD KEY `id_articulo` (`id_articulo`);

--
-- Indices de la tabla `tokens_invalidados`
--
ALTER TABLE `tokens_invalidados`
  ADD PRIMARY KEY (`id_token`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`);

--
-- Indices de la tabla `usuarios_login`
--
ALTER TABLE `usuarios_login`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `idx_usuarios_login_username` (`username`);

--
-- Indices de la tabla `usuarios_login_historial`
--
ALTER TABLE `usuarios_login_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuarios_logout_historial`
--
ALTER TABLE `usuarios_logout_historial`
  ADD PRIMARY KEY (`id_logout`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accesos_token`
--
ALTER TABLE `accesos_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1051;

--
-- AUTO_INCREMENT de la tabla `archivos_adjuntos`
--
ALTER TABLE `archivos_adjuntos`
  MODIFY `id_archivo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `articulos_dotacion`
--
ALTER TABLE `articulos_dotacion`
  MODIFY `id_articulo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `categorias_dotacion`
--
ALTER TABLE `categorias_dotacion`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_asignaciones`
--
ALTER TABLE `historial_asignaciones`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientos_dotacion`
--
ALTER TABLE `movimientos_dotacion`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `stock_dotacion`
--
ALTER TABLE `stock_dotacion`
  MODIFY `id_stock` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `subcategorias_dotacion`
--
ALTER TABLE `subcategorias_dotacion`
  MODIFY `id_subcategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tallas_articulos`
--
ALTER TABLE `tallas_articulos`
  MODIFY `id_talla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tokens_invalidados`
--
ALTER TABLE `tokens_invalidados`
  MODIFY `id_token` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_login`
--
ALTER TABLE `usuarios_login`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuarios_login_historial`
--
ALTER TABLE `usuarios_login_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=164;

--
-- AUTO_INCREMENT de la tabla `usuarios_logout_historial`
--
ALTER TABLE `usuarios_logout_historial`
  MODIFY `id_logout` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `articulos_dotacion`
--
ALTER TABLE `articulos_dotacion`
  ADD CONSTRAINT `articulos_dotacion_ibfk_1` FOREIGN KEY (`id_subcategoria`) REFERENCES `subcategorias_dotacion` (`id_subcategoria`);

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_login` (`id_usuario`);

--
-- Filtros para la tabla `historial_asignaciones`
--
ALTER TABLE `historial_asignaciones`
  ADD CONSTRAINT `historial_asignaciones_ibfk_1` FOREIGN KEY (`id_talla`) REFERENCES `tallas_articulos` (`id_talla`),
  ADD CONSTRAINT `historial_asignaciones_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`),
  ADD CONSTRAINT `historial_asignaciones_ibfk_3` FOREIGN KEY (`id_usuario_entrega`) REFERENCES `usuarios_login` (`id_usuario`),
  ADD CONSTRAINT `historial_asignaciones_ibfk_4` FOREIGN KEY (`id_usuario_devolucion`) REFERENCES `usuarios_login` (`id_usuario`);

--
-- Filtros para la tabla `movimientos_dotacion`
--
ALTER TABLE `movimientos_dotacion`
  ADD CONSTRAINT `movimientos_dotacion_ibfk_1` FOREIGN KEY (`id_talla`) REFERENCES `tallas_articulos` (`id_talla`),
  ADD CONSTRAINT `movimientos_dotacion_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`),
  ADD CONSTRAINT `movimientos_dotacion_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_login` (`id_usuario`);

--
-- Filtros para la tabla `stock_dotacion`
--
ALTER TABLE `stock_dotacion`
  ADD CONSTRAINT `stock_dotacion_ibfk_1` FOREIGN KEY (`id_talla`) REFERENCES `tallas_articulos` (`id_talla`);

--
-- Filtros para la tabla `subcategorias_dotacion`
--
ALTER TABLE `subcategorias_dotacion`
  ADD CONSTRAINT `subcategorias_dotacion_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_dotacion` (`id_categoria`);

--
-- Filtros para la tabla `tallas_articulos`
--
ALTER TABLE `tallas_articulos`
  ADD CONSTRAINT `tallas_articulos_ibfk_1` FOREIGN KEY (`id_articulo`) REFERENCES `articulos_dotacion` (`id_articulo`);

--
-- Filtros para la tabla `usuarios_login`
--
ALTER TABLE `usuarios_login`
  ADD CONSTRAINT `usuarios_login_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Filtros para la tabla `usuarios_login_historial`
--
ALTER TABLE `usuarios_login_historial`
  ADD CONSTRAINT `usuarios_login_historial_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_login` (`id_usuario`);

--
-- Filtros para la tabla `usuarios_logout_historial`
--
ALTER TABLE `usuarios_logout_historial`
  ADD CONSTRAINT `usuarios_logout_historial_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_login` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
