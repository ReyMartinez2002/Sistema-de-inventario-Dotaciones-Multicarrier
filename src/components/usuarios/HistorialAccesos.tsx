import  { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const HistorialAccesos = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    username: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fecha_acceso: { value: null, matchMode: FilterMatchMode.DATE_IS },
    exito: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Simulación de datos - en una app real esto vendría de tu API
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        // Simulando llamada a API
        const data = [
          { id: 1, username: 'admin@multicarrier.com', fecha_acceso: '2025-07-19 10:05:40', ip_acceso: '::1', exito: true },
          { id: 2, username: 'admin@multicarrier.com', fecha_acceso: '2025-07-19 10:10:07', ip_acceso: '::1', exito: false },
          { id: 3, username: 'gerente@multicarrier.com', fecha_acceso: '2025-07-19 11:15:58', ip_acceso: '192.168.1.1', exito: true },
          { id: 4, username: 'rrhh@multicarrier.com', fecha_acceso: '2025-07-19 12:32:23', ip_acceso: '192.168.1.2', exito: true }
        ];
        setHistorial(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching historial:', error);
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onDateChange = (e) => {
    setDateRange(e.value);
    let _filters = { ...filters };
    _filters['fecha_acceso'].value = e.value;
    setFilters(_filters);
  };

  const estadoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.exito ? 'Éxito' : 'Fallido'}
        severity={rowData.exito ? 'success' : 'danger'}
      />
    );
  };

  const fechaBodyTemplate = (rowData) => {
    return new Date(rowData.fecha_acceso).toLocaleString();
  };

  const exitoFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={[
          { label: 'Todos', value: null },
          { label: 'Éxito', value: true },
          { label: 'Fallido', value: false }
        ]}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Filtrar por estado"
      />
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
      <h2 className="m-0">Historial de Accesos</h2>
      <div className="flex flex-column md:flex-row gap-3 w-full md:w-auto">
        <span className="p-input-icon-left w-full md:w-auto">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar en historial..."
            className="w-full"
          />
        </span>
        <Calendar
          value={dateRange}
          onChange={onDateChange}
          selectionMode="range"
          readOnlyInput
          placeholder="Filtrar por fecha"
          dateFormat="dd/mm/yy"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={historial}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        loading={loading}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={['username', 'ip_acceso']}
        header={header}
        emptyMessage="No se encontraron registros"
        resizableColumns
        columnResizeMode="expand"
        showGridlines
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" sortable style={{ width: '80px' }} />
        <Column field="username" header="Usuario" sortable filter filterField="username" />
        <Column field="fecha_acceso" header="Fecha Acceso" body={fechaBodyTemplate} sortable />
        <Column field="ip_acceso" header="Dirección IP" sortable />
        <Column 
          field="exito" 
          header="Estado" 
          body={estadoBodyTemplate} 
          sortable 
          filter 
          filterField="exito" 
          filterElement={exitoFilterTemplate}
        />
      </DataTable>
    </div>
  );
};

export default HistorialAccesos;