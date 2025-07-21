import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { classNames } from 'primereact/utils';
import { Divider } from 'primereact/divider';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { Api } from '../../services/api';
import { useAuth } from '../../contex/useAuth';
import "./styles.css";

// Definición de tipos
type Rol = {
  label: string;
  value: string;
  id: number;
};

type Estado = {
  label: string;
  value: 'activo' | 'inactivo';
};

type Usuario = {
  id_usuario: number | null;
  username: string;
  password?: string;
  confirmPassword?: string;
  nombre: string;
  rol: string;
  id_rol: number | null;
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date | null;
  fecha_actualizacion: Date | null;
};

const UserManagement: React.FC = () => {
  // Estados
  const [users, setUsers] = useState<Usuario[]>([]);
  const [userDialog, setUserDialog] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Usuario[]>>(null);
  const { user: currentUser } = useAuth();
   const token = currentUser?.token;
  const api = new Api();
  
  // Estado para el formulario
  const [user, setUser] = useState<Usuario>({
    id_usuario: null,
    username: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rol: '',
    id_rol: null,
    estado: 'activo',
    fecha_creacion: null,
    fecha_actualizacion: null
  });

  // Roles disponibles
  const roles: Rol[] = [
    { label: 'Super Admin', value: 'superadmin', id: 1 },
    { label: 'Administrador', value: 'admin', id: 2 },
    { label: 'Visualizador', value: 'visualizador', id: 3 }
  ];

  // Estados disponibles
  const estados: Estado[] = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
  ];

  // Cargar usuarios desde el backend
  useEffect(() => {
    const loadUsers = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await api.users.getAll(token);
        setUsers(response.data);
      } catch (error: any) {
        showError('Error al cargar usuarios', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [token]);

  // Validación de contraseña
  const isPasswordValid = (password: string) => {
    if (!password) return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  // Mostrar mensaje de error
  const showError = (summary: string, detail: string) => {
    toast.current?.show({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  };

  // Mostrar mensaje de éxito
  const showSuccess = (detail: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail,
      life: 3000
    });
  };

  // Abrir diálogo para nuevo usuario
  const openNew = () => {
    setUser({
      id_usuario: null,
      username: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      rol: '',
      id_rol: null,
      estado: 'activo',
      fecha_creacion: null,
      fecha_actualizacion: null
    });
    setSubmitted(false);
    setUserDialog(true);
  };

  // Abrir diálogo para editar usuario
  const editUser = (user: Usuario) => {
    setUser({
      ...user,
      password: '',
      confirmPassword: ''
    });
    setUserDialog(true);
  };

  // Ocultar diálogo
  const hideDialog = () => {
    setSubmitted(false);
    setUserDialog(false);
  };

  // Guardar o actualizar usuario
  const saveUser = async () => {
    setSubmitted(true);

    // Validaciones básicas del formulario
    if (!user.username || !user.nombre || !user.rol || !user.estado) {
      showError('Error', 'Todos los campos son requeridos');
      return;
    }

    if (!user.id_usuario && (!user.password || !user.confirmPassword)) {
      showError('Error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (!user.id_usuario && !isPasswordValid(user.password || '')) {
      showError('Error', 'La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }

    if (user.password !== user.confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validación del token
    if (!token) {
      showError('Error de autenticación', 'No se encontró el token de acceso');
      return;
    }

    try {
      if (user.id_usuario) {
        // Actualizar usuario existente
        const { password, confirmPassword, ...userData } = user;
        await api.users.update(user.id_usuario, userData, token);

        // Actualizar estado local
        setUsers((prevUsers) =>
          Array.isArray(prevUsers)
            ? prevUsers.map(u => u.id_usuario === user.id_usuario ? user : u)
            : [user]
        );
        showSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const newUser = await api.users.create(
          {
            username: user.username,
            password: user.password!,
            nombre: user.nombre,
            rol: user.rol,
            id_rol: user.id_rol,
            estado: user.estado
          },
          token
        );

        // Verificación de datos y actualización del estado local
        const newUserData = newUser.data;

        setUsers((prevUsers) =>
          Array.isArray(prevUsers)
            ? [...prevUsers, newUserData]
            : [newUserData]
        );

        showSuccess('Usuario creado exitosamente');
      }

      setUserDialog(false);
    } catch (error: any) {
      console.error('Error en saveUser:', error);
      showError('Error al guardar usuario', error.message || 'Error inesperado');
    }
  };

  // Cambiar estado de usuario
  const changeStatus = async (user: Usuario) => {
    try {
      // Verificar que tenemos token
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
      
      await api.users.changeStatus(
        user.id_usuario as number, 
        newStatus,
        token // Aquí TypeScript sabe que token es string
      );
      
      // Actualizar estado local
      setUsers(users.map(u => 
        u.id_usuario === user.id_usuario 
          ? { ...u, estado: newStatus } 
          : u
      ));
      
      showSuccess(`Estado cambiado a ${newStatus}`);
    } catch (error: any) {
      showError('Error al cambiar estado', error.message);
    }
  };

  // Confirmar eliminación
  const confirmDelete = (user: Usuario) => {
    confirmDialog({
      message: `¿Estás seguro de ${user.estado === 'activo' ? 'desactivar' : 'activar'} a ${user.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => changeStatus(user),
      reject: () => {}
    });
  };

  // Plantilla para acciones
  const actionBodyTemplate = (rowData: Usuario) => {
    // No permitir editar/eliminar el usuario actual
    if (rowData.id_usuario === currentUser?.id) {
      return null;
    }

    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          rounded 
          severity="success" 
          className="p-button-sm" 
          onClick={() => editUser(rowData)} 
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          icon={rowData.estado === 'activo' ? 'pi pi-ban' : 'pi pi-check'} 
          rounded 
          severity={rowData.estado === 'activo' ? 'warning' : 'info'} 
          className="p-button-sm" 
          onClick={() => confirmDelete(rowData)}
          tooltip={rowData.estado === 'activo' ? 'Desactivar' : 'Activar'}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla para estado
  const statusBodyTemplate = (rowData?: Usuario) => {
    if (!rowData || !rowData.estado) {
      return <span className="p-badge p-badge-secondary">Desconocido</span>;
    }

    return (
      <span className={`p-badge ${rowData.estado === 'activo' ? 'p-badge-success' : 'p-badge-danger'}`}>
        {rowData.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Plantilla para fecha
  const dateBodyTemplate = (rowData: any) => {
    if (!rowData || !rowData.fecha_creacion) return '-';

    try {
      return new Date(rowData.fecha_creacion).toLocaleDateString('es-ES');
    } catch (err) {
      console.error('Fecha inválida:', rowData.fecha_creacion);
      return '-';
    }
  };

  // Encabezado de la tabla
  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
      <h2 className="m-0">Gestión de Usuarios</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText 
          type="search" 
          onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter(e.currentTarget.value)} 
          placeholder="Buscar..." 
          className="w-full sm:w-auto"
        />
      </span>
    </div>
  );

  // Barra de herramientas
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button 
          label="Nuevo Usuario" 
          icon="pi pi-plus" 
          severity="success" 
          onClick={openNew} 
          className="p-button-sm"
          disabled={currentUser?.rol !== 'superadmin'}
        />
      </div>
    );
  };

  // Pie de página del diálogo
  const userDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" text onClick={saveUser} />
    </>
  );

  return (
    <>
      <div className="seo-metadata" style={{ display: 'none' }}>
        <title>Gestión de Usuarios | Sistema Administrativo</title>
        <meta name="description" content="Administración de usuarios del sistema con roles de superadmin, admin y visualizador" />
        <meta name="keywords" content="usuarios, administración, roles, sistema" />
      </div>

      <div className="grid">
        <div className="col-12">
          <Card>
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

            <DataTable
              ref={dt}
              value={users}
              dataKey="id_usuario"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
              globalFilter={globalFilter}
              header={header}
              responsiveLayout="scroll"
              emptyMessage="No se encontraron usuarios."
              loading={loading}
            >
              <Column field="username" header="Usuario" sortable style={{ minWidth: '12rem' }} />
              <Column field="nombre" header="Nombre" sortable style={{ minWidth: '16rem' }} />
              <Column field="rol" header="Rol" sortable style={{ minWidth: '10rem' }} />
              <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }} />
              <Column field="fecha_creacion"  header="Fecha Creación"  body={dateBodyTemplate}  sortable  style={{ minWidth: '12rem' }} />
              <Column field="fecha_actualizacion" header="Última Actualización" body={(rowData) => dateBodyTemplate(rowData.fecha_actualizacion)} sortable style={{ minWidth: '12rem' }} />
              <Column 
                body={actionBodyTemplate} 
                exportable={false} 
                style={{ minWidth: '8rem' }}
                header="Acciones"
              />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Diálogo para agregar/editar usuario */}
      <Dialog 
        visible={userDialog} 
        style={{ width: '600px' }} 
        header={user.id_usuario ? 'Editar Usuario' : 'Nuevo Usuario'} 
        modal 
        className="p-fluid" 
        footer={userDialogFooter} 
        onHide={hideDialog}
      >
        <div className="grid formgrid p-fluid">
          <div className="field col-12">
            <label htmlFor="username" className="font-medium">
              Nombre de Usuario <span className="text-red-500">*</span>
            </label>
            <InputText
              id="username"
              value={user.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser({ ...user, username: e.target.value })}
              required
              placeholder='Ejemplo@gmail.com'
              className={classNames({ 'p-invalid': submitted && !user.username })}
              disabled={!!user.id_usuario}
            />
            {submitted && !user.username && (
              <small className="p-error">El nombre de usuario es requerido.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="nombre" className="font-medium">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <InputText
              id="nombre"
              value={user.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser({ ...user, nombre: e.target.value })}
              placeholder='Nombre y apellidos'
              required
              className={classNames({ 'p-invalid': submitted && !user.nombre })}
            />
            {submitted && !user.nombre && (
              <small className="p-error">El nombre completo es requerido.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="rol" className="font-medium">
              Rol <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="rol"
              value={user.rol}
              options={roles}
              optionLabel="label"
              optionValue="value"
              onChange={(e: { value: string }) => {
                const selectedRole = roles.find(r => r.value === e.value);
                setUser({ 
                  ...user, 
                  rol: e.value,
                  id_rol: selectedRole ? selectedRole.id : null
                });
              }}
              required
              className={classNames({ 'p-invalid': submitted && !user.rol })}
              disabled={currentUser?.rol !== 'superadmin'}
            />
            {submitted && !user.rol && (
              <small className="p-error">El rol es requerido.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="estado" className="font-medium">
              Estado <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="estado"
              value={user.estado}
              options={estados}
              optionLabel="label"
              optionValue="value"
              onChange={(e: { value: 'activo' | 'inactivo' }) => setUser({ ...user, estado: e.value })}
              required
              className={classNames({ 'p-invalid': submitted && !user.estado })}
              disabled={currentUser?.rol !== 'superadmin'}
            />
            {submitted && !user.estado && (
              <small className="p-error">El estado es requerido.</small>
            )}
          </div>

          {!user.id_usuario && (
            <>
              <Divider align="center">
                <span className="p-tag">Credenciales</span>
              </Divider>

              <div className="field col-12 md:col-6">
                <label htmlFor="password" className="font-medium">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <Password
                  id="password"
                  value={user.password || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser({ ...user, password: e.target.value })}
                  toggleMask
                  required
                  className={classNames({ 
                    'p-invalid': submitted && (!user.password || !isPasswordValid(user.password))
                  })}
                  promptLabel="Ingresa una contraseña"
                  weakLabel="Débil"
                  mediumLabel="Moderada"
                  strongLabel="Fuerte"
                  feedback
                  header={<div className="font-bold mb-2">Requisitos de contraseña</div>}
                  footer={
                    <div className="mt-2">
                      {!isPasswordValid(user.password || '') && (
                        <small className="p-error">La contraseña no cumple con los requisitos mínimos</small>
                      )}
                    </div>
                  }
                />
                {submitted && !user.password && (
                  <small className="p-error">La contraseña es requerida.</small>
                )}
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="confirmPassword" className="font-medium">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <Password
                  id="confirmPassword"
                  value={user.confirmPassword || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser({ ...user, confirmPassword: e.target.value })}
                  toggleMask
                  feedback={false}
                  required
                  className={classNames({ 
                    'p-invalid': submitted && 
                    (user.password !== user.confirmPassword || !user.confirmPassword)
                  })}
                />
                {submitted && user.password !== user.confirmPassword && (
                  <small className="p-error">Las contraseñas no coinciden.</small>
                )}
              </div>
            </>
          )}
        </div>
      </Dialog>

      <Toast ref={toast} />
      <ConfirmDialog />
    </>
  );
};

export default UserManagement;