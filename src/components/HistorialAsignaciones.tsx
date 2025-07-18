import React, { useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Asignacion {
  id: number;
  empleado: string;
  items: string;
  fecha: string;
  hora: string;
}

const HistorialAsignaciones: React.FC = () => {
  const [asignaciones] = useState<Asignacion[]>([ // Simulado, luego reemplaza con datos reales
    {
      id: 1,
      empleado: "Carlos Pérez",
      items: "Pantalón M, Botas 42, Camisa L",
      fecha: "2025-07-07",
      hora: "09:30",
    },
    {
      id: 2,
      empleado: "Laura Gómez",
      items: "Gorra, Pantalón S, Botas 39",
      fecha: "2025-07-07",
      hora: "10:45",
    },
  ]);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const toast = useRef<Toast>(null);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(asignaciones);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "historial_asignaciones.xlsx");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text("Historial de Asignaciones", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Empleado", "Items", "Fecha", "Hora"]],
      body: asignaciones.map((a) => [
        a.empleado,
        a.items,
        a.fecha,
        a.hora,
      ]),
    });
    doc.save("historial_asignaciones.pdf");
  };

  const leftToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button label="Exportar PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPdf} />
      <Button label="Exportar Excel" icon="pi pi-file-excel" severity="success" onClick={exportExcel} />
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
      <h4 className="m-0">Historial de Asignaciones</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const fechaFiltro = (
    <div className="flex gap-2 mt-3">
      <Calendar
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.value ?? null)}
        placeholder="Desde"
        dateFormat="yy-mm-dd"
        showIcon
      />
      <Calendar
        value={fechaFin}
        onChange={(e) => setFechaFin(e.value ?? null)}
        placeholder="Hasta"
        dateFormat="yy-mm-dd"
        showIcon
      />
    </div>
  );

  const datosFiltrados = asignaciones.filter((asig) => {
    const fechaAsig = new Date(asig.fecha);
    if (fechaInicio && fechaAsig < fechaInicio) return false;
    if (fechaFin && fechaAsig > fechaFin) return false;
    return true;
  });

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <Toolbar className="mb-4" left={leftToolbarTemplate} />
      {fechaFiltro}
      <DataTable
        value={datosFiltrados}
        paginator
        rows={5}
        globalFilter={globalFilter}
        header={header}
        responsiveLayout="scroll"
        emptyMessage="No se encontraron asignaciones."
      >
        <Column field="empleado" header="Empleado" sortable filter />
        <Column field="items" header="Dotaciones Asignadas" sortable filter />
        <Column field="fecha" header="Fecha" sortable filter />
        <Column field="hora" header="Hora" sortable filter />
      </DataTable>
    </div>
  );
};

export default HistorialAsignaciones;
