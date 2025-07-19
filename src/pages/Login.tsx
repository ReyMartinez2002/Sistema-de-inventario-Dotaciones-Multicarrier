import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import "./styles/Login.css";
import icono from '../assets/Icono-casco.png';

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  // Agrega aquí otras propiedades necesarias según tu API
  role?: string;
  token?: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: user,
          password: pass
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (remember) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        onLogin(data.usuario);
      } else {
        setError(data.error || "Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Por favor intenta nuevamente."+ err);
    } finally {
      setLoading(false);
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
            <p>
              Sistema integral para el control de dotaciones Multicarrier.
            </p>
          </div>
        </div>
        <div className="login-right">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-profile-img">
              <img src={icono} alt="profile" />
            </div>
            <h3 className="login-title">Login</h3>

            <div className="login-field flex-align-icon">
              <span className="login-icon">
                <i className="pi pi-envelope" />
              </span>
              <InputText
                id="user"
                className="w-full"
                placeholder="Correo electrónico o usuario"
                value={user}
                onChange={e => setUser(e.target.value)}
                autoFocus
              />
            </div>
            <div className="login-field flex-align-icon">
              <span className="login-icon">
                <i className="pi pi-lock" />
              </span>
              <Password
                id="pass"
                name="password"
                className="w-full"
                placeholder="Contraseña"
                value={pass}
                onChange={e => setPass(e.target.value)}
                toggleMask
                feedback={false}
                inputClassName="login-password-input"
              />
            </div>

            <div className="login-options">
              <div className="login-remember">
                <Checkbox inputId="remember" checked={remember} onChange={e => setRemember(e.checked ?? false)} />
                <label htmlFor="remember">Recuérdame</label>
              </div>
              <a href="#" className="login-forgot">¿Olvidaste tu contraseña?</a>
            </div>
            {error && <Message severity="error" text={error} className="mb-3" />}
            <Button
              label={loading ? "Ingresando..." : "Iniciar sesión"}
              type="submit"
              className="login-btn"
              disabled={loading}
            />
            <div className="login-divider">
              <span>O continuar con</span>
            </div>
            <div className="login-social">
              <Button icon="pi pi-google" className="p-button-rounded p-button-text login-social-btn google" />
              <Button icon="pi pi-github" className="p-button-rounded p-button-text login-social-btn github" />
              <Button icon="pi pi-linkedin" className="p-button-rounded p-button-text login-social-btn linkedin" />
            </div>
            <div className="login-register">
              <span>¿No tienes una cuenta?</span>
              <a href="#" className="login-register-link">Regístrate</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;