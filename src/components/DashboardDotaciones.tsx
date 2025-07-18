import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import "./styles/DashboardDotaciones.css";

interface Movimiento {
  id: number;
  fecha: string;
  item: string;
  cantidad: number;
  tipo: "Entrada" | "Salida";
  estado: "Completada" | "Pendiente";
}

const resumenKpi = [
  { title: "Inventario Total", value: 1240, icon: "pi pi-box", color: "#cd1818" },
  { title: "Dotaciones Entregadas", value: 870, icon: "pi pi-send", color: "#ff6363" },
  { title: "Bajo Stock", value: 5, icon: "pi pi-exclamation-triangle", color: "#f9b115" },
  { title: "Solicitudes Pendientes", value: 12, icon: "pi pi-inbox", color: "#536dfe" },
];

const chartData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Entradas",
      backgroundColor: "#cd1818cc",
      data: [35, 59, 80, 81, 56, 55, 70],
      borderRadius: 7,
      barPercentage: 0.65,
    },
    {
      label: "Salidas",
      backgroundColor: "#ff6363cc",
      data: [28, 48, 40, 19, 86, 27, 60],
      borderRadius: 7,
      barPercentage: 0.65,
    },
  ],
};

const chartOptionsDesktop = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      labels: { 
        color: "#cd1818", 
        font: { weight: 600 },
        boxWidth: 12,
        padding: 10
      },
    },
  },
  scales: {
    x: { ticks: { color: "#cd1818" }, grid: { display: false } },
    y: { ticks: { color: "#cd1818" }, grid: { color: "#f0f0f0" } },
  },
};

const chartOptionsMobile = {
  ...chartOptionsDesktop,
  plugins: {
    legend: { 
      position: 'top' as const,
      labels: { 
        color: "#cd1818", 
        font: { size: 10, weight: 600 },
        boxWidth: 12,
        padding: 10,
        usePointStyle: true
      },
    },
  },
  scales: {
    ...chartOptionsDesktop.scales,
    x: { 
      ticks: { 
        color: "#cd1818", 
        maxRotation: 45, 
        minRotation: 45,
        font: { size: 10 }
      }, 
      grid: { display: false } 
    },
  },
};

const ultimosMovimientos: Movimiento[] = [
  { id: 1001, fecha: "2025-07-07", item: "Casco de Seguridad", cantidad: 10, tipo: "Entrada", estado: "Completada" },
  { id: 1002, fecha: "2025-07-06", item: "Botas Industriales", cantidad: 5, tipo: "Salida", estado: "Completada" },
  { id: 1003, fecha: "2025-07-05", item: "Guantes de Nitrilo", cantidad: 20, tipo: "Salida", estado: "Pendiente" },
  { id: 1004, fecha: "2025-07-05", item: "Chaleco Reflectivo", cantidad: 15, tipo: "Entrada", estado: "Completada" },
];

const estadoTemplate = (rowData: Movimiento) => (
  <Tag
    value={rowData.estado}
    severity={rowData.estado === "Pendiente" ? "warning" : "success"}
    className="estado-tag"
  />
);

const tipoTemplate = (rowData: Movimiento) => (
  <Tag
    value={rowData.tipo}
    severity={rowData.tipo === "Entrada" ? "info" : "danger"}
    className="tipo-tag"
  />
);

const DashboardDotaciones: React.FC = () => {
  const [isMobileView, setIsMobileView] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 992); // Cambio a diseño móvil debajo de 992px
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={`dashboard-dotaciones ${isMobileView ? 'mobile-view' : 'desktop-view'}`}>
      <div className="dashboard-header">
        <h1>{isMobileView ? "Inventario Dotaciones" : "Sistema de Inventario de Dotaciones"}</h1>
        <p>Panel de control general</p>
      </div>

      {/* Versión responsiva de KPIs */}
      <div className="dashboard-kpis">
        {resumenKpi.map((kpi) => (
          <Card
            key={kpi.title}
            className="kpi-card"
            style={{ borderTop: `4px solid ${kpi.color}` }}
          >
            <div className="kpi-content">
              <i className={kpi.icon} style={{ color: kpi.color }} />
              <div className="kpi-text">
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-title">{kpi.title}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Contenido principal con dos versiones */}
      {isMobileView ? (
        // VERSIÓN MÓVIL/TABLET
        <div className="mobile-content">
          <Card className="chart-card">
            <div className="card-header">
              <h3>Movimientos</h3>
            </div>
            <div className="chart-container">
              <Chart type="bar" data={chartData} options={chartOptionsMobile} />
            </div>
          </Card>

          <Card className="table-card">
            <div className="card-header">
              <h3>Últimos movimientos</h3>
              <Button 
                icon="pi pi-list" 
                className="p-button-text p-button-sm"
                onClick={() => alert("Ver todos")}
                tooltip="Ver todos"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            <div className="table-container">
              <DataTable
                value={ultimosMovimientos}
                size="small"
                responsiveLayout="stack"
                breakpoint="0px"
                scrollable
                scrollHeight="flex"
                emptyMessage="No hay movimientos"
              >
                <Column field="fecha" header="Fecha" />
                <Column field="item" header="Item" />
                <Column field="cantidad" header="Cant" style={{ textAlign: 'center' }} />
                <Column field="tipo" header="Tipo" body={tipoTemplate} style={{ textAlign: 'center' }} />
                <Column field="estado" header="Estado" body={estadoTemplate} style={{ textAlign: 'center' }} />
              </DataTable>
            </div>
          </Card>
        </div>
      ) : (
        // VERSIÓN ESCRITORIO (ORIGINAL)
        <div className="desktop-content">
          <div className="desktop-row">
            <Card className="desktop-chart">
              <h3>Resumen de Movimientos</h3>
              <div className="chart-container">
                <Chart type="bar" data={chartData} options={chartOptionsDesktop} />
              </div>
            </Card>

            <Card className="desktop-table">
              <h3>Últimos movimientos</h3>
              <DataTable
                value={ultimosMovimientos}
                size="small"
                scrollable
                scrollHeight="300px"
                responsiveLayout="scroll"
                emptyMessage="No hay movimientos recientes"
              >
                <Column field="fecha" header="Fecha" style={{ minWidth: '90px' }} />
                <Column field="item" header="Item" style={{ minWidth: '120px' }} />
                <Column field="cantidad" header="Cantidad" style={{ minWidth: '70px', textAlign: 'center' }} />
                <Column field="tipo" header="Tipo" body={tipoTemplate} style={{ minWidth: '90px', textAlign: 'center' }} />
                <Column field="estado" header="Estado" body={estadoTemplate} style={{ minWidth: '90px', textAlign: 'center' }} />
              </DataTable>
              <div className="view-all-button">
                <Button
                  label="Ver todos"
                  icon="pi pi-arrow-right"
                  className="p-button-text p-button-danger"
                  onClick={() => alert("Ver todos los movimientos")}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDotaciones;