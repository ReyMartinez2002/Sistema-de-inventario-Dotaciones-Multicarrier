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
import type { Categoria, Subcategoria, Articulo, ArticuloForm } from "../types/Dotacion";

const safeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const GestionarTiposDotacion: React.FC = () => {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<Subcategoria | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [nuevoArticulo, setNuevoArticulo] = useState<ArticuloForm>({
    nombre: '',
    descripcion: '',
    genero: 'Unisex',
    id_subcategoria: 0
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

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await tipoDotacionApi.getCategorias(token || '');
        setCategorias(safeArray(data));
      } catch (error) {
        mostrarError(`Error al cargar categorías: ${error instanceof Error ? error.message : String(error)}`);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, [token, mostrarError]);

  useEffect(() => {
    if (selectedCategoria) {
      const cargarSubcategorias = async () => {
        try {
          const data = await tipoDotacionApi.getSubcategorias(token || '', selectedCategoria.id_categoria);
          setSubcategorias(safeArray(data));
          setSelectedSubcategoria(null);
        } catch (error) {
          mostrarError(`Error al cargar subcategorías: ${error instanceof Error ? error.message : String(error)}`);
          setSubcategorias([]);
        }
      };
      cargarSubcategorias();
    } else {
      setSubcategorias([]);
      setSelectedSubcategoria(null);
    }
  }, [selectedCategoria, token, mostrarError]);

  useEffect(() => {
    if (selectedSubcategoria) {
      const cargarArticulos = async () => {
        try {
          const data = await tipoDotacionApi.getArticulos(token || '', selectedSubcategoria.id_subcategoria);
          setArticulos(safeArray(data));
        } catch (error) {
          mostrarError(`Error al cargar artículos: ${error instanceof Error ? error.message : String(error)}`);
          setArticulos([]);
        }
      };
      cargarArticulos();
    } else {
      setArticulos([]);
    }
  }, [selectedSubcategoria, token, mostrarError]);

  const abrirDialogoNuevoArticulo = () => {
    if (!selectedSubcategoria) {
      mostrarError("Debe seleccionar una subcategoría primero");
      return;
    }
    setNuevoArticulo({
      nombre: '',
      descripcion: '',
      genero: 'Unisex',
      id_subcategoria: selectedSubcategoria.id_subcategoria
    });
    setDialogVisible(true);
  };

  const guardarArticulo = async () => {
    if (!nuevoArticulo.nombre.trim()) {
      mostrarError("El nombre del artículo es requerido");
      return;
    }

    setLoading(true);
    try {
      await tipoDotacionApi.createArticulo(token || '', {
        ...nuevoArticulo,
        descripcion: nuevoArticulo.descripcion || undefined
      });
      mostrarExito("Artículo creado exitosamente");
      
      if (selectedSubcategoria) {
        const data = await tipoDotacionApi.getArticulos(token || '', selectedSubcategoria.id_subcategoria);
        setArticulos(safeArray(data));
      }
      
      setDialogVisible(false);
    } catch (error) {
      mostrarError(`Error al guardar el artículo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="card">
        <h3 style={{ color: "#cd1818" }}>Gestión de Dotaciones</h3>

        <div className="grid mt-3">
          <div className="col-12 md:col-4">
            <label>Categoría</label>
            <Dropdown
              value={selectedCategoria}
              options={safeArray(categorias)}
              onChange={(e) => setSelectedCategoria(e.value)}
              optionLabel="nombre"
              placeholder="Seleccione una categoría"
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-4">
            <label>Subcategoría</label>
            <Dropdown
              value={selectedSubcategoria}
              options={safeArray(subcategorias)}
              onChange={(e) => setSelectedSubcategoria(e.value)}
              optionLabel="nombre"
              placeholder="Seleccione una subcategoría"
              className="w-full"
              disabled={!selectedCategoria}
            />
          </div>

          <div className="col-12 md:col-4 flex align-items-end">
            <Button
              label="Nuevo Artículo"
              icon="pi pi-plus"
              className="p-button-danger"
              onClick={abrirDialogoNuevoArticulo}
              disabled={!selectedSubcategoria}
            />
          </div>
        </div>

        <DataTable
          value={safeArray(articulos)}
          paginator
          rows={5}
          loading={loading}
          emptyMessage="No hay artículos registrados"
          className="mt-3"
        >
          <Column field="nombre" header="Nombre" sortable />
          <Column 
            field="descripcion" 
            header="Descripción" 
            body={(rowData) => rowData.descripcion || '-'} 
          />
          <Column field="genero" header="Género" />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header="Nuevo Artículo de Dotación"
        style={{ width: "50vw" }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label>Nombre del artículo*</label>
            <InputText
              value={nuevoArticulo.nombre}
              onChange={(e) => setNuevoArticulo({...nuevoArticulo, nombre: e.target.value})}
              placeholder="Ej: Chaleco reflectivo"
              required
            />
          </div>

          <div className="field">
            <label>Descripción</label>
            <InputText
              value={nuevoArticulo.descripcion || ''}
              onChange={(e) => setNuevoArticulo({
                ...nuevoArticulo, 
                descripcion: e.target.value || undefined
              })}
              placeholder="Descripción del artículo (opcional)"
            />
          </div>

          <div className="field">
            <label>Género*</label>
            <Dropdown
              value={nuevoArticulo.genero}
              options={[
                { label: 'Unisex', value: 'Unisex' },
                { label: 'Masculino', value: 'Masculino' },
                { label: 'Femenino', value: 'Femenino' }
              ]}
              onChange={(e) => setNuevoArticulo({...nuevoArticulo, genero: e.value})}
              placeholder="Seleccione género"
              className="w-full"
              required
            />
          </div>

          <div className="flex justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
              disabled={loading}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              onClick={guardarArticulo}
              loading={loading}
              disabled={!nuevoArticulo.nombre.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default GestionarTiposDotacion;