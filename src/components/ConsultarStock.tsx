import React, { useRef, useState, useEffect, useContext } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../components/styles/ConsultarStock.css";
import logo from "../assets/Icono-casco.png";
import DotacionApi from "../services/dotacionApi";
import { AuthContext } from "../contex/AuthContext";
import type { StockData } from "../types/Dotacion";

// 👇 Componente principal
const ConsultarStock: React.FC = () => {
  const toast = useRef<Toast>(null);
  const auth = useContext(AuthContext);
  const token = auth?.token || "";

  const [stock, setStock] = useState<StockData[]>([]);
  const [filteredStock, setFilteredStock] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);

  const [productoFilter, setProductoFilter] = useState<string | null>(null);
  const [generoFilter, setGeneroFilter] = useState<string | null>(null);
  const [tallaFilter, setTallaFilter] = useState<string | null>(null);

  const productos = Array.from(new Set(stock.map((s) => s.producto)));
  const generos = Array.from(new Set(stock.map((s) => s.tipo)));
  const tallasEnContexto = productoFilter
    ? Array.from(
        new Set(
          stock.filter((s) => s.producto === productoFilter).map((s) => s.talla)
        )
      )
    : Array.from(new Set(stock.map((s) => s.talla)));

  useEffect(() => {
    if (!token) return;
    const fetchStock = async () => {
      try {
        setLoading(true);
        const data = await DotacionApi.getStock(token);
        setStock(data);
        setFilteredStock(data);
      } catch (error: unknown) {
        let message = "No se pudo cargar el stock";
        if (error instanceof Error) message = error.message;
        toast.current?.show({
          severity: "error",
          summary: "Error al cargar stock",
          detail: message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [token]);

  useEffect(() => {
    let filtered = [...stock];
    if (productoFilter)
      filtered = filtered.filter((s) => s.producto === productoFilter);
    if (generoFilter)
      filtered = filtered.filter((s) => s.tipo === generoFilter);
    if (tallaFilter) filtered = filtered.filter((s) => s.talla === tallaFilter);
    setFilteredStock(filtered);
  }, [productoFilter, generoFilter, tallaFilter, stock]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleString("es-CO");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.addImage(logo, "PNG", 10, 10, 30, 30);
    doc.setFontSize(14);
    doc.text("Reporte de Stock", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, pageWidth - 10, 30, { align: "right" });

    const columns = ["Producto", "Genero", "Talla", "Cantidad"];
    const rows = filteredStock.map((item) => [
      item.producto,
      item.tipo,
      item.talla,
      item.cantidad.toString(),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columns],
      body: rows,
      margin: { bottom: 30 },
      didDrawPage: () => {
        const str =
          "Página " +
          (
            doc as unknown as { internal: { getNumberOfPages: () => number } }
          ).internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text("Multicarrier de Colombia S.A.S", 10, pageHeight - 10);
        doc.text(
          "Generado por el sistema de dotación EPP",
          pageWidth / 2,
          pageHeight - 10,
          {
            align: "center",
          }
        );
        doc.text(str, pageWidth - 10, pageHeight - 10, { align: "right" });
      },
    });

    doc.save("reporte_stock.pdf");
    toast.current?.show({
      severity: "success",
      summary: "PDF generado",
      detail: "Exportado correctamente",
    });
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "reporte_stock.xlsx");
    toast.current?.show({
      severity: "success",
      summary: "Excel generado",
      detail: "Exportado correctamente",
    });
  };

  const abrirVistaPrevia = () => {
    setPreviewDialog(true);
  };
  const obtenerTallasFiltradas = () => {
    const producto = productoFilter?.toLowerCase() || "";
    const esNumerico = ["zapato", "pantalón"].includes(producto);
    const esLetra = ["camisa", "chaqueta"].includes(producto);

    const esNumero = (t: string) => /^[0-9]+$/.test(t);
    const esAlfabeto = (t: string) => /^[a-zA-Z]+$/.test(t);

    if (esNumerico) return tallasEnContexto.filter(esNumero);
    if (esLetra) return tallasEnContexto.filter(esAlfabeto);
    return tallasEnContexto;
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 style={{ color: "#cd1818" }}>Consulta de Stock</h3>
          <Button
            label="Vista previa"
            icon="pi pi-eye"
            className="p-button-outlined"
            onClick={abrirVistaPrevia}
          />
        </div>

        <div className="grid mb-3">
          <div className="col-12 md:col-4">
            <Dropdown
              value={productoFilter}
              options={productos}
              onChange={(e) => setProductoFilter(e.value)}
              placeholder="Filtrar por producto"
              className="w-full"
              showClear
            />
          </div>
          <div className="col-12 md:col-4">
            <Dropdown
              value={generoFilter}
              options={generos}
              onChange={(e) => setGeneroFilter(e.value)}
              placeholder="Filtrar por género"
              className="w-full"
              showClear
            />
          </div>
          <div className="col-12 md:col-4">
            <Dropdown
              value={tallaFilter}
              options={obtenerTallasFiltradas()}
              onChange={(e) => setTallaFilter(e.value)}
              placeholder="Filtrar por talla"
              className="w-full"
              showClear
            />
          </div>
        </div>

        <DataTable
          value={filteredStock}
          loading={loading}
          paginator
          rows={9}
          responsiveLayout="scroll"
          emptyMessage="No hay stock disponible."
        >
          <Column field="producto" header="Producto" sortable />
          <Column field="tipo" header="Genero" sortable />
          <Column field="talla" header="Talla" sortable />
          <Column field="cantidad" header="Cantidad" sortable />
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

        <DataTable value={filteredStock} rows={5} responsiveLayout="scroll">
          <Column field="producto" header="Producto" />
          <Column field="tipo" header="Genero" />
          <Column field="talla" header="Talla" />
          <Column field="cantidad" header="Cantidad" />
        </DataTable>

        <div className="flex justify-content-end gap-2 mt-4 modal-preview-reporte">
          <Button
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            className="p-button-danger"
            onClick={exportarPDF}
          />
          <Button
            label="Exportar Excel"
            icon="pi pi-file-excel"
            className="p-button-success"
            onClick={exportarExcel}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ConsultarStock;
