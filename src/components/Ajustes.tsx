import React, { useState, useRef, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import "./styles/Ajustes.css";

// Constantes para valores que no cambian
const IDIOMAS = [
  { label: "Español", value: "es" },
  { label: "Inglés", value: "en" },
];

const Ajustes: React.FC = () => {
  // Estados agrupados por funcionalidad
  const [preferencias, setPreferencias] = useState({
    idioma: "es",
    notificaciones: true,
    modoOscuro: false,
  });

  const [credenciales, setCredenciales] = useState({
    correo: "",
    contraseñaActual: "",
    nuevaContraseña: "",
  });

  const toast = useRef<Toast>(null);

  // Handlers memoizados para mejor rendimiento
  const handlePreferenciaChange = useCallback((key: string, value: any) => {
    setPreferencias(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCredencialChange = useCallback((key: string, value: string) => {
    setCredenciales(prev => ({ ...prev, [key]: value }));
  }, []);

  const cambiarCorreo = useCallback(() => {
    if (!credenciales.correo) {
      toast.current?.show({
        severity: "warn",
        summary: "Correo vacío",
        detail: "Debe ingresar un correo válido",
        life: 3000,
      });
      return;
    }

    // Validación simple de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credenciales.correo)) {
      toast.current?.show({
        severity: "error",
        summary: "Correo inválido",
        detail: "Por favor ingrese un correo electrónico válido",
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: "success",
      summary: "Correo actualizado",
      detail: "El correo fue cambiado correctamente",
      life: 3000,
    });
    handleCredencialChange("correo", "");
  }, [credenciales.correo, handleCredencialChange]);

  const cambiarContraseña = useCallback(() => {
    const { contraseñaActual, nuevaContraseña } = credenciales;
    
    if (!contraseñaActual || !nuevaContraseña) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Debe llenar ambos campos",
        life: 3000,
      });
      return;
    }

    if (nuevaContraseña.length < 6) {
      toast.current?.show({
        severity: "error",
        summary: "Contraseña débil",
        detail: "La nueva contraseña debe tener al menos 6 caracteres",
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: "success",
      summary: "Contraseña cambiada",
      detail: "Contraseña actualizada con éxito",
      life: 3000,
    });
    handleCredencialChange("contraseñaActual", "");
    handleCredencialChange("nuevaContraseña", "");
  }, [credenciales, handleCredencialChange]);

  return (
    <div className={classNames("p-4", { "p-component-dark": preferencias.modoOscuro })}>
      <Toast ref={toast} position="top-right" />
      
      <Card title="Ajustes del Sistema" className="shadow-3">
        <div className="grid formgrid">
          {/* Sección de Seguridad */}
          <div className="col-12 md:col-6">
            <h4 className="mb-3">Seguridad</h4>
            
            <div className="field">
              <label htmlFor="correo" className="block mb-2 font-medium">
                Correo electrónico
              </label>
              <InputText
                id="correo"
                value={credenciales.correo}
                onChange={(e) => handleCredencialChange("correo", e.target.value)}
                placeholder="nuevo@correo.com"
                className="w-full"
                keyfilter="email"
              />
              <Button
                label="Actualizar correo"
                icon="pi pi-envelope"
                className="mt-3 w-full md:w-auto"
                onClick={cambiarCorreo}
                severity="info"
              />
            </div>

            <Divider className="my-4" />

            <div className="field">
              <label htmlFor="currentPass" className="block mb-2 font-medium">
                Contraseña actual
              </label>
              <Password
                id="currentPass"
                value={credenciales.contraseñaActual}
                onChange={(e) => handleCredencialChange("contraseñaActual", e.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full"
                placeholder="Ingrese su contraseña actual"
              />

              <label htmlFor="newPass" className="block mb-2 mt-4 font-medium">
                Nueva contraseña
              </label>
              <Password
                id="newPass"
                value={credenciales.nuevaContraseña}
                onChange={(e) => handleCredencialChange("nuevaContraseña", e.target.value)}
                toggleMask
                className="w-full"
                inputClassName="w-full"
                placeholder="Ingrese nueva contraseña"
                promptLabel="Ingrese al menos 6 caracteres"
                weakLabel="Débil"
                mediumLabel="Media"
                strongLabel="Fuerte"
              />

              <Button
                label="Cambiar contraseña"
                icon="pi pi-lock"
                className="mt-3 w-full md:w-auto"
                onClick={cambiarContraseña}
                severity="warning"
              />
            </div>
          </div>

          {/* Sección de Preferencias */}
          <div className="col-12 md:col-6">
            <h4 className="mb-3">Preferencias</h4>
            
            <div className="field">
              <label className="block mb-2 font-medium">Idioma</label>
              <Dropdown
                value={preferencias.idioma}
                options={IDIOMAS}
                onChange={(e) => handlePreferenciaChange("idioma", e.value)}
                placeholder="Seleccione idioma"
                className="w-full"
              />
            </div>

            <Divider className="my-4" />

            <div className="field">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="notif"
                  checked={preferencias.notificaciones}
                  onChange={(e) => handlePreferenciaChange("notificaciones", e.checked)}
                  className="mr-2"
                />
                <label htmlFor="notif" className="font-medium">
                  Activar notificaciones
                </label>
              </div>
            </div>

            <div className="field mt-4">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="tema"
                  checked={preferencias.modoOscuro}
                  onChange={(e) => handlePreferenciaChange("modoOscuro", e.checked)}
                  className="mr-2"
                />
                <label htmlFor="tema" className="font-medium">
                  Modo oscuro
                </label>
              </div>
            </div>

            <Divider className="my-4" />

            <div className="field">
              <Button 
                label="Guardar cambios" 
                icon="pi pi-save" 
                className="w-full"
                severity="success"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(Ajustes);