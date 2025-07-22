import React, { useState, useRef, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { classNames } from "primereact/utils";
import { Panel } from "primereact/panel";
import { TabView, TabPanel } from "primereact/tabview";
import "./styles/Ajustes.css";

const IDIOMAS = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" },
];

const Ajustes: React.FC = () => {
  const [preferencias, setPreferencias] = useState({
    idioma: "es",
    notificaciones: true,
    modoOscuro: false,
    temaColor: "azul",
  });

  const [credenciales, setCredenciales] = useState({
    correo: "",
    contraseñaActual: "",
    nuevaContraseña: "",
    confirmarContraseña: "",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [panelStates, setPanelStates] = useState({
    emailPanel: false,
    passwordPanel: false,
    languagePanel: false,
    themePanel: false,
    notificationsPanel: false
  });

  const toast = useRef<Toast>(null);

  const togglePanel = (panelName: string) => {
    setPanelStates(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const handlePreferenciaChange = useCallback((key: string, value: any) => {
    setPreferencias(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCredencialChange = useCallback((key: string, value: string) => {
    setCredenciales(prev => ({ ...prev, [key]: value }));
  }, []);

  const cambiarCorreo = useCallback(() => {
    if (!credenciales.correo) {
      showToast("warn", "Correo vacío", "Debe ingresar un correo válido");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credenciales.correo)) {
      showToast("error", "Correo inválido", "Ingrese un correo electrónico válido");
      return;
    }

    showToast("success", "Correo actualizado", "El correo fue cambiado correctamente");
    handleCredencialChange("correo", "");
    togglePanel('emailPanel'); // Cerrar panel después de éxito
  }, [credenciales.correo, handleCredencialChange]);

  const cambiarContraseña = useCallback(() => {
    const { contraseñaActual, nuevaContraseña, confirmarContraseña } = credenciales;
    
    if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
      showToast("warn", "Campos incompletos", "Debe llenar todos los campos");
      return;
    }

    if (nuevaContraseña.length < 8) {
      showToast("error", "Contraseña débil", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      showToast("error", "Contraseñas no coinciden", "Las contraseñas ingresadas no son iguales");
      return;
    }

    showToast("success", "Contraseña cambiada", "Contraseña actualizada con éxito");
    handleCredencialChange("contraseñaActual", "");
    handleCredencialChange("nuevaContraseña", "");
    handleCredencialChange("confirmarContraseña", "");
    togglePanel('passwordPanel'); // Cerrar panel después de éxito
  }, [credenciales, handleCredencialChange]);

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const headerTemplate = (options: any) => {
    return (
      <div className={options.className} style={{ padding: '1rem' }}>
        <span className="text-xl font-semibold">Configuración de la cuenta</span>
      </div>
    );
  };

  return (
    <div className={classNames("settings-container", { "dark-mode": preferencias.modoOscuro })}>
      <Toast ref={toast} position="top-right" />
      
      <div className="p-grid p-justify-center">
        <div className="p-col-12 p-lg-10 p-xl-8">
          <Card header={headerTemplate} className="shadow-5">
            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
              <TabPanel header="Seguridad" leftIcon="pi pi-shield mr-2">
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-6">
                    <Panel 
                      header="Cambiar correo electrónico" 
                      toggleable 
                      collapsed={!panelStates.emailPanel}
                      onToggle={(e) => togglePanel('emailPanel')}
                    >
                      <div className="p-field">
                        <label htmlFor="correo" className="block mb-2 font-medium text-700">
                          Nuevo correo electrónico
                        </label>
                        <InputText
                          id="correo"
                          value={credenciales.correo}
                          onChange={(e) => handleCredencialChange("correo", e.target.value)}
                          placeholder="nuevo@correo.com"
                          className="w-full"
                          keyfilter="email"
                        />
                        <small className="p-text-secondary">Recibirás un correo de confirmación</small>
                        <Button
                          label="Actualizar correo"
                          icon="pi pi-envelope"
                          className="mt-3 w-full"
                          onClick={cambiarCorreo}
                          severity="info"
                          raised
                        />
                      </div>
                    </Panel>
                  </div>

                  <div className="p-col-12 p-md-6">
                    <Panel 
                      header="Cambiar contraseña" 
                      toggleable 
                      collapsed={!panelStates.passwordPanel}
                      onToggle={(e) => togglePanel('passwordPanel')}
                    >
                      <div className="p-field">
                        <label htmlFor="currentPass" className="block mb-2 font-medium text-700">
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
                      </div>

                      <div className="p-field mt-4">
                        <label htmlFor="newPass" className="block mb-2 font-medium text-700">
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
                          promptLabel="Ingrese al menos 8 caracteres"
                          weakLabel="Débil"
                          mediumLabel="Media"
                          strongLabel="Fuerte"
                        />
                      </div>

                      <div className="p-field mt-4">
                        <label htmlFor="confirmPass" className="block mb-2 font-medium text-700">
                          Confirmar nueva contraseña
                        </label>
                        <Password
                          id="confirmPass"
                          value={credenciales.confirmarContraseña}
                          onChange={(e) => handleCredencialChange("confirmarContraseña", e.target.value)}
                          feedback={false}
                          toggleMask
                          className="w-full"
                          inputClassName="w-full"
                          placeholder="Confirme su nueva contraseña"
                        />
                      </div>

                      <Button
                        label="Cambiar contraseña"
                        icon="pi pi-lock"
                        className="mt-3 w-full"
                        onClick={cambiarContraseña}
                        severity="warning"
                        raised
                      />
                    </Panel>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Preferencias" leftIcon="pi pi-cog mr-2">
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-6">
                    <Panel 
                      header="Idioma y región" 
                      toggleable 
                      collapsed={!panelStates.languagePanel}
                      onToggle={(e) => togglePanel('languagePanel')}
                    >
                      <div className="p-field">
                        <label className="block mb-2 font-medium text-700">Idioma de la interfaz</label>
                        <Dropdown
                          value={preferencias.idioma}
                          options={IDIOMAS}
                          onChange={(e) => handlePreferenciaChange("idioma", e.value)}
                          placeholder="Seleccione idioma"
                          className="w-full"
                          optionLabel="label"
                        />
                      </div>
                    </Panel>

                    <Panel 
                      header="Tema" 
                      toggleable 
                      className="mt-4"
                      collapsed={!panelStates.themePanel}
                      onToggle={(e) => togglePanel('themePanel')}
                    >
                      <div className="p-field">
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="tema"
                            checked={preferencias.modoOscuro}
                            onChange={(e) => handlePreferenciaChange("modoOscuro", e.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="tema" className="font-medium text-700">
                            Modo oscuro
                          </label>
                        </div>
                      </div>
                    </Panel>
                  </div>

                  <div className="p-col-12 p-md-6">
                    <Panel 
                      header="Notificaciones" 
                      toggleable 
                      collapsed={!panelStates.notificationsPanel}
                      onToggle={(e) => togglePanel('notificationsPanel')}
                    >
                      <div className="p-field">
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="notif"
                            checked={preferencias.notificaciones}
                            onChange={(e) => handlePreferenciaChange("notificaciones", e.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="notif" className="font-medium text-700">
                            Recibir notificaciones por correo
                          </label>
                        </div>
                      </div>

                      <div className="p-field mt-4">
                        <label className="block mb-2 font-medium text-700">Frecuencia de notificaciones</label>
                        <Dropdown
                          value="diario"
                          options={[
                            { label: "En tiempo real", value: "inmediato" },
                            { label: "Diariamente", value: "diario" },
                            { label: "Semanalmente", value: "semanal" },
                          ]}
                          className="w-full"
                          disabled={!preferencias.notificaciones}
                        />
                      </div>
                    </Panel>
                  </div>
                </div>
              </TabPanel>
            </TabView>

            <div className="p-mt-4 p-text-right">
              <Button 
                label="Guardar todos los cambios" 
                icon="pi pi-save" 
                className="p-button-rounded"
                severity="success"
                raised
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Ajustes);