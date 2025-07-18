import React, { useState } from "react";
import Login from "./Login";
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

const HomeAdmin: React.FC = () => {
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>("dashboard");

  if (!logged) {
    return (
      <Login
        onLogin={(user) => {
          setLogged(true);
          setUser(user);
        }}
      />
    );
  }

  // Renderiza el contenido principal según la opción seleccionada del sidebar
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
        
      // Agrega más casos según tus componentes
      default:
        return <DashboardDotaciones/>;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafbfc", width:"100%"}}>
      <SidebarAdmin onMenuSelect={setSelectedMenu} user={user || "Admin"} />
      <main
        className="app-main-content"
        style={{
          flex: 1,
          padding: "0",
          minHeight: "100vh",
          maxWidth: "100%",
        }}
      >
        {renderMainContent()}
      </main>
    </div>
  );
};

export default HomeAdmin;