import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { addLocale } from "primereact/api";
import "./styles/RegistrarDotacionNueva.css";

interface DotacionNueva {
  id?: number;
  producto: string;
  tipo: string;
  color: string;
  talla: string;
  cantidad: number;
  fechaIngreso: Date | null;
  descripcion: string;
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
  pantalon: [
    "Hombres Multicarrier",
    "Hombres Yapaya",
    "Mujeres Multicarrier",
  ],
  camisa: [
    "Hombres (Multicarrier)",
    "Hombres (Yapaya)",
    "Hombres (Supervisor)",
    "Mujeres (Multicarrier)",
  ],
  chaqueta: [
    "Gruesa (Multicarrier)",
    "Delgada (Multicarrier)",
    "Yapaya",
    "Supervisor",
  ],
  botas: ["Con punta de acero", "Sin punta de acero"],
  gorra: ["Multicarrier", "Yapaya"],
};

const tallasPorProducto: Record<string, string[]> = {
  calzado: ["35","36", "37", "38", "39", "40", "41", "42", "43", "44"],
  pantalon: ["28","30", "32", "34", "36", "38", "40", "42", "44"],
  camisa: ["XS", "S", "M", "L", "XL", "XXL"],
  chaqueta: ["XS", "S", "M", "L", "XL", "XXL"],
  botas: ["35","36", "37", "38", "39", "40", "41", "42", "43", "44"],
  gorra: ["Única"],
};

let idCounter = 1;

const RegistrarDotacionNueva: React.FC = () => {
  const [formData, setFormData] = useState<DotacionNueva>({
    producto: "",
    tipo: "",
    color: "",
    talla: "",
    cantidad: 1,
    fechaIngreso: null,
    descripcion: "",
  });
  const [dotaciones, setDotaciones] = useState<DotacionNueva[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [selectedDotacion, setSelectedDotacion] = useState<DotacionNueva | null>(null);
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
    if (!formData.producto || !formData.tipo || !formData.cantidad || !formData.fechaIngreso) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos requeridos",
        detail: "Por favor, completa los campos obligatorios",
        life: 3000,
      });
      return;
    }

    const dataToSave = { ...formData, id: selectedDotacion?.id || idCounter++ };
    if (selectedDotacion) {
      setDotaciones(dotaciones.map(d => (d.id === selectedDotacion.id ? dataToSave : d)));
      toast.current?.show({ severity: "success", summary: "Actualizado", detail: "Registro editado" });
    } else {
      setDotaciones([...dotaciones, dataToSave]);
      toast.current?.show({ severity: "success", summary: "Registrado", detail: "Dotación registrada" });
    }

    setFormData({ producto: "", tipo: "", color: "", talla: "", cantidad: 1, fechaIngreso: null, descripcion: "" });
    setSelectedDotacion(null);
    setRegisterDialog(false);
    setEditDialog(false);
  };

  const handleEdit = (dotacion: DotacionNueva) => {
    setFormData(dotacion);
    setSelectedDotacion(dotacion);
    setEditDialog(true);
  };

  const handleDelete = (dotacion: DotacionNueva) => {
    setDotaciones(dotaciones.filter(d => d.id !== dotacion.id));
    toast.current?.show({ severity: "info", summary: "Eliminado", detail: "Dotación eliminada" });
  };

  const tipos = tiposPorProducto[formData.producto] || [];
  const tallas = tallasPorProducto[formData.producto] || [];

  const renderForm = (dialogTitle: string, visible: boolean, onHide: () => void) => (
    <Dialog visible={visible} onHide={onHide} header={dialogTitle} className="modal-form" style={{ width: '60vw' }} modal>
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label>Producto</label>
            <Dropdown value={formData.producto} options={productos} onChange={e => setFormData({ ...formData, producto: e.value, tipo: "", talla: "" })} placeholder="Seleccione un producto" />
          </div>
          <div className="field col-12 md:col-6">
            <label>Tipo</label>
            <Dropdown value={formData.tipo} options={tipos.map(t => ({ label: t, value: t }))} onChange={e => setFormData({ ...formData, tipo: e.value })} placeholder="Seleccione tipo" disabled={!formData.producto} />
          </div>
          <div className="field col-12 md:col-6">
            <label>Color</label>
            <InputText value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="Ingrese el color" />
            <small className="text-muted">Puedes ingresar un color nuevo</small>
          </div>
          <div className="field col-12 md:col-6">
            <label>Talla</label>
            <Dropdown value={formData.talla} options={tallas.map(t => ({ label: t, value: t }))} onChange={e => setFormData({ ...formData, talla: e.value })} placeholder="Seleccione talla" disabled={!formData.producto} />
          </div>
          <div className="field col-12 md:col-4">
            <label>Cantidad</label>
            <InputText type="number" value={formData.cantidad.toString()} onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value)}) } />
          </div>
          <div className="field col-12 md:col-4">
            <label>Fecha de Ingreso</label>
            <Calendar value={formData.fechaIngreso} onChange={e => setFormData({ ...formData, fechaIngreso: e.value as Date })} locale="es" showIcon dateFormat="dd/mm/yy" />
          </div>
          <div className="field col-12 md:col-4">
            <label>Descripción</label>
            <InputText value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Opcional" />
          </div>
        </div>
        <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} className="p-button-success mt-3" />
      </div>
    </Dialog>
  );

  return (
    <div className="p-4 container-registrar-dotacion">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 className="Titulo-gestion-dotaciones" style={{ color: "#cd1818" }}>Gestión de Dotaciones Nuevas</h3>
          <Button label="Registrar Nueva" icon="pi pi-plus icon-pi-plus" className="p-button-danger btn-registrar-nueva-dotacion" onClick={() => setRegisterDialog(true)} />
        </div>
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText className="input-buscar" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar en registros..." />
        </span>
        <DataTable value={dotaciones} paginator rows={5} responsiveLayout="scroll" globalFilter={globalFilter} filterDisplay="menu">
          <Column field="producto" header="Producto" sortable filter />
          <Column field="tipo" header="Tipo" sortable filter />
          <Column field="color" header="Color" filter />
          <Column field="talla" header="Talla" filter />
          <Column field="cantidad" header="Cantidad" />
          <Column field="fechaIngreso" header="Ingreso" body={d => d.fechaIngreso?.toLocaleDateString("es-CO") ?? ""} />
          <Column
            header="Acciones"
            body={rowData => (
              <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDelete(rowData)} />
              </>
            )}
          />
        </DataTable>
      </div>

      {renderForm("Registrar Dotación", registerDialog, () => setRegisterDialog(false))}
      {renderForm("Editar Dotación", editDialog, () => setEditDialog(false))}
    </div>
  );
};

export default RegistrarDotacionNueva;