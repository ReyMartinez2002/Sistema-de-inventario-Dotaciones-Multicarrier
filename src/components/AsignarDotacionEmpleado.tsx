import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { addLocale } from "primereact/api";

interface DotacionAsignada {
  producto: string;
  tipo: string;
  talla: string;
  fechaAsignacion: Date;
  horaAsignacion: string;
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
  gorra: ["Única"],
};

const AsignarDotacion: React.FC = () => {
  const [empleado, setEmpleado] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [fechaAsignacion, setFechaAsignacion] = useState<Date | null>(new Date());
  const [asignaciones, setAsignaciones] = useState<DotacionAsignada[]>([]);
  const toast = useRef<Toast>(null);

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    today: "Hoy",
    clear: "Limpiar",
  });

  const handleAgregarAsignacion = () => {
    if (!productoSeleccionado || !tipoSeleccionado || !tallaSeleccionada || !fechaAsignacion || !empleado) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Completa todos los campos antes de asignar",
      });
      return;
    }

    const hora = new Date().toLocaleTimeString();

    const nuevaAsignacion: DotacionAsignada = {
      producto: productoSeleccionado,
      tipo: tipoSeleccionado,
      talla: tallaSeleccionada,
      fechaAsignacion,
      horaAsignacion: hora,
    };

    setAsignaciones([...asignaciones, nuevaAsignacion]);
    setProductoSeleccionado("");
    setTipoSeleccionado("");
    setTallaSeleccionada("");
  };

  const tipos = tiposPorProducto[productoSeleccionado] || [];
  const tallas = tallasPorProducto[productoSeleccionado] || [];

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h3 style={{ color: "#cd1818" }}>Asignar Dotación a Empleado</h3>
      <div className="p-fluid grid">
        <div className="field col-12 md:col-6">
          <label>Empleado</label>
          <InputText value={empleado} onChange={(e) => setEmpleado(e.target.value)} placeholder="Nombre o ID del empleado" />
        </div>

        <div className="field col-12 md:col-4">
          <label>Producto</label>
          <Dropdown value={productoSeleccionado} options={productos} onChange={(e) => setProductoSeleccionado(e.value)} placeholder="Seleccione producto" />
        </div>

        <div className="field col-12 md:col-4">
          <label>Tipo</label>
          <Dropdown value={tipoSeleccionado} options={tipos.map(t => ({ label: t, value: t }))} onChange={(e) => setTipoSeleccionado(e.value)} placeholder="Seleccione tipo" disabled={!productoSeleccionado} />
        </div>

        <div className="field col-12 md:col-4">
          <label>Talla</label>
          <Dropdown value={tallaSeleccionada} options={tallas.map(t => ({ label: t, value: t }))} onChange={(e) => setTallaSeleccionada(e.value)} placeholder="Seleccione talla" disabled={!productoSeleccionado} />
        </div>

        <div className="field col-12 md:col-6">
          <label>Fecha de Asignación</label>
          <Calendar value={fechaAsignacion} onChange={(e) => setFechaAsignacion(e.value as Date)} locale="es" showIcon dateFormat="dd/mm/yy" />
        </div>

        <div className="col-12">
          <Button label="Agregar a Lista" icon="pi pi-plus" className="p-button-success" onClick={handleAgregarAsignacion} />
        </div>
      </div>

      <h4 className="mt-4">Dotaciones Asignadas</h4>
      <DataTable value={asignaciones} paginator rows={5} responsiveLayout="scroll">
        <Column field="producto" header="Producto" />
        <Column field="tipo" header="Tipo" />
        <Column field="talla" header="Talla" />
        <Column field="fechaAsignacion" header="Fecha" body={(row) => row.fechaAsignacion.toLocaleDateString("es-CO")} />
        <Column field="horaAsignacion" header="Hora" />
      </DataTable>
    </div>
  );
};

export default AsignarDotacion;
