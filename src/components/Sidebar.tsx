import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import type { MenuItem } from "primereact/menuitem";
import { Avatar } from "primereact/avatar";
import { Tooltip } from "primereact/tooltip";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import "./styles/SidebarAdmin.css";
import { Api } from "../services/api";

const api = new Api();

export interface SidebarAdminProps {
  onMenuSelect: (key: string) => void;
  user: string;
  role?: string;
  unreadNotifications?: number;
  activeItem?: string;
  onLogout?: () => void;
  avatarUrl?: string;
  userRoleId?: number;
  token?: string;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({
  onMenuSelect,
  user,
  role = "Administrador",
  unreadNotifications = 0,
  activeItem = "",
  avatarUrl,
  userRoleId = 1,
  token,
  onLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("sessionData");
    window.location.href = "/login?logout=success";
  },
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toast = useRef<Toast>(null);

  const handleLogout = useCallback(async () => {
    try {
      confirmDialog({
        message: "¿Está seguro que desea cerrar sesión?",
        header: "Confirmación de cierre de sesión",
        icon: "pi pi-exclamation-triangle",
        acceptClassName: "p-button-danger",
        accept: async () => {
          try {
            setLoading(true);
            
            // Llamar al endpoint de logout profesional
            await api.auth.logout(token);
            
            // Ejecutar las acciones de logout
            onLogout();
            
            // Invalidar caché
            if (window.caches) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
          } catch (error) {
            console.error("Error en logout:", error);
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Ocurrió un error al cerrar sesión",
              life: 5000
            });
          } finally {
            setLoading(false);
          }
        },
        reject: () => {}
      });
    } catch (error) {
      console.error("Error en logout:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error al confirmar el cierre de sesión",
        life: 5000
      });
    }
  }, [token, onLogout]);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth <= 1024;
    setIsMobile(mobile);
    if (!mobile) setSidebarVisible(false);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [checkMobile]);

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

  const generatedAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user || "Admin")}&background=cd1818&color=fff&size=256&bold=true&length=2&font-size=0.5&rounded=true`;

  const handleMenuClick = useCallback(
    (key: string) => {
      onMenuSelect(key);
      if (isMobile) setSidebarVisible(false);
    },
    [isMobile, onMenuSelect]
  );

  const baseMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Dashboard",
      icon: "pi pi-chart-line",
      command: () => handleMenuClick("dashboard"),
      className: classNames({
        "active-menu-item": activeItem === "dashboard",
        "collapsed-menu-item": collapsed,
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === "dashboard" && <div className="active-indicator" />}
        </div>
      ),
    },
    {
      label: collapsed ? "" : "Dotaciones",
      icon: "pi pi-briefcase",
      expanded: !collapsed && activeItem.includes("dotacion"),
      className: classNames({
        "active-parent": activeItem.includes("dotacion"),
        "collapsed-menu-item": collapsed,
      }),
      items: [
        {
          label: "Registrar Nueva",
          icon: "pi pi-plus-circle",
          command: () => handleMenuClick("registrar-nueva"),
          className: activeItem === "registrar-nueva" ? "active-submenu-item" : "",
        },
        {
          label: "Reutilizadas",
          icon: "pi pi-refresh",
          command: () => handleMenuClick("registrar-reutilizada"),
          className: activeItem === "registrar-reutilizada" ? "active-submenu-item" : "",
        },
        {
          label: "Asignar",
          icon: "pi pi-user-plus",
          command: () => handleMenuClick("asignar-dotacion"),
          className: activeItem === "asignar-dotacion" ? "active-submenu-item" : "",
        },
        {
          label: "Historial",
          icon: "pi pi-clock",
          command: () => handleMenuClick("historial-asignaciones"),
          className: activeItem === "historial-asignaciones" ? "active-submenu-item" : "",
        },
        {
          label: "Devoluciones",
          icon: "pi pi-undo",
          command: () => handleMenuClick("devoluciones"),
          className: activeItem === "devoluciones" ? "active-submenu-item" : "",
        },
        {
          label: "Consulta Stock",
          icon: "pi pi-search",
          command: () => handleMenuClick("consulta-stock"),
          className: activeItem === "consulta-stock" ? "active-submenu-item" : "",
        },
        {
          label: "Reportes",
          icon: "pi pi-file-pdf",
          command: () => handleMenuClick("reportes-dotaciones"),
          className: activeItem === "reportes-dotaciones" ? "active-submenu-item" : "",
        },
        {
          label: "Tipos",
          icon: "pi pi-tags",
          command: () => handleMenuClick("gestionar-tipos-dotacion"),
          className: activeItem === "gestionar-tipos-dotacion" ? "active-submenu-item" : "",
        },
      ],
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem.includes("dotacion") && <div className="active-indicator" />}
          {!collapsed && (
            <i className={`pi pi-chevron-${item.expanded ? "down" : "right"}`} />
          )}
        </div>
      ),
    },
  ];

  const adminMenuItems: MenuItem[] =
    userRoleId === 1
      ? [
          {
            label: collapsed ? "" : "Usuarios",
            icon: "pi pi-users",
            expanded: !collapsed && activeItem.includes("usuarios"),
            className: classNames({
              "active-parent": activeItem.includes("usuarios"),
              "collapsed-menu-item": collapsed,
            }),
            items: [
              {
                label: "Registrar Usuario",
                icon: "pi pi-user-plus",
                command: () => handleMenuClick("registrar-usuario"),
                className: activeItem === "registrar-usuario" ? "active-submenu-item" : "",
              },
              {
                label: "Roles y Permisos",
                icon: "pi pi-shield",
                command: () => handleMenuClick("roles-permisos"),
                className: activeItem === "roles-permisos" ? "active-submenu-item" : "",
              },
              {
                label: "Historial de Accesos",
                icon: "pi pi-history",
                command: () => handleMenuClick("historial-accesos"),
                className: activeItem === "historial-accesos" ? "active-submenu-item" : "",
              },
            ],
            template: (item) => (
              <div className="menu-item-content">
                <i className={item.icon} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && activeItem.includes("usuarios") && <div className="active-indicator" />}
                {!collapsed && (
                  <i className={`pi pi-chevron-${item.expanded ? "down" : "right"}`} />
                )}
              </div>
            ),
          },
        ]
      : [];

  const commonMenuItems: MenuItem[] = [
    {
      label: collapsed ? "" : "Perfil",
      icon: "pi pi-user",
      command: () => handleMenuClick("perfil"),
      className: classNames({
        "active-menu-item": activeItem === "perfil",
        "collapsed-menu-item": collapsed,
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === "perfil" && <div className="active-indicator" />}
        </div>
      ),
    },
    {
      label: collapsed ? "" : "Notificaciones",
      icon: "pi pi-bell",
      command: () => handleMenuClick("notificaciones"),
      className: classNames({
        "active-menu-item": activeItem === "notificaciones",
        "collapsed-menu-item": collapsed,
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {unreadNotifications > 0 && (
            <Badge value={unreadNotifications} severity="danger" className="notification-badge" />
          )}
          {!collapsed && activeItem === "notificaciones" && <div className="active-indicator" />}
        </div>
      ),
    },
    {
      label: collapsed ? "" : "Ajustes",
      icon: "pi pi-cog",
      command: () => handleMenuClick("ajustes"),
      className: classNames({
        "active-menu-item": activeItem === "ajustes",
        "collapsed-menu-item": collapsed,
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && activeItem === "ajustes" && <div className="active-indicator" />}
        </div>
      ),
    },
    {
      separator: true,
      visible: !collapsed,
    },
    {
      label: collapsed ? "" : "Cerrar sesión",
      icon: "pi pi-sign-out",
      command: () => handleLogout(),
      className: classNames("logout-menu-item", {
        "collapsed-menu-item": collapsed,
      }),
      template: (item) => (
        <div className="menu-item-content">
          <i className={item.icon} />
          {!collapsed && <span>{item.label}</span>}
          {loading && <i className="pi pi-spinner pi-spin ml-2" />}
        </div>
      ),
    },
  ];

  const menuItems = [...baseMenuItems, ...adminMenuItems, ...commonMenuItems];

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />
      <Tooltip target=".custom-sidebar-toggle" position="right" />
      <Tooltip target=".collapsed-menu-item" position="right" />
      
      {isMobile && (
        <Button
          icon="pi pi-bars"
          className="p-button-rounded p-button-danger p-button-lg custom-sidebar-toggle btn-menu-ambuerguesa"
          data-pr-tooltip="Menú principal"
          style={{
            position: "fixed",
            zIndex: 1101,
            boxShadow: "0 2px 12px rgba(205, 24, 24, 0.3)",
          }}
          onClick={() => setSidebarVisible(true)}
          aria-label="Mostrar menú"
        />
      )}
      
      {isMobile ? (
        <Sidebar
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
            role={role}
            avatarUrl={avatarUrl || generatedAvatarUrl}
            panelMenuItems={menuItems}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            loading={loading}
            ref={sidebarRef}
          />
        </Sidebar>
      ) : (
        <aside
          className={classNames("fixed-sidebar custom-sidebar desktop-sidebar", {
            collapsed: collapsed,
          })}
          ref={sidebarRef}
        >
          <SidebarContent
            user={user}
            role={role}
            avatarUrl={avatarUrl || generatedAvatarUrl}
            panelMenuItems={menuItems}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            loading={loading}
          />
        </aside>
      )}
    </>
  );
};

interface SidebarContentProps {
  user: string;
  role: string;
  avatarUrl: string;
  panelMenuItems: MenuItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  loading?: boolean;
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ user, role, avatarUrl, panelMenuItems, collapsed, onToggleCollapse, loading }, ref) => (
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
            transition: "all 0.3s ease",
          }}
        />
        {!collapsed && (
          <>
            <span className="sidebar-title">Gestión EPP</span>
            <span className="sidebar-username">{user || "Admin"}</span>
            <span className="sidebar-role">{role}</span>
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
        <Button
          icon={`pi pi-chevron-${collapsed ? "right" : "left"}`}
          className="p-button-rounded p-button-text p-button-sm toggle-collapse-btn"
          onClick={onToggleCollapse}
          tooltip={collapsed ? "Expandir menú" : "Colapsar menú"}
          tooltipOptions={{ position: "right" }}
          disabled={loading}
        />
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
  )
);

export default React.memo(SidebarAdmin);