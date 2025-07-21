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
import "./styles.css"

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
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Usuario[]>>(null);
  
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

  // Cargar datos de ejemplo (en un caso real sería una API)
  useEffect(() => {
    // Simular carga de datos
    const dummyUsers: Usuario[] = [
      {
        id_usuario: 1,
        username: 'superadmin',
        nombre: 'Administrador Principal',
        rol: 'superadmin',
        id_rol: 1,
        estado: 'activo',
        fecha_creacion: new Date('2023-01-01'),
        fecha_actualizacion: new Date('2023-01-02')
      },
      {
        id_usuario: 2,
        username: 'admin1',
        nombre: 'Administrador Secundario',
        rol: 'admin',
        id_rol: 2,
        estado: 'activo',
        fecha_creacion: new Date('2023-01-15'),
        fecha_actualizacion: new Date('2023-01-16')
      },
      {
        id_usuario: 3,
        username: 'viewer1',
        nombre: 'Usuario de Solo Lectura',
        rol: 'visualizador',
        id_rol: 3,
        estado: 'activo',
        fecha_creacion: new Date('2023-02-01'),
        fecha_actualizacion: null
      }
    ];
    setUsers(dummyUsers);
  }, []);

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
  const saveUser = () => {
    setSubmitted(true);

    // Validaciones
    if (!user.username || !user.nombre || !user.rol || !user.estado) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
        life: 3000
      });
      return;
    }

    if (!user.id_usuario && (!user.password || !user.confirmPassword)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida para nuevos usuarios',
        life: 3000
      });
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden',
        life: 3000
      });
      return;
    }

    // Simular guardado
    if (user.id_usuario) {
      // Actualizar usuario existente
      const updatedUsers = users.map(u => u.id_usuario === user.id_usuario ? user : u);
      setUsers(updatedUsers);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario actualizado',
        life: 3000
      });
    } else {
      // Crear nuevo usuario
      const newUser: Usuario = {
        ...user,
        id_usuario: users.length > 0 ? Math.max(...users.map(u => u.id_usuario || 0)) + 1 : 1,
        fecha_creacion: new Date(),
        password: user.password || '',
        confirmPassword: user.confirmPassword || ''
      };
      setUsers([...users, newUser]);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario creado',
        life: 3000
      });
    }

    setUserDialog(false);
  };

  // Confirmar eliminación
  const confirmDelete = (user: Usuario) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar a ${user.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteUser(user),
      reject: () => {}
    });
  };

  // Eliminar usuario
  const deleteUser = (user: Usuario) => {
    const updatedUsers = users.filter(u => u.id_usuario !== user.id_usuario);
    setUsers(updatedUsers);
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario eliminado',
      life: 3000
    });
  };

  // Plantilla para acciones
  const actionBodyTemplate = (rowData: Usuario) => {
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
          icon="pi pi-trash" 
          rounded 
          severity="warning" 
          className="p-button-sm" 
          onClick={() => confirmDelete(rowData)}
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla para estado
  const statusBodyTemplate = (rowData: Usuario) => {
    return (
      <span className={`p-badge ${rowData.estado === 'activo' ? 'p-badge-success' : 'p-badge-danger'}`}>
        {rowData.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Plantilla para fecha
  const dateBodyTemplate = (date: Date | null) => {
    return date ? new Date(date).toLocaleDateString() : '-';
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
            >
              <Column field="username" header="Usuario" sortable style={{ minWidth: '12rem' }} />
              <Column field="nombre" header="Nombre" sortable style={{ minWidth: '16rem' }} />
              <Column field="rol" header="Rol" sortable style={{ minWidth: '10rem' }} />
              <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }} />
              <Column field="fecha_creacion" header="Fecha Creación" body={(rowData) => dateBodyTemplate(rowData.fecha_creacion)} sortable style={{ minWidth: '12rem' }} />
              <Column field="fecha_actualizacion" header="Última Actualización" body={(rowData) => dateBodyTemplate(rowData.fecha_actualizacion)} sortable style={{ minWidth: '12rem' }} />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
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
                  feedback={false}
                  required
                  className={classNames({ 'p-invalid': submitted && !user.password })}
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