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

interface Dotacion {
  id?: number;
  id_subcategoria: number;
  descripcion: string;
  genero?: string;
  stock_nuevo: number;
  stock_reutilizable?: number;
  stock_minimo?: number;
  precio_unitario?: number;
  fecha_creacion?: string;
  subcategoria?: string;
  categoria?: string;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

interface DotacionApiResponse {
  id: number;
  id_subcategoria: number;
  descripcion: string;
  genero?: string;
  stock_nuevo: number;
  stock_reutilizable?: number;
  stock_minimo?: number;
  precio_unitario?: number;
  fecha_creacion?: string;
}

const RegistrarDotacionNueva: React.FC = () => {
  const { token } = useAuth();
  const dotacionApi = useRef(new DotacionApi()).current;
  const [formData, setFormData] = useState<Dotacion>({
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
  const [selectedDotacion, setSelectedDotacion] = useState<Dotacion | null>(
    null
  );
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

      setDotaciones(
        dotacionesData.map((d: DotacionApiResponse) => {
          const subcat = subcategoriasData.find(
            (sc: Subcategoria) => sc.id_subcategoria === d.id_subcategoria
          );
          const cat = categoriasData.find(
            (c: Categoria) => c.id_categoria === subcat?.id_categoria
          );

          return {
            ...d,
            subcategoria: subcat?.nombre,
            categoria: cat?.nombre,
          };
        })
      );

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

    if (
      !formData.id_subcategoria ||
      !formData.descripcion ||
      !formData.stock_nuevo
    ) {
      showError("Por favor, completa los campos obligatorios");
      return;
    }

    try {
      if (selectedDotacion?.id) {
        await dotacionApi.update(selectedDotacion.id, formData, token);
        setDotaciones(
          dotaciones.map((d) =>
            d.id === selectedDotacion.id
              ? { ...formData, id: selectedDotacion.id }
              : d
          )
        );
        showSuccess("Registro actualizado correctamente");
      } else {
        const newDotacion = await dotacionApi.create(formData, token);
        const subcat = allSubcategorias.find(
          (sc) => sc.id_subcategoria === newDotacion.id_subcategoria
        );
        const cat = categorias.find(
          (c) => c.id_categoria === subcat?.id_categoria
        );

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
      showError(
        `Error al guardar los datos: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleEdit = (dotacion: Dotacion) => {
    setFormData(dotacion);
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
  };

  const handleDelete = async (dotacion: Dotacion) => {
    if (!dotacion.id || !token) return;

    try {
      await dotacionApi.delete(dotacion.id, token);
      setDotaciones(dotaciones.filter((d) => d.id !== dotacion.id));
      showSuccess("Dotación eliminada correctamente");
    } catch (error) {
      showError(
        `Error al eliminar la dotación: ${
          error instanceof Error ? error.message : String(error)
        }`
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
              value={formData.stock_nuevo.toString()}
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
