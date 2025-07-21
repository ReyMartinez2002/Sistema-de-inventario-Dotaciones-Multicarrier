import React from "react";
import { useAuth } from "../contex/useAuth";
import SidebarAdmin from "../components/Sidebar";
import DashboardDotaciones from "../components/DashboardDotaciones";
import RegistrarDotacionNueva from "../components/RegistrarDotacionNueva";
import RegistrarDotacionUsadas from "../components/RegistrarDotacionUsadas";
import AsignarDotacionEmpleado from "../components/AsignarDotacionEmpleado";
import HistorialAsignaciones from "../components/HistorialAsignaciones";
import Devoluciones from "../components/Devoluciones";
import GestionarTiposDotacion from "../components/GestionarTiposDotacion";
import ConsultaStock from "../components/ConsultarStock";
import ReporteDotaciones from "../components/ReporteDotaciones";
import Perfil from "../components/Perfil";
import Ajustes from "../components/Ajustes";
import Notificaciones from "../components/Notificaciones";
import { Navigate } from "react-router-dom";
import RolesPermisos from "../components/usuarios/RolesPermisos";
import HistorialAccesos from "../components/usuarios/HistorialAccesos";
import UserManagement from "../components/usuarios/UserManagement";

const HomeAdmin: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [selectedMenu, setSelectedMenu] = React.useState<string>("dashboard");


  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

 const renderMainContent = () => {
  switch (selectedMenu) {
    case "dashboard":
      return <DashboardDotaciones />;
    case "registrar-nueva":
      return <RegistrarDotacionNueva />;
    case "registrar-reutilizada":
      return <RegistrarDotacionUsadas />;
    case "asignar-dotacion":
      return <AsignarDotacionEmpleado />;
    case "historial-asignaciones":
      return <HistorialAsignaciones />;
    case "devoluciones":
      return <Devoluciones />;
    case "gestionar-tipos-dotacion":
      return <GestionarTiposDotacion />;
    case "consulta-stock":
      return <ConsultaStock />;
    case "reportes-dotaciones":
      return <ReporteDotaciones />;
    case "perfil":
      return <Perfil />;
    case "notificaciones":
      return <Notificaciones />;
    case "ajustes":
      return <Ajustes />;
    case "registrar-usuario":
      return <UserManagement />;
    case "roles-permisos":
      return <RolesPermisos />;
    case "historial-accesos":
      return <HistorialAccesos />;
    default:
      return <DashboardDotaciones />;
  }
};


  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafbfc", width: "100%" }}>
      <SidebarAdmin 
  onMenuSelect={setSelectedMenu} 
  activeItem={selectedMenu}
  user="Juan Pérez"
  role="Administrador"
  userRoleId={1} // o 2 si no es admin
  avatarUrl="https://miavatar.com/juan.jpg"
/>

      <main
        className="app-main-content"
        style={{
          flex: 1,
          padding: "2rem",
          minHeight: "100vh",
          maxWidth: "100%",
          overflow: "auto"
        }}
      >
        {renderMainContent()}
      </main>
    </div>
  );
};

export default HomeAdmin;