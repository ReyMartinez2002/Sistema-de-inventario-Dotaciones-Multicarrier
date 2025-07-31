import React, { useState, useRef, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import type { CheckboxChangeEvent } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { classNames } from "primereact/utils";
import { Panel } from "primereact/panel";
import { TabView, TabPanel } from "primereact/tabview";
import type { TabViewTabChangeEvent } from "primereact/tabview";
import type { PreferenciasPayload } from "../services/userPreferencesApi";
import { UserApi } from "../services/userPreferencesApi";
import "./styles/Ajustes.css";

// Obtén el id y token del usuario autenticado (ajusta según tu auth real)
const userId = Number(localStorage.getItem("userId"));
const token = localStorage.getItem("token") || "";
const api = new UserApi();

const IDIOMAS = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" },
];

type PanelName =
  | "emailPanel"
  | "passwordPanel"
  | "languagePanel"
  | "themePanel"
  | "notificationsPanel";

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
  const [panelStates, setPanelStates] = useState<Record<PanelName, boolean>>({
    emailPanel: false,
    passwordPanel: false,
    languagePanel: false,
    themePanel: false,
    notificationsPanel: false,
  });

  const toast = useRef<Toast>(null);

  const togglePanel = (panelName: PanelName) => {
    setPanelStates((prev) => ({
      ...prev,
      [panelName]: !prev[panelName],
    }));
  };

  const handlePreferenciaChange = useCallback(
    (key: keyof typeof preferencias, value: boolean | string) => {
      setPreferencias((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleCredencialChange = useCallback(
    (key: keyof typeof credenciales, value: string) => {
      setCredenciales((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Actualiza solo email
  const cambiarCorreo = useCallback(async () => {
    if (!credenciales.correo) {
      showToast("warn", "Correo vacío", "Debe ingresar un correo válido");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credenciales.correo)) {
      showToast("error", "Correo inválido", "Ingrese un correo electrónico válido");
      return;
    }
    try {
      await api.updateEmail(userId, credenciales.correo, token);
      showToast("success", "Correo actualizado", "El correo fue cambiado correctamente");
      handleCredencialChange("correo", "");
      togglePanel("emailPanel");
    } catch (err) {
      showToast("error", "Error", "No se pudo cambiar el correo" + err);
    }
  }, [credenciales.correo, handleCredencialChange]);

  // Cambia solo contraseña
  const cambiarContraseña = useCallback(async () => {
    const { contraseñaActual, nuevaContraseña, confirmarContraseña } =
      credenciales;
    if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
      showToast("warn", "Campos incompletos", "Debe llenar todos los campos");
      return;
    }
    if (nuevaContraseña.length < 8) {
      showToast(
        "error",
        "Contraseña débil",
        "La contraseña debe tener al menos 8 caracteres"
      );
      return;
    }
    if (nuevaContraseña !== confirmarContraseña) {
      showToast(
        "error",
        "Contraseñas no coinciden",
        "Las contraseñas ingresadas no son iguales"
      );
      return;
    }
    try {
      await api.updatePassword(userId, contraseñaActual, nuevaContraseña, token);
      showToast("success", "Contraseña cambiada", "Contraseña actualizada con éxito");
      handleCredencialChange("contraseñaActual", "");
      handleCredencialChange("nuevaContraseña", "");
      handleCredencialChange("confirmarContraseña", "");
      togglePanel("passwordPanel");
    } catch (err) {
      showToast("error", "Error", "No se pudo cambiar la contraseña" + err);
    }
  }, [credenciales, handleCredencialChange]);

  // Guardar preferencias generales
  const guardarPreferencias = async () => {
    try {
      await api.updatePreferences(userId, preferencias as PreferenciasPayload, token);
      showToast("success", "Preferencias guardadas", "Tus preferencias han sido actualizadas");
    } catch {
      showToast("error", "Error", "No se pudo guardar la configuración");
    }
  };

  const showToast = (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Usa JSX directamente en el prop header
  const cardHeader = (
    <div style={{ padding: "1rem" }}>
      <span className="text-xl font-semibold">Configuración de la cuenta</span>
    </div>
  );

  return (
    <div className={classNames("settings-container", { "dark-mode": preferencias.modoOscuro })}>
      <Toast ref={toast} position="top-right" />
      <div className="p-grid p-justify-center">
        <div className="p-col-12 p-lg-10 p-xl-8">
          <Card header={cardHeader} className="shadow-5">
            <TabView
              activeIndex={activeTab}
              onTabChange={(e: TabViewTabChangeEvent) => setActiveTab(e.index)}
            >
              <TabPanel header="Seguridad" leftIcon="pi pi-shield mr-2">
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-6">
                    <Panel
                      header="Cambiar correo electrónico"
                      toggleable
                      collapsed={!panelStates.emailPanel}
                      onToggle={() => togglePanel("emailPanel")}
                    >
                      <div className="p-field">
                        <label
                          htmlFor="correo"
                          className="block mb-2 font-medium text-700"
                        >
                          Nuevo correo electrónico
                        </label>
                        <InputText
                          id="correo"
                          value={credenciales.correo}
                          onChange={(e) =>
                            handleCredencialChange("correo", e.target.value)
                          }
                          placeholder="nuevo@correo.com"
                          className="w-full"
                          keyfilter="email"
                        />
                        <small className="p-text-secondary">
                          Recibirás un correo de confirmación
                        </small>
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
                      onToggle={() => togglePanel("passwordPanel")}
                    >
                      <div className="p-field">
                        <label
                          htmlFor="currentPass"
                          className="block mb-2 font-medium text-700"
                        >
                          Contraseña actual
                        </label>
                        <Password
                          id="currentPass"
                          value={credenciales.contraseñaActual}
                          onChange={(e) =>
                            handleCredencialChange(
                              "contraseñaActual",
                              e.target.value
                            )
                          }
                          feedback={false}
                          toggleMask
                          className="w-full"
                          inputClassName="w-full"
                          placeholder="Ingrese su contraseña actual"
                        />
                      </div>

                      <div className="p-field mt-4">
                        <label
                          htmlFor="newPass"
                          className="block mb-2 font-medium text-700"
                        >
                          Nueva contraseña
                        </label>
                        <Password
                          id="newPass"
                          value={credenciales.nuevaContraseña}
                          onChange={(e) =>
                            handleCredencialChange(
                              "nuevaContraseña",
                              e.target.value
                            )
                          }
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
                        <label
                          htmlFor="confirmPass"
                          className="block mb-2 font-medium text-700"
                        >
                          Confirmar nueva contraseña
                        </label>
                        <Password
                          id="confirmPass"
                          value={credenciales.confirmarContraseña}
                          onChange={(e) =>
                            handleCredencialChange(
                              "confirmarContraseña",
                              e.target.value
                            )
                          }
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
                      onToggle={() => togglePanel("languagePanel")}
                    >
                      <div className="p-field">
                        <label className="block mb-2 font-medium text-700">
                          Idioma de la interfaz
                        </label>
                        <Dropdown
                          value={preferencias.idioma}
                          options={IDIOMAS}
                          onChange={(e) =>
                            handlePreferenciaChange("idioma", e.value)
                          }
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
                      onToggle={() => togglePanel("themePanel")}
                    >
                      <div className="p-field">
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="tema"
                            checked={preferencias.modoOscuro}
                            onChange={(e: CheckboxChangeEvent) =>
                              handlePreferenciaChange(
                                "modoOscuro",
                                !!e.checked
                              )
                            }
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
                      onToggle={() => togglePanel("notificationsPanel")}
                    >
                      <div className="p-field">
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="notif"
                            checked={preferencias.notificaciones}
                            onChange={(e: CheckboxChangeEvent) =>
                              handlePreferenciaChange(
                                "notificaciones",
                                !!e.checked
                              )
                            }
                            className="mr-2"
                          />
                          <label htmlFor="notif" className="font-medium text-700">
                            Recibir notificaciones por correo
                          </label>
                        </div>
                      </div>

                      <div className="p-field mt-4">
                        <label className="block mb-2 font-medium text-700">
                          Frecuencia de notificaciones
                        </label>
                        <Dropdown
                          value="diario"
                          options={[
                            {
                              label: "En tiempo real",
                              value: "inmediato",
                            },
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
                className="p-button-rounded btn-success-ajustes"
                severity="success"
                raised
                onClick={guardarPreferencias}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Ajustes);