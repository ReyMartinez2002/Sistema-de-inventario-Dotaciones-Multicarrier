import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { fetchRoles, createRole, updateRole } from '../../services/roleApi';
import type { Role } from '../../services/roleApi';

const RolesPermisos: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false);
  const [rolEdit, setRolEdit] = useState<Role | null>(null);
  const [nombreRol, setNombreRol] = useState<string>('');
  const [descripcionRol, setDescripcionRol] = useState<string>('');
  const toast = useRef<Toast>(null);

  // Cargar roles desde la API
  const cargarRoles = async () => {
    setLoading(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error: unknown) {
      let msg = 'No se pudo cargar la lista de roles';
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
      ) {
        msg = (error as { message?: string }).message!;
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 3000
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const openNew = (): void => {
    setRolEdit(null);
    setNombreRol('');
    setDescripcionRol('');
    setVisibleDialog(true);
  };

  const openEdit = (rol: Role): void => {
    setRolEdit(rol);
    setNombreRol(rol.nombre);
    setDescripcionRol(rol.descripcion);
    setVisibleDialog(true);
  };

  const saveRol = async (): Promise<void> => {
    if (!nombreRol.trim()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre del rol es requerido',
        life: 3000
      });
      return;
    }

    try {
      if (rolEdit) {
        await updateRole(rolEdit.id_rol, nombreRol, descripcionRol);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol actualizado correctamente',
          life: 3000
        });
      } else {
        await createRole(nombreRol, descripcionRol);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol creado correctamente',
          life: 3000
        });
      }
      setVisibleDialog(false);
      cargarRoles();
    } catch (error: unknown) {
      let msg = 'Error al guardar el rol';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
      ) {
        msg = (error as { response?: { data?: { error?: string } } }).response!.data!.error!;
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 3000
      });
    }
  };

  const accionesBodyTemplate = (rowData: Role) => (
    <Button
      icon="pi pi-pencil"
      className="p-button-rounded p-button-success p-button-outlined"
      onClick={() => openEdit(rowData)}
      tooltip="Editar"
    />
  );

  const footerDialog = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setVisibleDialog(false)}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success"
        onClick={saveRol}
      />
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Roles y Permisos</h2>
        <Button
          label="Nuevo Rol"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
        />
      </div>

      <DataTable
        value={roles}
        paginator
        rows={10}
        loading={loading}
        emptyMessage="No se encontraron roles"
        showGridlines
      >
        <Column field="id_rol" header="ID" style={{ width: '80px' }} />
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column body={accionesBodyTemplate} header="Acciones" style={{ width: '100px' }} />
      </DataTable>

      <Dialog
        visible={visibleDialog}
        style={{ width: '450px' }}
        header={rolEdit ? 'Editar Rol' : 'Nuevo Rol'}
        modal
        footer={footerDialog}
        onHide={() => setVisibleDialog(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="nombre">Nombre del Rol*</label>
            <InputText
              id="nombre"
              value={nombreRol}
              onChange={(e) => setNombreRol(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="p-field">
            <label htmlFor="descripcion">Descripción</label>
            <InputText
              id="descripcion"
              value={descripcionRol}
              onChange={(e) => setDescripcionRol(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default RolesPermisos;