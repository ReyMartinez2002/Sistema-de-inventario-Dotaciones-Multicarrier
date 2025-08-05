import React, { useState, useRef, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import tipoDotacionApi from "../services/dotacionApi";
import { useAuth } from "../contex/useAuth";
import type { Categoria, Subcategoria } from "../types/Dotacion";

const safeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const GestionarTiposDotacion: React.FC = () => {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<Subcategoria | null>(null);
  const [categoriaDialog, setCategoriaDialog] = useState(false);
  const [subcategoriaDialog, setSubcategoriaDialog] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '' });
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState({ 
    nombre: '', 
    descripcion: '', 
    id_categoria: 0 
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const mostrarError = useCallback((mensaje: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 3000,
    });
  }, []);

  const mostrarExito = useCallback((mensaje: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: mensaje,
      life: 3000,
    });
  }, []);

  // Cargar categorías al inicio
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await tipoDotacionApi.getCategorias(token || '');
      setCategorias(safeArray(data));
    } catch (error) {
      mostrarError(`Error al cargar categorías: ${error instanceof Error ? error.message : String(error)}`);
      setCategorias([]);
    }
  };

  const cargarSubcategorias = async (idCategoria: number) => {
    try {
      const data = await tipoDotacionApi.getSubcategorias(token || '', idCategoria);
      setSubcategorias(safeArray(data));
    } catch (error) {
      mostrarError(`Error al cargar subcategorías: ${error instanceof Error ? error.message : String(error)}`);
      setSubcategorias([]);
    }
  };

  const crearCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      mostrarError("El nombre de la categoría es requerido");
      return;
    }

    setLoading(true);
    try {
      await tipoDotacionApi.createCategoria(token || '', nuevaCategoria);
      mostrarExito("Categoría creada exitosamente");
      setCategoriaDialog(false);
      setNuevaCategoria({ nombre: '' });
      await cargarCategorias();
    } catch (error) {
      mostrarError(`Error al crear categoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const crearSubcategoria = async () => {
    if (!nuevaSubcategoria.nombre.trim() || !nuevaSubcategoria.id_categoria) {
      mostrarError("Nombre y categoría son requeridos");
      return;
    }

    setLoading(true);
    try {
      await tipoDotacionApi.createSubcategoria(token || '', nuevaSubcategoria);
      mostrarExito("Subcategoría creada exitosamente");
      setSubcategoriaDialog(false);
      setNuevaSubcategoria({ nombre: '', descripcion: '', id_categoria: 0 });
      if (nuevaSubcategoria.id_categoria) {
        await cargarSubcategorias(nuevaSubcategoria.id_categoria);
      }
    } catch (error) {
      mostrarError(`Error al crear subcategoría: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCategoria = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría? Se eliminarán todas sus subcategorías.")) {
      return;
    }

    try {
      await tipoDotacionApi.deleteCategoria(token || '', id);
      mostrarExito("Categoría eliminada exitosamente");
      await cargarCategorias();
      setSubcategorias([]);
    } catch (error) {
      mostrarError(`Error al eliminar categoría: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const eliminarSubcategoria = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta subcategoría?")) {
      return;
    }

    try {
      await tipoDotacionApi.deleteSubcategoria(token || '', id);
      mostrarExito("Subcategoría eliminada exitosamente");
      if (selectedCategoria) {
        await cargarSubcategorias(selectedCategoria.id_categoria);
      }
    } catch (error) {
      mostrarError(`Error al eliminar subcategoría: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <h3 style={{ color: "#cd1818" }}>Gestión de Categorías y Subcategorías</h3>

        <div className="flex justify-content-between mb-4">
          <Button
            label="Nueva Categoría"
            icon="pi pi-plus"
            className="p-button-danger"
            onClick={() => setCategoriaDialog(true)}
          />
          <Button
            label="Nueva Subcategoría"
            icon="pi pi-plus"
            className="p-button-danger"
            onClick={() => setSubcategoriaDialog(true)}
            disabled={!selectedCategoria}
          />
        </div>

        <div className="grid">
          <div className="col-12 md:col-6">
            <h4>Categorías</h4>
            <DataTable
              value={categorias}
              selectionMode="single"
              selection={selectedCategoria}
              onSelectionChange={(e) => {
                setSelectedCategoria(e.value);
                if (e.value) {
                  cargarSubcategorias(e.value.id_categoria);
                }
              }}
              paginator
              rows={5}
              emptyMessage="No hay categorías registradas"
            >
              <Column field="nombre" header="Nombre" sortable />
              <Column
                header="Acciones"
                body={(rowData: Categoria) => (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => eliminarCategoria(rowData.id_categoria)}
                  />
                )}
                style={{ width: '80px' }}
              />
            </DataTable>
          </div>

          <div className="col-12 md:col-6">
            <h4>Subcategorías</h4>
            <DataTable
              value={subcategorias}
              selectionMode="single"
              selection={selectedSubcategoria}
              onSelectionChange={(e) => setSelectedSubcategoria(e.value)}
              paginator
              rows={5}
              emptyMessage={selectedCategoria ? "No hay subcategorías" : "Seleccione una categoría"}
            >
              <Column field="nombre" header="Nombre" sortable />
              <Column field="descripcion" header="Descripción" />
              <Column
                header="Acciones"
                body={(rowData: Subcategoria) => (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => eliminarSubcategoria(rowData.id_subcategoria)}
                  />
                )}
                style={{ width: '80px' }}
              />
            </DataTable>
          </div>
        </div>
      </div>

      {/* Diálogo para nueva categoría */}
      <Dialog
        visible={categoriaDialog}
        onHide={() => setCategoriaDialog(false)}
        header="Nueva Categoría"
        style={{ width: "50vw" }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label>Nombre de la categoría*</label>
            <InputText
              value={nuevaCategoria.nombre}
              onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
              placeholder="Ej: Ropa de trabajo"
              required
            />
          </div>
          <div className="flex justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setCategoriaDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              onClick={crearCategoria}
              loading={loading}
              disabled={!nuevaCategoria.nombre.trim()}
            />
          </div>
        </div>
      </Dialog>

      {/* Diálogo para nueva subcategoría */}
      <Dialog
        visible={subcategoriaDialog}
        onHide={() => setSubcategoriaDialog(false)}
        header="Nueva Subcategoría"
        style={{ width: "50vw" }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label>Categoría*</label>
            <Dropdown
              value={nuevaSubcategoria.id_categoria}
              options={categorias.map(c => ({
                label: c.nombre,
                value: c.id_categoria
              }))}
              onChange={(e) => setNuevaSubcategoria({
                ...nuevaSubcategoria,
                id_categoria: e.value
              })}
              placeholder="Seleccione categoría"
              className="w-full"
            />
          </div>
          <div className="field">
            <label>Nombre de la subcategoría*</label>
            <InputText
              value={nuevaSubcategoria.nombre}
              onChange={(e) => setNuevaSubcategoria({
                ...nuevaSubcategoria,
                nombre: e.target.value
              })}
              placeholder="Ej: Chalecos"
              required
            />
          </div>
          <div className="field">
            <label>Descripción</label>
            <InputText
              value={nuevaSubcategoria.descripcion}
              onChange={(e) => setNuevaSubcategoria({
                ...nuevaSubcategoria,
                descripcion: e.target.value
              })}
              placeholder="Descripción opcional"
            />
          </div>
          <div className="flex justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setSubcategoriaDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              onClick={crearSubcategoria}
              loading={loading}
              disabled={!nuevaSubcategoria.nombre.trim() || !nuevaSubcategoria.id_categoria}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default GestionarTiposDotacion;