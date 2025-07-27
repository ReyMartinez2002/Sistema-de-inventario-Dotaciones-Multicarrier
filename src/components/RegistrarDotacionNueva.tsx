import React, { useState, useRef, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { addLocale } from "primereact/api";
import { DotacionApi } from "../services/dotacionApi";
import { useAuth } from "../contex/useAuth";
import "./styles/RegistrarDotacionNueva.css";
import type { DotacionData, DotacionApiResponse, Categoria, Subcategoria } from '../types/Dotacion';

// Extendemos la interfaz para incluir campos de visualización
interface Dotacion extends DotacionApiResponse {
  subcategoria?: string;
  categoria?: string;
}

const RegistrarDotacionNueva: React.FC = () => {
  const { token } = useAuth();
  const dotacionApi = useRef(new DotacionApi()).current;
  const [formData, setFormData] = useState<DotacionData>({
    id_subcategoria: 0,
    descripcion: "",
    stock_nuevo: 1,
  });
  const [dotaciones, setDotaciones] = useState<Dotacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [allSubcategorias, setAllSubcategorias] = useState<Subcategoria[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [selectedDotacion, setSelectedDotacion] = useState<Dotacion | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const toast = useRef<Toast>(null);

  addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ],
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
    monthNamesShort: [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ],
    today: "Hoy",
    clear: "Limpiar",
  });

  const showError = useCallback((message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: message,
      life: 3000,
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!token) {
      showError("No estás autenticado");
      return;
    }

    try {
      const [dotacionesData, categoriasData, subcategoriasData] =
        await Promise.all([
          dotacionApi.getAll(token),
          dotacionApi.getCategorias(token),
          dotacionApi.getSubcategorias(token),
        ]);

      const dotacionesFormateadas: Dotacion[] = dotacionesData.map((d) => {
        const subcat = subcategoriasData.find(
          (sc) => sc.id_subcategoria === d.id_subcategoria
        );

        const cat = subcat
          ? categoriasData.find((c) => c.id_categoria === subcat.id_categoria)
          : undefined;

        return {
          ...d,
          subcategoria: subcat?.nombre,
          categoria: cat?.nombre,
        };
      });

      setDotaciones(dotacionesFormateadas);
      setCategorias(categoriasData);
      setAllSubcategorias(subcategoriasData);
    } catch (error) {
      showError(
        `Error al cargar datos: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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

  // Validación de campos obligatorios
  if (!formData.id_subcategoria || !formData.descripcion || formData.stock_nuevo === undefined) {
    showError("Por favor, completa los campos obligatorios");
    return;
  }

  try {
    // Preparar los datos para enviar
    const payload: DotacionData = {
      id_subcategoria: formData.id_subcategoria,
      descripcion: formData.descripcion,
      stock_nuevo: formData.stock_nuevo,
      // Campos opcionales con conversión explícita
      ...(formData.genero && { genero: formData.genero }),
      ...(formData.stock_reutilizable !== undefined && { 
        stock_reutilizable: Number(formData.stock_reutilizable) 
      }),
      ...(formData.stock_minimo !== undefined && { 
        stock_minimo: Number(formData.stock_minimo) 
      }),
      ...(formData.precio_unitario !== undefined && { 
        precio_unitario: Number(formData.precio_unitario) 
      }),
    };

    if (selectedDotacion?.id_dotacion) {
      // Actualizar dotación existente
      const updatedDotacion = await dotacionApi.update(
        selectedDotacion.id_dotacion, 
        payload, 
        token
      );
      
      // Actualizar el estado local
      const updatedDotaciones = dotaciones.map((d) =>
        d.id_dotacion === selectedDotacion.id_dotacion
          ? { ...d, ...updatedDotacion }
          : d
      );
      
      setDotaciones(updatedDotaciones);
      showSuccess("Registro actualizado correctamente");
    } else {
      // Crear nueva dotación
      const newDotacion = await dotacionApi.create(payload, token);
      
      // Actualizar el estado local con la nueva dotación
      const subcat = allSubcategorias.find(
        (sc) => sc.id_subcategoria === newDotacion.id_subcategoria
      );
      const cat = subcat
        ? categorias.find((c) => c.id_categoria === subcat.id_categoria)
        : undefined;

      setDotaciones([
        ...dotaciones,
        {
          ...newDotacion,
          subcategoria: subcat?.nombre,
          categoria: cat?.nombre,
        },
      ]);
      showSuccess("Dotación registrada correctamente");
    }

    resetForm();
  } catch (error) {
    console.error("Error al guardar:", error);
    showError(
      `Error al guardar los datos: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  loadData(); // Recargar datos después de guardar
};

  const handleEdit = (dotacion: Dotacion) => {
    setFormData({
      id_subcategoria: dotacion.id_subcategoria,
      descripcion: dotacion.descripcion,
      genero: dotacion.genero,
      stock_nuevo: dotacion.stock_nuevo,
      stock_reutilizable: dotacion.stock_reutilizable,
      stock_minimo: dotacion.stock_minimo,
      precio_unitario: dotacion.precio_unitario,
    });
    
    setSelectedDotacion(dotacion);

    if (dotacion.id_subcategoria) {
      const subcat = allSubcategorias.find(
        (sc) => sc.id_subcategoria === dotacion.id_subcategoria
      );
      if (subcat) {
        setSubcategorias(
          allSubcategorias.filter(
            (sc) => sc.id_categoria === subcat.id_categoria
          )
        );
      }
    }

    setEditDialog(true);
    loadData();
  };

const handleDelete = async (dotacion: Dotacion) => {
  if (!dotacion.id_dotacion || !token) {
    showError("No se puede eliminar: falta información de autenticación");
    return;
  }

  try {
    // Confirmación antes de eliminar
    if (!window.confirm(`¿Estás seguro de eliminar "${dotacion.descripcion}"?`)) {
      return;
    }

    // Llamada al API
    await dotacionApi.delete(dotacion.id_dotacion, token);
    
    showSuccess("Dotación eliminada correctamente");
    
    // Actualizar el estado local sin recargar toda la data
    setDotaciones(prev => prev.filter(d => d.id_dotacion !== dotacion.id_dotacion));
  } catch (error) {
    console.error("Error al eliminar:", error);
    showError(
      error instanceof Error ? error.message : "Error desconocido al eliminar"
    );
  }
};

  const loadSubcategorias = (id_categoria: number) => {
    setSubcategorias(
      allSubcategorias.filter((sc) => sc.id_categoria === id_categoria)
    );
    setFormData({ ...formData, id_subcategoria: 0 });
  };

  const resetForm = () => {
    setFormData({
      id_subcategoria: 0,
      descripcion: "",
      stock_nuevo: 1,
    });
    setSelectedDotacion(null);
    setRegisterDialog(false);
    setEditDialog(false);
  };

  const getCurrentCategoriaId = () => {
    if (formData.id_subcategoria) {
      const subcat = allSubcategorias.find(
        (sc) => sc.id_subcategoria === formData.id_subcategoria
      );
      return subcat?.id_categoria || 0;
    }
    return 0;
  };

  const renderForm = (
    dialogTitle: string,
    visible: boolean,
    onHide: () => void
  ) => (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={dialogTitle}
      className="modal-form"
      style={{ width: "60vw" }}
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
                ...categorias.map((c) => ({
                  label: c.nombre,
                  value: c.id_categoria,
                })),
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
                ...subcategorias.map((sc) => ({
                  label: sc.nombre,
                  value: sc.id_subcategoria,
                })),
              ]}
              onChange={(e) =>
                setFormData({ ...formData, id_subcategoria: e.value })
              }
              placeholder="Seleccione subcategoría"
              disabled={subcategorias.length === 0}
            />
          </div>
          <div className="field col-12">
            <label>Descripción *</label>
            <InputText
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción del producto"
            />
          </div>
          <div className="field col-12 md:col-4">
            <label>Género</label>
            <Dropdown
              value={formData.genero || ""}
              options={[
                { label: "Seleccione género", value: "" },
                { label: "Masculino", value: "M" },
                { label: "Femenino", value: "F" },
                { label: "Unisex", value: "U" },
              ]}
              onChange={(e) =>
                setFormData({ ...formData, genero: e.value || undefined })
              }
              placeholder="Seleccione género"
            />
          </div>
          <div className="field col-12 md:col-4">
            <label>Stock Nuevo *</label>
            <InputText
              type="number"
              min="0"
              value={formData.stock_nuevo?.toString() || "0"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock_nuevo: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="field col-12 md:col-4">
            <label>Stock Reutilizable</label>
            <InputText
              type="number"
              min="0"
              value={formData.stock_reutilizable?.toString() || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock_reutilizable: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="Opcional"
            />
          </div>
          <div className="field col-12 md:col-6">
            <label>Stock Mínimo</label>
            <InputText
              type="number"
              min="0"
              value={formData.stock_minimo?.toString() || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock_minimo: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="Opcional"
            />
          </div>
          <div className="field col-12 md:col-6">
            <label>Precio Unitario</label>
            <InputText
              type="number"
              min="0"
              step="0.01"
              value={formData.precio_unitario?.toString() || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precio_unitario: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              placeholder="Opcional"
            />
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
          <h3
            className="Titulo-gestion-dotaciones"
            style={{ color: "#cd1818" }}
          >
            Gestión de Dotaciones
          </h3>
          <Button
            label="Registrar Nueva"
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
          value={dotaciones}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
          globalFilter={globalFilter}
          emptyMessage="No se encontraron dotaciones"
          loading={dotaciones.length === 0 && globalFilter === ""}
        >
          <Column field="categoria" header="Categoría" sortable filter />
          <Column field="subcategoria" header="Subcategoría" sortable filter />
          <Column field="descripcion" header="Descripción" sortable filter />
          <Column
            field="genero"
            header="Género"
            sortable
            body={(data) => {
              switch (data.genero) {
                case "M":
                  return "Masculino";
                case "F":
                  return "Femenino";
                case "U":
                  return "Unisex";
                default:
                  return "-";
              }
            }}
          />
          <Column field="stock_nuevo" header="Stock Nuevo" sortable />
          <Column
            field="stock_reutilizable"
            header="Stock Reutilizable"
            sortable
            body={(data) => data.stock_reutilizable || "-"}
          />
          <Column
            header="Acciones"
            body={(rowData) => (
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

      {renderForm("Registrar Nueva Dotación", registerDialog, resetForm)}
      {renderForm("Editar Dotación", editDialog, resetForm)}
    </div>
  );
};

export default RegistrarDotacionNueva;