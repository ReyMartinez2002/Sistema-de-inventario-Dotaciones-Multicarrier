# Backend Gestión Dotaciones

## Instalación

1. Clona el repositorio y entra a la carpeta backend.
2. Crea un archivo `.env` usando el ejemplo.
3. Instala dependencias:

    ```bash
    npm install
    ```

4. Corre el servidor:

    ```bash
    npm start
    ```

## Endpoints principales

- **/api/auth/login** (POST) — Login, retorna JWT.
- **/api/empleados** (GET, POST, PUT, DELETE) — CRUD de empleados.
- **/api/dotaciones** (GET, POST, PUT, DELETE) — CRUD de dotaciones.
- **/api/movimientos** (GET, POST) — Listado y registro de movimientos.
- **/api/auditoria** (GET) — Auditoría de acciones administrativas.

## Seguridad

- Todas las rutas (excepto login) requieren JWT en el header `Authorization: Bearer <token>`.
- Las rutas de creación/edición/eliminación requieren rol `admin`.

## Notas

- El backend está listo para consumir desde React, Angular, Vue, etc.
- Todo el acceso y las acciones quedan registradas (auditoría y logs).