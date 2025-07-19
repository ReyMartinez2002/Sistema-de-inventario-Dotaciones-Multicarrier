import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import type { MenuItem } from "primereact/menuitem";
import { Avatar } from "primereact/avatar";
import { Tooltip } from "primereact/tooltip";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useAuth } from "../contex/useAuth";
import "./styles/SidebarAdmin.css";

interface SidebarAdminProps {
  onMenuSelect: (key: string) => void;
  unreadNotifications?: number;
  activeItem?: string;
  avatarUrl?: string;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ 
  onMenuSelect, 
  unreadNotifications = 0,
  activeItem = "",
  avatarUrl
}) => {
  const { user, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Función para manejar el cierre de sesión
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }, [logout]);

  // Función para verificar el tamaño de pantalla
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth <= 1024;
    setIsMobile(mobile);
    if (!mobile) setSidebarVisible(false);
  }, []);

  // Efecto para detectar cambios de tamaño
  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [checkMobile]);

  // Efecto para cerrar al hacer clic fuera (solo móviles)
  useEffect(() => {
    if (!isMobile || !sidebarVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarVisible]);

  // Generar URL de avatar
  const generatedAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || "Admin")}&background=cd1818&color=fff&size=256&bold=true&length=2&font-size=0.5&rounded=true`;

  // Manejar clic en menú
  const handleMenuClick = useCallback((key: string) => {
    onMenuSelect(key);
    if (isMobile) setSidebarVisible(false);
  }, [isMobile, onMenuSelect]);

  // Items del menú base (comunes a todos los roles)
  const baseMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Dashboard",
      icon: "pi pi-chart-line",
      command: () => handleMenuClick("dashboard"),
      className: classNames({
        'active-menu-item': activeItem === 'dashboard',
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === 'dashboard' && (
            <div className="active-indicator" />
          )}
        </div>
      )
    },
    {
      label: collapsed ? "" : "Perfil",
      icon: "pi pi-user",
      command: () => handleMenuClick("perfil"),
      className: classNames({
        'active-menu-item': activeItem === 'perfil',
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === 'perfil' && (
            <div className="active-indicator" />
          )}
        </div>
      )
    }
  ];

  // Items del menú para superadmin
  const superadminMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Dotaciones",
      icon: "pi pi-briefcase",
      expanded: !collapsed && activeItem.includes('dotacion'),
      className: classNames({
        'active-parent': activeItem.includes('dotacion'),
        'collapsed-menu-item': collapsed
      }),
      items: [
        {
          label: "Registrar Nueva",
          icon: "pi pi-plus-circle",
          command: () => handleMenuClick("registrar-nueva"),
          className: activeItem === 'registrar-nueva' ? 'active-submenu-item' : ''
        },
        {
          label: "Reutilizadas",
          icon: "pi pi-refresh",
          command: () => handleMenuClick("registrar-reutilizada"),
          className: activeItem === 'registrar-reutilizada' ? 'active-submenu-item' : ''
        },
        {
          label: "Asignar",
          icon: "pi pi-user-plus",
          command: () => handleMenuClick("asignar-dotacion"),
          className: activeItem === 'asignar-dotacion' ? 'active-submenu-item' : ''
        },
        {
          label: "Historial",
          icon: "pi pi-clock",
          command: () => handleMenuClick("historial-asignaciones"),
          className: activeItem === 'historial-asignaciones' ? 'active-submenu-item' : ''
        },
        {
          label: "Devoluciones",
          icon: "pi pi-undo",
          command: () => handleMenuClick("devoluciones"),
          className: activeItem === 'devoluciones' ? 'active-submenu-item' : ''
        },
        {
          label: "Consulta Stock",
          icon: "pi pi-search",
          command: () => handleMenuClick("consulta-stock"),
          className: activeItem === 'consulta-stock' ? 'active-submenu-item' : ''
        },
        {
          label: "Reportes",
          icon: "pi pi-file-pdf",
          command: () => handleMenuClick("reportes-dotaciones"),
          className: activeItem === 'reportes-dotaciones' ? 'active-submenu-item' : ''
        },
        {
          label: "Tipos",
          icon: "pi pi-tags",
          command: () => handleMenuClick("gestionar-tipos-dotacion"),
          className: activeItem === 'gestionar-tipos-dotacion' ? 'active-submenu-item' : ''
        }
      ],
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem.includes('dotacion') && (
            <div className="active-indicator" />
          )}
          {!collapsed && (
            <i className={`pi pi-chevron-${item.expanded ? 'down' : 'right'}`} />
          )}
        </div>
      )
    },
    {
      label: collapsed ? "" : "Ajustes",
      icon: "pi pi-cog",
      command: () => handleMenuClick("ajustes"),
      className: classNames({
        'active-menu-item': activeItem === 'ajustes',
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === 'ajustes' && (
            <div className="active-indicator" />
          )}
        </div>
      )
    }
  ];

  // Items del menú para admin
  const adminMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Dotaciones",
      icon: "pi pi-briefcase",
      expanded: !collapsed && activeItem.includes('dotacion'),
      className: classNames({
        'active-parent': activeItem.includes('dotacion'),
        'collapsed-menu-item': collapsed
      }),
      items: [
        {
          label: "Asignar",
          icon: "pi pi-user-plus",
          command: () => handleMenuClick("asignar-dotacion"),
          className: activeItem === 'asignar-dotacion' ? 'active-submenu-item' : ''
        },
        {
          label: "Historial",
          icon: "pi pi-clock",
          command: () => handleMenuClick("historial-asignaciones"),
          className: activeItem === 'historial-asignaciones' ? 'active-submenu-item' : ''
        },
        {
          label: "Consulta Stock",
          icon: "pi pi-search",
          command: () => handleMenuClick("consulta-stock"),
          className: activeItem === 'consulta-stock' ? 'active-submenu-item' : ''
        }
      ],
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem.includes('dotacion') && (
            <div className="active-indicator" />
          )}
          {!collapsed && (
            <i className={`pi pi-chevron-${item.expanded ? 'down' : 'right'}`} />
          )}
        </div>
      )
    }
  ];

  // Items del menú para viewer
  const viewerMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Consulta Stock",
      icon: "pi pi-search",
      command: () => handleMenuClick("consulta-stock"),
      className: classNames({
        'active-menu-item': activeItem === 'consulta-stock',
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === 'consulta-stock' && (
            <div className="active-indicator" />
          )}
        </div>
      )
    }
  ];

  // Items comunes finales
  const finalMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Notificaciones",
      icon: "pi pi-bell",
      command: () => handleMenuClick("notificaciones"),
      className: classNames({
        'active-menu-item': activeItem === 'notificaciones',
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {unreadNotifications > 0 && (
            <Badge 
              value={unreadNotifications} 
              severity="danger" 
              className="notification-badge"
            />
          )}
          {!collapsed && activeItem === 'notificaciones' && (
            <div className="active-indicator" />
          )}
        </div>
      )
    },
    {
      separator: true,
      visible: !collapsed
    },
    {
      label: collapsed ? "" : "Cerrar sesión",
      icon: "pi pi-sign-out",
      command: () => handleLogout(),
      className: classNames('logout-menu-item', {
        'collapsed-menu-item': collapsed
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
        </div>
      )
    }
  ];

  // Construir menú completo según el rol
  const buildMenuItems = (): MenuItem[] => {
    if (!user) return [];
    
    let roleSpecificItems: MenuItem[] = [];
    
    switch(user.rol) {
      case 'superadmin':
        roleSpecificItems = [...superadminMenuItems];
        break;
      case 'admin':
        roleSpecificItems = [...adminMenuItems];
        break;
      case 'viewer':
        roleSpecificItems = [...viewerMenuItems];
        break;
      default:
        roleSpecificItems = [];
    }

    return [...baseMenuItems, ...roleSpecificItems, ...finalMenuItems];
  };

  const menuItems = buildMenuItems();

  return (
    <>
      <Tooltip target=".custom-sidebar-toggle" position="right" />
      <Tooltip target=".collapsed-menu-item" position="right" />
      
      {isMobile && (
        <Button
          icon="pi pi-bars"
          className="p-button-rounded p-button-danger p-button-lg custom-sidebar-toggle"
          data-pr-tooltip="Menú principal"
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 1101,
            boxShadow: "0 2px 12px rgba(205, 24, 24, 0.3)"
          }}
          onClick={() => setSidebarVisible(true)}
          aria-label="Mostrar menú"
        />
      )}
      
      {isMobile ? (
        <PrimeSidebar
          visible={sidebarVisible}
          onHide={() => setSidebarVisible(false)}
          showCloseIcon={false}
          className="custom-sidebar mobile-sidebar"
          modal={false}
          dismissable
          blockScroll
        >
          <SidebarContent 
            user={user}
            avatarUrl={avatarUrl || generatedAvatarUrl}
            panelMenuItems={menuItems}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            ref={sidebarRef}
          />
        </PrimeSidebar>
      ) : (
        <aside className={classNames("fixed-sidebar custom-sidebar desktop-sidebar", {
          'collapsed': collapsed
        })} ref={sidebarRef}>
          <SidebarContent 
            user={user}
            avatarUrl={avatarUrl || generatedAvatarUrl}
            panelMenuItems={menuItems}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </aside>
      )}
    </>
  );
};

const SidebarContent = React.forwardRef<HTMLDivElement, {
    user: { nombre: string; rol: string } | null;
    avatarUrl: string;
    panelMenuItems: MenuItem[];
    collapsed: boolean;
  onToggleCollapse: () => void;
}>(({ user, avatarUrl, panelMenuItems, collapsed }, ref) => (
  <div className="sidebar-content-wrapper" ref={ref}>
    <div className="sidebar-header">
      <Avatar
        image={avatarUrl}
        size="xlarge"
        shape="circle"
        className="sidebar-avatar"
        style={{
          width: collapsed ? 48 : 64,
          height: collapsed ? 48 : 64,
          transition: 'all 0.3s ease'
        }}
      />
      {!collapsed && user && (
        <>
          <span className="sidebar-title">Gestión EPP</span>
          <span className="sidebar-username">{user.nombre}</span>
          <span className="sidebar-role">
            {user.rol === 'superadmin' ? 'Super Administrador' : 
             user.rol === 'admin' ? 'Administrador' : 'Visualizador'}
          </span>
        </>
      )}
    </div>
    
    <Divider className="sidebar-divider" />
    
    <div className="sidebar-menu-scrollable custom-panelmenu">
      <PanelMenu
        model={panelMenuItems}
        style={{
          border: "none",
          background: "transparent",
          width: "100%",
        }}
        multiple={false}
      />
    </div>
    
    <div className="sidebar-footer">
      {!collapsed && (
        <>
          <Divider className="footer-divider" />
          <div className="footer-content">
            <div>© {new Date().getFullYear()} Multicarrier</div>
            <div className="support-link">
              <i className="pi pi-lifebuoy"></i>
              <a href="mailto:soporte@multicarrier.com">Soporte</a>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
));

export default React.memo(SidebarAdmin);