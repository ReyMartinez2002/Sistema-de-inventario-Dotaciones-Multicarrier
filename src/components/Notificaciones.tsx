import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";
import "./styles/Notificaciones.css"
interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

const Notificaciones: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [nuevas, setNuevas] = useState<number>(0);
  const toast = useRef<Toast>(null);
  const op = useRef<OverlayPanel>(null);

  // Simulación inicial (esto luego se conectará a tu API)
  useEffect(() => {
    const simuladas: Notificacion[] = [
      {
        id: "1",
        titulo: "Nueva dotación registrada",
        mensaje: "Se ha agregado una nueva dotación al inventario.",
        fecha: new Date().toLocaleString("es-CO"),
        leido: false,
      },
      {
        id: "2",
        titulo: "Asignación exitosa",
        mensaje: "Una dotación fue asignada a un empleado.",
        fecha: new Date().toLocaleString("es-CO"),
        leido: false,
      },
    ];
    setNotificaciones(simuladas);
    setNuevas(simuladas.filter((n) => !n.leido).length);
  }, []);

  const marcarComoLeidas = () => {
    const actualizadas = notificaciones.map((n) => ({ ...n, leido: true }));
    setNotificaciones(actualizadas);
    setNuevas(0);
  };

  const mostrarNotificaciones = (event: React.MouseEvent<HTMLButtonElement>) => {
    op.current?.toggle(event);
    marcarComoLeidas();
  };

  return (
    <div className="notificaciones-container">
      <Toast ref={toast} />
      <Button
        icon="pi pi-bell"
        className="p-button-rounded p-button-text"
        onClick={mostrarNotificaciones}
        aria-label="Notificaciones"
      />
      {nuevas > 0 && <Badge value={nuevas} severity="danger" style={{ position: "absolute", top: 0, right: 0 }} />}

      <OverlayPanel ref={op} className="p-overlaypanel-notificaciones" dismissable>
        <h5>Notificaciones</h5>
        <Divider />
        {notificaciones.length === 0 ? (
          <p>No hay notificaciones.</p>
        ) : (
          <ul className="p-0 m-0" style={{ listStyle: "none", maxHeight: "300px", overflowY: "auto" }}>
            {notificaciones.map((n) => (
              <li key={n.id} className={`mb-3 ${n.leido ? "notificacion-leida" : "notificacion-nueva"}`}>
                <strong>{n.titulo}</strong>
                <br />
                <span>{n.mensaje}</span>
                <br />
                <small className="text-muted">{n.fecha}</small>
                <Divider className="my-2" />
              </li>
            ))}
          </ul>
        )}
      </OverlayPanel>
    </div>
  );
};

export default Notificaciones;
