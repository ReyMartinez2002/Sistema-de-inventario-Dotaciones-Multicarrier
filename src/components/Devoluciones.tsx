import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { addLocale } from "primereact/api";

interface Devolucion {
  id?: number;
  empleado: string;
  producto: string;
  tipo: string;
  talla: string;
  motivo: string;
  fecha: Date | null;
}

const productos = [
  { label: "Calzado de Goma", value: "calzado" },
  { label: "Pantalón", value: "pantalon" },
  { label: "Camisa tipo Polo", value: "camisa" },
  { label: "Chaqueta Hombre", value: "chaqueta" },
  { label: "Botas", value: "botas" },
  { label: "Gorra", value: "gorra" },
];

const tiposPorProducto: Record<string, string[]> = {
  calzado: ["Blanco", "Negro"],
  pantalon: ["Hombres Multicarrier", "Hombres Yapaya", "Mujeres Multicarrier"],
  camisa: [
    "Hombres (Multicarrier)",
    "Hombres (Yapaya)",
    "Hombres (Supervisor)",
    "Mujeres (Multicarrier)",
  ],
  chaqueta: ["Gruesa (Multicarrier)", "Delgada (Multicarrier)", "Yapaya", "Supervisor"],
  botas: ["Con punta de acero", "Sin punta de acero"],
  gorra: ["Multicarrier", "Yapaya"],
};

const tallasPorProducto: Record<string, string[]> = {
  calzado: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  pantalon: ["XS", "S", "M", "L", "XL", "XXL"],
  camisa: ["XS", "S", "M", "L", "XL", "XXL"],
  chaqueta: ["XS", "S", "M", "L", "XL", "XXL"],
  botas: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  gorra: ["Única"],
};

let idCounter = 1;

const Devoluciones: React.FC = () => {
  const [formData, setFormData] = useState<Devolucion>({
    empleado: "",
    producto: "",
    tipo: "",
    talla: "",
    motivo: "",
    fecha: null,
  });
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const toast = useRef<Toast>(null);

  addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ],
    monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    today: "Hoy",
    clear: "Limpiar",
  });

  const handleSubmit = () => {
    if (!formData.empleado || !formData.producto || !formData.tipo || !formData.talla || !formData.fecha || !formData.motivo) {
      toast.current?.show({ severity: "warn", summary: "Campos requeridos", detail: "Complete todos los campos", life: 3000 });
      return;
    }
    const newData = { ...formData, id: idCounter++ };
    setDevoluciones([...devoluciones, newData]);
    toast.current?.show({ severity: "success", summary: "Registrado", detail: "Devolución registrada" });
    setFormData({ empleado: "", producto: "", tipo: "", talla: "", motivo: "", fecha: null });
    setDialogVisible(false);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 style={{ color: "#cd1818" }}>Gestión de Devoluciones</h3>
          <Button label="Registrar Devolución" icon="pi pi-plus" className="p-button-danger" onClick={() => setDialogVisible(true)} />
        </div>
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
        </span>
        <DataTable value={devoluciones} paginator rows={5} responsiveLayout="scroll" globalFilter={globalFilter} emptyMessage="Sin registros">
          <Column field="empleado" header="Empleado" sortable filter />
          <Column field="producto" header="Producto" sortable filter />
          <Column field="tipo" header="Tipo" sortable filter />
          <Column field="talla" header="Talla" />
          <Column field="motivo" header="Motivo" />
          <Column field="fecha" header="Fecha" body={(row) => row.fecha?.toLocaleDateString("es-CO") ?? ""} />
        </DataTable>

        <Dialog visible={dialogVisible} onHide={() => setDialogVisible(false)} header="Registrar Devolución" modal style={{ width: "50vw" }}>
          <div className="p-fluid">
            <div className="formgrid grid">
              <div className="field col-12 md:col-6">
                <label>Empleado</label>
                <InputText value={formData.empleado} onChange={(e) => setFormData({ ...formData, empleado: e.target.value })} placeholder="Nombre del empleado" />
              </div>
              <div className="field col-12 md:col-6">
                <label>Producto</label>
                <Dropdown value={formData.producto} options={productos} onChange={(e) => setFormData({ ...formData, producto: e.value, tipo: "", talla: "" })} placeholder="Seleccione producto" />
              </div>
              <div className="field col-12 md:col-6">
                <label>Tipo</label>
                <Dropdown value={formData.tipo} options={(tiposPorProducto[formData.producto] || []).map(t => ({ label: t, value: t }))} onChange={(e) => setFormData({ ...formData, tipo: e.value })} placeholder="Seleccione tipo" disabled={!formData.producto} />
              </div>
              <div className="field col-12 md:col-6">
                <label>Talla</label>
                <Dropdown value={formData.talla} options={(tallasPorProducto[formData.producto] || []).map(t => ({ label: t, value: t }))} onChange={(e) => setFormData({ ...formData, talla: e.value })} placeholder="Seleccione talla" disabled={!formData.producto} />
              </div>
              <div className="field col-12">
                <label>Motivo</label>
                <InputText value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} placeholder="Motivo de la devolución" />
              </div>
              <div className="field col-12 md:col-6">
                <label>Fecha</label>
                <Calendar value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.value as Date })} locale="es" showIcon dateFormat="dd/mm/yy" />
              </div>
              <div className="col-12">
                <Button label="Guardar" icon="pi pi-check" className="p-button-success mt-3" onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Devoluciones;
