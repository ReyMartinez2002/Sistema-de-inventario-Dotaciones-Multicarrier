import React, { useState, useRef, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { addLocale } from "primereact/api";
import { DotacionApi } from "../services/dotacionApi";
import { useAuth } from "../contex/useAuth";
import "./styles/RegistrarDotacionNueva.css";

type Genero = 'Masculino' | 'Femenino' | 'Unisex';

interface TallaData {
  talla: string;
  stock_nuevo: number;
  stock_reutilizable?: number;
  id_talla?: number;
}

interface ArticuloData {
  id_subcategoria: number;
  nombre: string;
  descripcion?: string;
  genero?: Genero;
  tallas?: TallaData[];
}

interface ArticuloApiResponse {
  id_articulo: number;
  id_subcategoria: number;
  nombre: string;
  descripcion: string | null;
  genero: string;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  eliminado: boolean;
}

interface Articulo extends ArticuloData {
  id_articulo: number;
  subcategoria?: string;
  categoria?: string;
  tallas?: (TallaData & { id_talla: number })[];
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

interface FormData {
  id_subcategoria: number;
  nombre: string;
  descripcion: string;
  genero: Genero;
}

interface TallaForm {
  talla: string;
  stock_nuevo: number;
  stock_reutilizable: number;
}

const safeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const RegistrarDotacionNueva: React.FC = () => {
  const { token } = useAuth();
  const dotacionApi = useRef(new DotacionApi()).current;
  const [formData, setFormData] = useState<FormData>({
    id_subcategoria: 0,
    nombre: "",
    descripcion: "",
    genero: "Unisex"
  });
  const [tallasForm, setTallasForm] = useState<TallaForm[]>([
    { talla: "", stock_nuevo: 0, stock_reutilizable: 0 }
  ]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [allSubcategorias, setAllSubcategorias] = useState<Subcategoria[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);

  addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: [
      "enero", "febrero", "marzo", "abril", "mayo", "junio", 
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ],
    monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    today: "Hoy",
    clear: "Limpiar",
  });

  const showError = useCallback((message: string) => {
    toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.current?.show({ severity: "success", summary: "Éxito", detail: message, life: 3000 });
  }, []);

  const loadData = useCallback(async () => {
    if (!token) {
      showError("No estás autenticado");
      return;
    }

    try {
      const [articulosResponse, categoriasResponse, subcategoriasResponse] = await Promise.all([
        dotacionApi.getAll(token),
        dotacionApi.getCategorias(token),
        dotacionApi.getSubcategorias(token),
      ]);

      const articulosData = safeArray(articulosResponse);
      const categoriasData = safeArray(categoriasResponse);
      const subcategoriasData = safeArray(subcategoriasResponse);

      const articulosFormateados = await Promise.all(
        articulosData.map(async (articulo: ArticuloApiResponse) => {
          const subcat = subcategoriasData.find((sc) => sc.id_subcategoria === articulo.id_subcategoria);
          const cat = subcat ? categoriasData.find((c) => c.id_categoria === subcat.id_categoria) : undefined;
          
          const tallasStock = safeArray(await dotacionApi.getTallasByArticulo(articulo.id_articulo, token));
          
          const tallas: (TallaData & { id_talla: number })[] = tallasStock.map(t => ({
            id_talla: t.id_talla || 0,
            talla: t.talla,
            stock_nuevo: t.stock_nuevo,
            stock_reutilizable: t.stock_reutilizable
          }));

          return {
            id_articulo: articulo.id_articulo,
            id_subcategoria: articulo.id_subcategoria,
            nombre: articulo.nombre,
            descripcion: articulo.descripcion || '',
            genero: articulo.genero as Genero,
            subcategoria: subcat?.nombre,
            categoria: cat?.nombre,
            tallas: tallas
          };
        })
      );

      setArticulos(articulosFormateados);
      setCategorias(categoriasData);
      setAllSubcategorias(subcategoriasData);
    } catch (error) {
      showError(`Error al cargar datos: ${error instanceof Error ? error.message : String(error)}`);
      setArticulos([]);
    }
  }, [token, dotacionApi, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!token) {
      showError("No estás autenticado");
      return;
    }

    if (!formData.id_subcategoria || !formData.nombre || tallasForm.some(t => !t.talla)) {
      showError("Por favor, completa todos los campos obligatorios");
      return;
    }

    try {
      const payload: ArticuloData = {
        id_subcategoria: formData.id_subcategoria,
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        genero: formData.genero,
        tallas: tallasForm
          .filter(t => t.talla)
          .map(t => ({
            talla: t.talla,
            stock_nuevo: t.stock_nuevo,
            stock_reutilizable: t.stock_reutilizable || undefined
          }))
      };

      if (selectedArticulo?.id_articulo) {
        await dotacionApi.update(selectedArticulo.id_articulo, payload, token);
        showSuccess("Artículo actualizado correctamente");
      } else {
        await dotacionApi.create(payload, token);
        showSuccess("Artículo registrado correctamente");
      }

      resetForm();
      loadData();
    } catch (error) {
      showError(`Error al guardar: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEdit = (articulo: Articulo) => {
    setFormData({
      id_subcategoria: articulo.id_subcategoria,
      nombre: articulo.nombre,
      descripcion: articulo.descripcion || "",
      genero: articulo.genero || "Unisex"
    });

    setTallasForm(
      articulo.tallas?.map(t => ({
        talla: t.talla,
        stock_nuevo: t.stock_nuevo,
        stock_reutilizable: t.stock_reutilizable || 0
      })) || [{ talla: "", stock_nuevo: 0, stock_reutilizable: 0 }]
    );

    setSelectedArticulo(articulo);
    
    if (articulo.id_subcategoria) {
      const subcat = allSubcategorias.find(sc => sc.id_subcategoria === articulo.id_subcategoria);
      if (subcat) {
        setSubcategorias(allSubcategorias.filter(sc => sc.id_categoria === subcat.id_categoria));
      }
    }

    setEditDialog(true);
  };

  const handleDelete = async (articulo: Articulo) => {
    if (!articulo.id_articulo || !token) {
      showError("No se puede eliminar: falta información de autenticación");
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar "${articulo.nombre}"?`)) {
      return;
    }

    try {
      await dotacionApi.delete(articulo.id_articulo, token);
      showSuccess("Artículo eliminado correctamente");
      setArticulos(prev => prev.filter(a => a.id_articulo !== articulo.id_articulo));
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error desconocido al eliminar");
    }
  };

  const loadSubcategorias = (id_categoria: number) => {
    setSubcategorias(allSubcategorias.filter(sc => sc.id_categoria === id_categoria));
    setFormData(prev => ({ ...prev, id_subcategoria: 0 }));
  };

  const resetForm = () => {
    setFormData({
      id_subcategoria: 0,
      nombre: "",
      descripcion: "",
      genero: "Unisex"
    });
    setTallasForm([{ talla: "", stock_nuevo: 0, stock_reutilizable: 0 }]);
    setSelectedArticulo(null);
    setRegisterDialog(false);
    setEditDialog(false);
  };

  const getCurrentCategoriaId = (): number => {
    if (formData.id_subcategoria) {
      const subcat = allSubcategorias.find(sc => sc.id_subcategoria === formData.id_subcategoria);
      return subcat?.id_categoria || 0;
    }
    return 0;
  };

  const addTalla = () => {
    setTallasForm([...tallasForm, { talla: "", stock_nuevo: 0, stock_reutilizable: 0 }]);
  };

  const removeTalla = (index: number) => {
    if (tallasForm.length > 1) {
      setTallasForm(tallasForm.filter((_, i) => i !== index));
    }
  };

  const updateTalla = (index: number, field: keyof TallaForm, value: string | number) => {
    const updatedTallas = [...tallasForm];
    updatedTallas[index] = { ...updatedTallas[index], [field]: value };
    setTallasForm(updatedTallas);
  };

  const renderForm = (dialogTitle: string, visible: boolean, onHide: () => void) => (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={dialogTitle}
      className="modal-form"
      style={{ width: "70vw" }}
      modal
    >
      <div className="p-fluid">
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label>Categoría *</label>
            <Dropdown
              value={getCurrentCategoriaId()}
              options={[
                { label: "Seleccione categoría", value: 0 },
                ...safeArray(categorias).map(c => ({ label: c.nombre, value: c.id_categoria }))
              ]}
              onChange={(e) => loadSubcategorias(e.value)}
              placeholder="Seleccione categoría"
            />
          </div>
          <div className="field col-12 md:col-6">
            <label>Subcategoría *</label>
            <Dropdown
              value={formData.id_subcategoria}
              options={[
                { label: "Seleccione subcategoría", value: 0 },
                ...safeArray(subcategorias).map(sc => ({ label: sc.nombre, value: sc.id_subcategoria }))
              ]}
              onChange={(e) => setFormData({ ...formData, id_subcategoria: e.value })}
              placeholder="Seleccione subcategoría"
              disabled={subcategorias.length === 0}
            />
          </div>
          <div className="field col-12 md:col-8">
            <label>Nombre del artículo *</label>
            <InputText
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del artículo"
            />
          </div>
          <div className="field col-12 md:col-4">
            <label>Género</label>
            <Dropdown
              value={formData.genero}
              options={[
                { label: "Unisex", value: "Unisex" },
                { label: "Masculino", value: "Masculino" },
                { label: "Femenino", value: "Femenino" }
              ]}
              onChange={(e) => setFormData({ ...formData, genero: e.value as Genero })}
            />
          </div>
          <div className="field col-12">
            <label>Descripción</label>
            <InputText
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del artículo"
            />
          </div>
          
          <div className="field col-12">
            <div className="flex justify-content-between align-items-center mb-2">
              <label>Tallas y Stock *</label>
              <Button 
                icon="pi pi-plus" 
                className="p-button-rounded p-button-sm" 
                onClick={addTalla}
              />
            </div>
            
            {tallasForm.map((talla, index) => (
              <div key={index} className="grid mb-2">
                <div className="col-3">
                  <InputText
                    value={talla.talla}
                    onChange={(e) => updateTalla(index, "talla", e.target.value)}
                    placeholder="Talla (ej. S, M, 38)"
                  />
                </div>
                <div className="col-3">
                  <InputText
                    type="number"
                    min="0"
                    value={talla.stock_nuevo.toString()}
                    onChange={(e) => updateTalla(index, "stock_nuevo", parseInt(e.target.value) || 0)}
                    placeholder="Stock nuevo"
                  />
                </div>
                <div className="col-3">
                  <InputText
                    type="number"
                    min="0"
                    value={talla.stock_reutilizable.toString()}
                    onChange={(e) => updateTalla(index, "stock_reutilizable", parseInt(e.target.value) || 0)}
                    placeholder="Stock reutilizable"
                  />
                </div>
                <div className="col-3 flex align-items-center">
                  {tallasForm.length > 1 && (
                    <Button 
                      icon="pi pi-trash" 
                      className="p-button-rounded p-button-danger p-button-sm" 
                      onClick={() => removeTalla(index)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-content-end mt-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text btn-cancelar"
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={handleSubmit}
            className="p-button-success ml-2"
          />
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className="p-4 container-registrar-dotacion">
      <Toast ref={toast} />
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 className="Titulo-gestion-dotaciones" style={{ color: "#cd1818" }}>
            Gestión de Dotaciones
          </h3>
          <Button
            label="Registrar Nuevo"
            icon="pi pi-plus"
            className="p-button-danger"
            onClick={() => {
              setSubcategorias([]);
              setRegisterDialog(true);
            }}
          />
        </div>

        <div className="mb-3">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              className="w-full"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar en registros..."
            />
          </span>
        </div>

        <DataTable
          value={safeArray(articulos)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
          globalFilter={globalFilter}
          emptyMessage="No se encontraron artículos"
          loading={articulos.length === 0 && globalFilter === ""}
        >
          <Column field="categoria" header="Categoría" sortable filter />
          <Column field="subcategoria" header="Subcategoría" sortable filter />
          <Column field="nombre" header="Artículo" sortable filter />
          <Column field="genero" header="Género" sortable />
          <Column 
            header="Tallas/Stock" 
            body={(data: Articulo) => (
              <div className="flex flex-wrap gap-2">
                {data.tallas?.map((t, i) => (
                  <Chip 
                    key={i}
                    label={`${t.talla}: N(${t.stock_nuevo}) R(${t.stock_reutilizable || 0})`}
                    className="mr-2 mb-2"
                  />
                ))}
              </div>
            )}
          />
          <Column
            header="Acciones"
            body={(rowData: Articulo) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-text p-button-primary"
                  tooltip="Editar"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => handleEdit(rowData)}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-text p-button-danger"
                  tooltip="Eliminar"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => handleDelete(rowData)}
                />
              </div>
            )}
            style={{ width: "120px" }}
          />
        </DataTable>
      </div>

      {renderForm("Registrar Nuevo Artículo", registerDialog, resetForm)}
      {renderForm("Editar Artículo", editDialog, resetForm)}
    </div>
  );
};

export default RegistrarDotacionNueva;