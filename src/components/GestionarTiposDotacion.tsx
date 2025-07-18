import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { v4 as uuidv4 } from "uuid";

interface TipoDotacion {
  id: string;
  producto: string;
  tipos: string[];
}

const GestionarTiposDotacion: React.FC = () => {
  const [listaTipos, setListaTipos] = useState<TipoDotacion[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("");
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([]);
  const [nuevoTipoInput, setNuevoTipoInput] = useState<string>("");
  const [nuevoProductoInput, setNuevoProductoInput] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const toast = useRef<Toast>(null);

  const obtenerTiposPorProducto = (producto: string): string[] => {
    const encontrado = listaTipos.find((d) => d.producto === producto);
    return encontrado ? encontrado.tipos : [];
  };

  const agregarTipoSiNoExiste = () => {
    if (!nuevoTipoInput.trim()) return;

    const producto = productoSeleccionado || nuevoProductoInput.trim();

    if (!producto) {
      toast.current?.show({
        severity: "warn",
        summary: "Selecciona o escribe un producto",
        detail: "Debes definir un producto antes de agregar tipos.",
        life: 3000,
      });
      return;
    }

    const tiposExistentes = obtenerTiposPorProducto(producto);

    if (tiposExistentes.includes(nuevoTipoInput.trim())) {
      toast.current?.show({
        severity: "info",
        summary: "Tipo existente",
        detail: "Ese tipo ya existe para este producto.",
        life: 3000,
      });
      return;
    }

    const actualizado = listaTipos.map((item) =>
      item.producto === producto
        ? { ...item, tipos: [...item.tipos, nuevoTipoInput.trim()] }
        : item
    );

    const productoExiste = listaTipos.some((item) => item.producto === producto);
    const nuevaLista = productoExiste
      ? actualizado
      : [
          ...listaTipos,
          {
            id: uuidv4(),
            producto,
            tipos: [nuevoTipoInput.trim()],
          },
        ];

    setListaTipos(nuevaLista);
    setTiposSeleccionados((prev) => [...prev, nuevoTipoInput.trim()]);
    setNuevoTipoInput("");
    if (!productoSeleccionado) {
      setProductoSeleccionado(producto);
    }
    toast.current?.show({
      severity: "success",
      summary: "Tipo agregado",
      detail: "Nuevo tipo agregado correctamente.",
      life: 2500,
    });
  };

  const guardar = () => {
    const producto = productoSeleccionado || nuevoProductoInput.trim();
    if (!producto || tiposSeleccionados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Selecciona o escribe un producto y al menos un tipo.",
        life: 3000,
      });
      return;
    }

    const yaExiste = listaTipos.some((item) => item.producto === producto);
    let actualizada: TipoDotacion[];

    if (yaExiste) {
      actualizada = listaTipos.map((item) =>
        item.producto === producto
          ? { ...item, tipos: tiposSeleccionados }
          : item
      );
    } else {
      actualizada = [
        ...listaTipos,
        {
          id: uuidv4(),
          producto,
          tipos: tiposSeleccionados,
        },
      ];
    }

    setListaTipos(actualizada);
    toast.current?.show({
      severity: "success",
      summary: "Guardado",
      detail: "Registro actualizado correctamente.",
      life: 3000,
    });

    setProductoSeleccionado("");
    setNuevoProductoInput("");
    setTiposSeleccionados([]);
    setDialogVisible(false);
  };

  const abrirDialogo = () => {
    setProductoSeleccionado("");
    setNuevoProductoInput("");
    setTiposSeleccionados([]);
    setNuevoTipoInput("");
    setDialogVisible(true);
  };

  const eliminarRegistro = (id: string) => {
    setListaTipos(listaTipos.filter((item) => item.id !== id));
    toast.current?.show({
      severity: "info",
      summary: "Eliminado",
      detail: "Registro eliminado.",
      life: 2000,
    });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 style={{ color: "#cd1818" }}>Gestionar Tipos de Dotación</h3>
          <Button
            label="Agregar"
            icon="pi pi-plus"
            className="p-button-danger"
            onClick={abrirDialogo}
          />
        </div>

        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
          />
        </span>

        <DataTable
          value={listaTipos}
          paginator
          rows={5}
          globalFilter={globalFilter}
          responsiveLayout="scroll"
          emptyMessage="No hay registros"
        >
          <Column field="producto" header="Producto" sortable />
          <Column
            field="tipos"
            header="Tipos"
            body={(rowData) => rowData.tipos.join(", ")}
          />
          <Column
            header="Acciones"
            body={(rowData) => (
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => eliminarRegistro(rowData.id)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header="Agregar Tipos"
        style={{ width: "50vw" }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label>Selecciona un producto</label>
            <Dropdown
              value={productoSeleccionado}
              options={listaTipos.map((p) => ({ label: p.producto, value: p.producto }))}
              onChange={(e) => {
                setProductoSeleccionado(e.value);
                setNuevoProductoInput("");
                const tipos = obtenerTiposPorProducto(e.value);
                setTiposSeleccionados(tipos);
              }}
              placeholder="Selecciona producto existente"
              className="mb-2"
            />
          </div>

          <div className="field">
            <label>O escribe un producto nuevo</label>
            <InputText
              value={nuevoProductoInput}
              onChange={(e) => {
                setNuevoProductoInput(e.target.value);
                setProductoSeleccionado("");
                setTiposSeleccionados([]);
              }}
              placeholder="Ej: Chaleco Reflectivo"
              className="mb-2"
            />
          </div>

          <div className="field">
            <label>Tipos existentes</label>
            <MultiSelect
              value={tiposSeleccionados}
              options={obtenerTiposPorProducto(productoSeleccionado || nuevoProductoInput).map((t) => ({
                label: t,
                value: t,
              }))}
              onChange={(e) => setTiposSeleccionados(e.value)}
              placeholder="Selecciona o escribe nuevos tipos"
              display="chip"
            />
          </div>

          <div className="field">
            <label>Agregar nuevo tipo</label>
            <div className="flex gap-2">
              <InputText
                value={nuevoTipoInput}
                onChange={(e) => setNuevoTipoInput(e.target.value)}
                placeholder="Ej: Tipo nuevo"
              />
              <Button
                icon="pi pi-plus"
                className="p-button-sm"
                onClick={agregarTipoSiNoExiste}
              />
            </div>
          </div>

          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={guardar}
            className="p-button-success mt-3"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default GestionarTiposDotacion;
