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

interface DotacionReutilizada {
  id?: number;
  producto: string;
  tipo: string;
  talla: string;
  estado: string;
  observacion: string;
  fechaReingreso: Date | null;
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
  camisa: ["Hombres (Multicarrier)", "Hombres (Yapaya)", "Hombres (Supervisor)", "Mujeres (Multicarrier)"],
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
  gorra: ["Unica"],
};

const estados = ["Buen estado", "Regular", "Dañado"];

let idCounter = 1;

const RegistrarDotacionReutilizada: React.FC = () => {
  const [formData, setFormData] = useState<DotacionReutilizada>({
    producto: "",
    tipo: "",
    talla: "",
    estado: "",
    observacion: "",
    fechaReingreso: null,
  });

  const [dotaciones, setDotaciones] = useState<DotacionReutilizada[]>([]);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDotacion, setSelectedDotacion] = useState<DotacionReutilizada | null>(null);
  const toast = useRef<Toast>(null);

  addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    today: "Hoy",
    clear: "Limpiar",
  });

  const handleSubmit = () => {
    if (!formData.producto || !formData.tipo || !formData.talla || !formData.estado || !formData.fechaReingreso) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos requeridos",
        detail: "Por favor, completa todos los campos obligatorios",
        life: 3000,
      });
      return;
    }

    const dataToSave = { ...formData, id: selectedDotacion?.id || idCounter++ };
    if (selectedDotacion) {
      setDotaciones(dotaciones.map(d => (d.id === selectedDotacion.id ? dataToSave : d)));
      toast.current?.show({ severity: "success", summary: "Actualizado", detail: "Registro actualizado" });
    } else {
      setDotaciones([...dotaciones, dataToSave]);
      toast.current?.show({ severity: "success", summary: "Registrado", detail: "Dotación reutilizada registrada" });
    }

    setFormData({ producto: "", tipo: "", talla: "", estado: "", observacion: "", fechaReingreso: null });
    setSelectedDotacion(null);
    setRegisterDialog(false);
    setEditDialog(false);
  };

  const handleEdit = (dotacion: DotacionReutilizada) => {
    setFormData(dotacion);
    setSelectedDotacion(dotacion);
    setEditDialog(true);
  };

  const handleDelete = (dotacion: DotacionReutilizada) => {
    setDotaciones(dotaciones.filter(d => d.id !== dotacion.id));
    toast.current?.show({ severity: "info", summary: "Eliminado", detail: "Registro eliminado" });
  };

  const tipos = tiposPorProducto[formData.producto] || [];
  const tallas = tallasPorProducto[formData.producto] || [];

  const renderForm = (title: string, visible: boolean, onHide: () => void) => (
    <Dialog visible={visible} onHide={onHide} header={title} style={{ width: "55vw" }} modal>
      <div className="p-fluid grid">
        <div className="field col-12 md:col-6">
          <label>Producto</label>
          <Dropdown value={formData.producto} options={productos} onChange={e => setFormData({ ...formData, producto: e.value, tipo: "", talla: "" })} placeholder="Seleccione producto" />
        </div>
        <div className="field col-12 md:col-6">
          <label>Tipo</label>
          <Dropdown value={formData.tipo} options={tipos.map(t => ({ label: t, value: t }))} onChange={e => setFormData({ ...formData, tipo: e.value })} placeholder="Seleccione tipo" disabled={!formData.producto} />
        </div>
        <div className="field col-12 md:col-4">
          <label>Talla</label>
          <Dropdown value={formData.talla} options={tallas.map(t => ({ label: t, value: t }))} onChange={e => setFormData({ ...formData, talla: e.value })} placeholder="Seleccione talla" disabled={!formData.producto} />
        </div>
        <div className="field col-12 md:col-4">
          <label>Estado</label>
          <Dropdown value={formData.estado} options={estados.map(e => ({ label: e, value: e }))} onChange={e => setFormData({ ...formData, estado: e.value })} placeholder="Seleccione estado" />
        </div>
        <div className="field col-12 md:col-4">
          <label>Fecha Reingreso</label>
          <Calendar value={formData.fechaReingreso} onChange={e => setFormData({ ...formData, fechaReingreso: e.value as Date })} locale="es" showIcon dateFormat="dd/mm/yy" />
        </div>
        <div className="field col-12">
          <label>Observación</label>
          <InputText value={formData.observacion} onChange={e => setFormData({ ...formData, observacion: e.target.value })} placeholder="Opcional" />
        </div>
        <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} className="p-button-success mt-2" />
      </div>
    </Dialog>
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 style={{ color: "#cd1818" }}>Dotación Reutilizada</h3>
          <Button label="Registrar Reutilización" icon="pi pi-plus" className="p-button-danger" onClick={() => setRegisterDialog(true)} />
        </div>
        <DataTable value={dotaciones} paginator rows={5} responsiveLayout="scroll">
          <Column field="producto" header="Producto" />
          <Column field="tipo" header="Tipo" />
          <Column field="talla" header="Talla" />
          <Column field="estado" header="Estado" />
          <Column field="fechaReingreso" header="Reingreso" body={d => d.fechaReingreso?.toLocaleDateString("es-CO") ?? ""} />
          <Column field="observacion" header="Observación" />
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

      {renderForm("Registrar Dotación Reutilizada", registerDialog, () => setRegisterDialog(false))}
      {renderForm("Editar Dotación Reutilizada", editDialog, () => setEditDialog(false))}
    </div>
  );
};

export default RegistrarDotacionReutilizada;