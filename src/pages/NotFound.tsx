import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>404 - Página no encontrada</h1>
      <p>La página que estás buscando no existe.</p>
      <Link to="/" style={{ color: "#cd1818" }}>
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;