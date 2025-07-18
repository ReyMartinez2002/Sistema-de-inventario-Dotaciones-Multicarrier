import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import logo from "../assets/Icono-casco.png";

interface Movimiento {
  tipo: string;
  producto: string;
  detalle: string;
  cantidad: number;
  fecha: Date;
}

const tiposReporte = [
  { label: "Todos los Movimientos", value: "todos" },
  { label: "Entradas", value: "entrada" },
  { label: "Salidas", value: "salida" },
  { label: "Asignaciones", value: "asignacion" },
];

const ReporteDotaciones: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("todos");
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const datosMock: Movimiento[] = [
    { tipo: "entrada", producto: "Pantalón", detalle: "Ingreso bodega", cantidad: 50, fecha: new Date("2024-06-01") },
    { tipo: "salida", producto: "Botas", detalle: "Devolución", cantidad: 10, fecha: new Date("2024-06-05") },
    { tipo: "asignacion", producto: "Camisa", detalle: "Empleado Juan Perez", cantidad: 1, fecha: new Date("2024-06-10") },
    // más datos de ejemplo...
  ];

  const filtrarDatos = () => {
    return datosMock.filter((d) => {
      const f = new Date(d.fecha).getTime();
      const desde = fechaInicio ? new Date(fechaInicio).getTime() : 0;
      const hasta = fechaFin ? new Date(fechaFin).getTime() : Infinity;
      const dentroRango = f >= desde && f <= hasta;
      const coincideTipo = tipoSeleccionado === "todos" || d.tipo === tipoSeleccionado;
      return dentroRango && coincideTipo;
    });
  };

  const exportarExcel = () => {
    const datos = filtrarDatos().map((item) => ({
      Tipo: item.tipo,
      Producto: item.producto,
      Detalle: item.detalle,
      Cantidad: item.cantidad,
      Fecha: item.fecha.toLocaleDateString("es-CO"),
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte_dotaciones.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleString("es-CO");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(logo, "PNG", 10, 10, 30, 30);
    doc.setFontSize(14);
    doc.text("Reporte de Dotaciones", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, pageWidth - 10, 30, { align: "right" });

    const columns = ["Tipo", "Producto", "Detalle", "Cantidad", "Fecha"];
    const rows = filtrarDatos().map((item) => [
      item.tipo,
      item.producto,
      item.detalle,
      item.cantidad.toString(),
      item.fecha.toLocaleDateString("es-CO"),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columns],
      body: rows,
      margin: { bottom: 30 },
      didDrawPage: () => {
        const str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text("Multicarrier de Colombia S.A.S", 10, pageHeight - 10);
        doc.text("Generado por el sistema de dotación EPP", pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text(str, pageWidth - 10, pageHeight - 10, { align: "right" });
      },
    });

    doc.save("reporte_dotaciones.pdf");
    toast.current?.show({ severity: "success", summary: "PDF generado", detail: "Exportado correctamente" });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <h3 className="mb-3 text-danger">Reporte de Dotaciones</h3>

        <div className="formgrid grid mb-3">
          <div className="field col-12 md:col-4">
            <label>Desde</label>
            <Calendar value={fechaInicio} onChange={(e) => setFechaInicio(e.value)} showIcon dateFormat="dd/mm/yy" locale="es" />
          </div>
          <div className="field col-12 md:col-4">
            <label>Hasta</label>
            <Calendar value={fechaFin} onChange={(e) => setFechaFin(e.value)} showIcon dateFormat="dd/mm/yy" locale="es" />
          </div>
          <div className="field col-12 md:col-4">
            <label>Tipo de Reporte</label>
            <Dropdown
              value={tipoSeleccionado}
              options={tiposReporte}
              onChange={(e) => setTipoSeleccionado(e.value)}
              placeholder="Seleccione tipo"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <Button label="Mostrar Previsualización" icon="pi pi-eye" onClick={() => setMostrarPreview(true)} className="p-button-info" />
          <Button label="Exportar PDF" icon="pi pi-file-pdf" className="p-button-danger" onClick={exportarPDF} />
          <Button label="Exportar Excel" icon="pi pi-file-excel" className="p-button-success" onClick={exportarExcel} />
        </div>

        {mostrarPreview && (
          <DataTable value={filtrarDatos()} paginator rows={5} emptyMessage="Sin resultados">
            <Column field="tipo" header="Tipo" />
            <Column field="producto" header="Producto" />
            <Column field="detalle" header="Detalle" />
            <Column field="cantidad" header="Cantidad" />
            <Column
              field="fecha"
              header="Fecha"
              body={(rowData) => rowData.fecha.toLocaleDateString("es-CO")}
            />
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default ReporteDotaciones;
