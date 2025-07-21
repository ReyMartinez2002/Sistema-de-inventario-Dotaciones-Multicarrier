import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    username: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rol: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const toast = React.useRef(null);

  // Simulación de datos - en una app real esto vendría de tu API
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Simulando llamada a API
        const data = [
          { id_usuario: 1, nombre: 'Admin Principal', username: 'admin@multicarrier.com', id_rol: 1, rol: 'Super Admin', estado: 'activo' },
          { id_usuario: 2, nombre: 'Gerente Operaciones', username: 'gerente@multicarrier.com', id_rol: 2, rol: 'Administrador', estado: 'activo' },
          { id_usuario: 3, nombre: 'Analista RRHH', username: 'rrhh@multicarrier.com', id_rol: 3, rol: 'Visualizador', estado: 'activo' }
        ];
        setUsuarios(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const estadoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.estado === 'activo' ? 'Activo' : 'Inactivo'}
        severity={rowData.estado === 'activo' ? 'success' : 'danger'}
      />
    );
  };

  const accionesBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-outlined"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-outlined"
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    );
  };

  const confirmDelete = (usuario) => {
    confirmDialog({
      message: `¿Estás seguro de que quieres ${usuario.estado === 'activo' ? 'desactivar' : 'activar'} a ${usuario.nombre}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => toggleUsuarioStatus(usuario),
    });
  };

  const toggleUsuarioStatus = (usuario) => {
    // Aquí iría la llamada a tu API para cambiar el estado
    const updatedUsuarios = usuarios.map(u => 
      u.id_usuario === usuario.id_usuario 
        ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' } 
        : u
    );
    setUsuarios(updatedUsuarios);
    toast.current.show({
      severity: 'success',
      summary: 'Éxito',
      detail: `Usuario ${usuario.estado === 'activo' ? 'desactivado' : 'activado'} correctamente`,
      life: 3000
    });
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h2 className="m-0">Lista de Usuarios</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar usuarios..."
        />
      </span>
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={usuarios}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        loading={loading}
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={['nombre', 'username', 'rol']}
        header={header}
        emptyMessage="No se encontraron usuarios"
        resizableColumns
        columnResizeMode="expand"
        showGridlines
        responsiveLayout="scroll"
      >
        <Column field="id_usuario" header="ID" sortable style={{ width: '80px' }} />
        <Column field="nombre" header="Nombre" sortable filter filterField="nombre" />
        <Column field="username" header="Usuario" sortable filter filterField="username" />
        <Column field="rol" header="Rol" sortable filter filterField="rol" />
        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable />
        <Column body={accionesBodyTemplate} header="Acciones" style={{ width: '120px' }} />
      </DataTable>
    </div>
  );
};

export default ListaUsuarios;