import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

const RolesPermisos = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [rolEdit, setRolEdit] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [descripcionRol, setDescripcionRol] = useState('');
  const toast = React.useRef(null);

  // Simulación de datos - en una app real esto vendría de tu API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Simulando llamada a API
        const data = [
          { id_rol: 1, nombre: 'superadmin', descripcion: 'Acceso total y creación de usuarios' },
          { id_rol: 2, nombre: 'admin', descripcion: 'Gestión completa de dotaciones y empleados, pero no usuarios' },
          { id_rol: 3, nombre: 'viewer', descripcion: 'Solo visualización y descarga de reportes' }
        ];
        setRoles(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const openNew = () => {
    setRolEdit(null);
    setNombreRol('');
    setDescripcionRol('');
    setVisibleDialog(true);
  };

  const openEdit = (rol) => {
    setRolEdit(rol);
    setNombreRol(rol.nombre);
    setDescripcionRol(rol.descripcion);
    setVisibleDialog(true);
  };

  const saveRol = () => {
    if (!nombreRol.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre del rol es requerido',
        life: 3000
      });
      return;
    }

    try {
      if (rolEdit) {
        // Actualizar rol existente
        const updatedRoles = roles.map(r => 
          r.id_rol === rolEdit.id_rol 
            ? { ...r, nombre: nombreRol, descripcion: descripcionRol } 
            : r
        );
        setRoles(updatedRoles);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol actualizado correctamente',
          life: 3000
        });
      } else {
        // Crear nuevo rol
        const newRol = {
          id_rol: Math.max(...roles.map(r => r.id_rol)) + 1,
          nombre: nombreRol,
          descripcion: descripcionRol
        };
        setRoles([...roles, newRol]);
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol creado correctamente',
          life: 3000
        });
      }
      setVisibleDialog(false);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar el rol',
        life: 3000
      });
    }
  };

  const accionesBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-outlined"
        onClick={() => openEdit(rowData)}
      />
    );
  };

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