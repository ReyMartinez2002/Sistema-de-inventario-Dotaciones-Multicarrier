import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { useLocation } from "react-router-dom";
import "./styles/Login.css";
import icono from "../assets/Icono-casco.png";
import { useAuth } from "../contex/useAuth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { login, loading, error, clearError } = useAuth();

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Limpiar estados solo si viene de logout
    if (params.get("logout")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      if (clearError) clearError();
    }
  }, [location, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearError) clearError();

    try {
      await login(username, password, remember);
      // El id y token ya se guardan en el AuthProvider tras login exitoso
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="login-root">
      <div className="login-container">
        <div className="decorative-corner" />
        <div className="login-left">
          <div className="login-left-content">
            <img
              src="https://img.freepik.com/fotos-premium/veste-seguridad-aislado-seguridad-fondo-blanco-aislado-fondo-blanco-logotipo-texto-sombra-id-trabajo-58d29fc414334f42aac5354c9bcac684_949228-81851.jpg?uid=R87287700&semt=ais_hybrid&w=740"
              alt="welcome"
              className="login-avatar"
            />
            <h2>DotSys Multicarrier</h2>
            <p>Sistema integral para el control de dotaciones Multicarrier.</p>
          </div>
        </div>
        <div className="login-right">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-profile-img">
              <img src={icono} alt="profile" />
            </div>
            <h3 className="login-title">Login</h3>

            {error && (
              <div className="relative mb-3">
                <Message severity="error" text={error} className="w-full" />
                <button
                  onClick={() => clearError && clearError()}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                  type="button"
                >
                  <i className="pi pi-times" />
                </button>
              </div>
            )}

            <div className="login-field flex-align-icon">
              <span className="login-icon">
                <i className="pi pi-user" />
              </span>
              <InputText
                id="username"
                className="w-full"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                disabled={loading}
              />
            </div>
            <div className="login-field flex-align-icon">
              <span className="login-icon">
                <i className="pi pi-lock" />
              </span>
              <Password
                id="password"
                className="w-full"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false}
                inputClassName="login-password-input"
                required
                disabled={loading}
              />
            </div>

            <div className="login-options">
              <div className="login-remember">
                <Checkbox
                  inputId="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.checked ?? false)}
                  disabled={loading}
                />
                <label htmlFor="remember">Recuérdame</label>
              </div>
              <a href="#" className="login-forgot">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              label={loading ? "Ingresando..." : "Iniciar sesión"}
              type="submit"
              className="login-btn"
              disabled={loading}
              loading={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;