import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../components/styles/ConsultarStock.css"; 

import logo from "../assets/Icono-casco.png"; // Asegúrate que este logo exista

interface StockItem {
  producto: string;
  tipo: string;
  talla: string;
  color: string;
  cantidad: number;
}

const ConsultarStock: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [stock] = useState<StockItem[]>([
    { producto: "Camisa tipo Polo", tipo: "Multicarrier", talla: "M", color: "Rojo", cantidad: 15 },
    { producto: "Pantalón", tipo: "Hombres Yapaya", talla: "L", color: "Azul", cantidad: 30 },
    { producto: "Botas", tipo: "Con punta de acero", talla: "42", color: "Negro", cantidad: 12 },
  ]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [previewDialog, setPreviewDialog] = useState(false);

  const exportarPDF = () => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleString("es-CO");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.addImage(logo, "PNG", 10, 10, 30, 30);
  doc.setFontSize(14);
  doc.text("Reporte de Stock", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Fecha: ${fecha}`, pageWidth - 10, 30, { align: "right" });

  // Tabla
  const columns = ["Producto", "Tipo", "Talla", "Color", "Cantidad"];
  const rows = stock.map((item) => [
    item.producto,
    item.tipo,
    item.talla,
    item.color,
    item.cantidad.toString(),
  ]);

  autoTable(doc, {
    startY: 40,
    head: [columns],
    body: rows,
    margin: { bottom: 30 }, // espacio para el footer
    didDrawPage: () => {
      const str = "Página " + doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text("Multicarrier de Colombia S.A.S", 10, pageHeight - 10);
      doc.text("Generado por el sistema de dotación EPP", pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text(str, pageWidth - 10, pageHeight - 10, { align: "right" });
    },
  });

  doc.save("reporte_stock.pdf");

  toast.current?.show({ severity: "success", summary: "PDF generado", detail: "Exportado correctamente" });
};


  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(stock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");

    XLSX.writeFile(wb, "reporte_stock.xlsx");
    toast.current?.show({ severity: "success", summary: "Excel generado", detail: "Exportado correctamente" });
  };

  const abrirVistaPrevia = () => {
    setPreviewDialog(true);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 style={{ color: "#cd1818" }}>Consulta de Stock</h3>
          <Button label="Vista previa" icon="pi pi-eye" className="p-button-outlined" onClick={abrirVistaPrevia} />
        </div>

        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar en stock..." />
        </span>

        <DataTable
          value={stock}
          paginator
          rows={5}
          globalFilter={globalFilter}
          responsiveLayout="scroll"
          emptyMessage="No hay stock disponible."
        >
          <Column field="producto" header="Producto" sortable />
          <Column field="tipo" header="Tipo" sortable />
          <Column field="talla" header="Talla" sortable />
          <Column field="color" header="Color" />
          <Column field="cantidad" header="Cantidad" />
        </DataTable>
      </div>

      <Dialog
        header="Previsualización del Reporte"
        visible={previewDialog}
        onHide={() => setPreviewDialog(false)}
        style={{ width: "80vw" }}
        modal
      >
        <div className="flex justify-content-between align-items-center mb-3">
          <div className="flex align-items-center gap-3">
            <img src={logo} alt="Logo" style={{ height: "40px" }} />
            <h4 className="m-0">Reporte de Stock</h4>
          </div>
          <small className="text-muted">
            Fecha: {new Date().toLocaleString("es-CO")}
          </small>
        </div>

        <DataTable value={stock} rows={5} responsiveLayout="scroll">
          <Column field="producto" header="Producto" />
          <Column field="tipo" header="Tipo" />
          <Column field="talla" header="Talla" />
          <Column field="color" header="Color" />
          <Column field="cantidad" header="Cantidad" />
        </DataTable>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Exportar PDF" icon="pi pi-file-pdf" className="p-button-danger" onClick={exportarPDF} />
          <Button label="Exportar Excel" icon="pi pi-file-excel" className="p-button-success" onClick={exportarExcel} />
        </div>
      </Dialog>
    </div>
  );
};

export default ConsultarStock;
