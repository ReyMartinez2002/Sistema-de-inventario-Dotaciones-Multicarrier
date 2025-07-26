import React, { useRef, useState, useCallback } from "react";
import { useAuth } from "../contex/useAuth";
import { UserApi } from "../services/userApi";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import { Checkbox } from "primereact/checkbox";
import type { CheckboxChangeEvent } from "primereact/checkbox";
import { classNames } from "primereact/utils";
import type { FileUploadHandlerEvent } from "primereact/fileupload";
import "./styles/Perfil.css";

interface UsuarioPerfil {
  nombre: string;
  correo: string;
  rol: string;
  foto: string;
}

const userApi = new UserApi();

const Perfil: React.FC = () => {
  const { user, token } = useAuth();

  const [perfil, setPerfil] = useState<UsuarioPerfil>({
    nombre: user?.nombre || "",
    correo: user?.username || user?.email || "",
    rol: user?.rol || "",
    foto: user?.foto || "/user-default.png",
  });

  const [modoOscuro, setModoOscuro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const toast = useRef<Toast>(null);

  const onUpload = useCallback(async (e: FileUploadHandlerEvent) => {
    const file = e.files[0];
    if (!file.type.startsWith('image/')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Archivo no válido',
        detail: 'Por favor sube una imagen (JPEG, PNG, etc.)',
        life: 3000
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.current?.show({
        severity: 'error',
        summary: 'Archivo demasiado grande',
        detail: 'La imagen no debe superar los 2MB',
        life: 3000
      });
      return;
    }
    setCargando(true);
    try {
      await userApi.updatePhoto(user!.id, file, token!);
      // Simula refrescar la foto (en real deberías volver a traer el usuario)
      const reader = new FileReader();
      reader.onload = (event) => {
        setPerfil(prev => ({ ...prev, foto: event.target?.result as string }));
        toast.current?.show({
          severity: 'success',
          summary: 'Foto actualizada',
          detail: 'Se ha cargado una nueva foto de perfil',
          life: 3000
        });
        setCargando(false);
      };
      reader.onerror = () => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la imagen',
          life: 3000
        });
        setCargando(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar la foto',
        life: 3000
      });
      setCargando(false);
    }
  }, [user, token]);

  const guardarCambios = useCallback(async () => {
    if (!perfil.nombre.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Nombre requerido',
        detail: 'Por favor ingresa tu nombre',
        life: 3000
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.correo)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Correo inválido',
        detail: 'Por favor ingresa un correo electrónico válido',
        life: 3000
      });
      return;
    }
    setCargando(true);
    try {
      await userApi.updateProfile(user!.id, { nombre: perfil.nombre, correo: perfil.correo }, token!);
      toast.current?.show({
        severity: 'success',
        summary: 'Perfil actualizado',
        detail: 'Los cambios han sido guardados correctamente',
        life: 3000
      });
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el perfil',
        life: 3000
      });
    }
    setCargando(false);
  }, [perfil, user, token]);

  const handleInputChange = useCallback((field: keyof UsuarioPerfil, value: string) => {
    setPerfil(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className={classNames("perfil-container", { 'dark-mode': modoOscuro })}>
      <Toast ref={toast} position="top-right" />
      <Card 
        title="Mi Perfil" 
        className="perfil-card shadow-3"
        header={
          <div className="flex justify-content-between align-items-center">   
            <div className="flex align-items-center gap-2">
              <i className="pi pi-moon" />
              <Checkbox 
                inputId="modoOscuro"
                checked={modoOscuro}
                onChange={(e: CheckboxChangeEvent) => setModoOscuro(!!e.checked)}
              />
              <label htmlFor="modoOscuro" className="text-sm">Modo oscuro</label>
            </div>
          </div>
        }
      >
        <div className="perfil-content grid">
          <div className="col-12 md:col-4 flex flex-column align-items-center gap-4">
            <div className="relative">
              <Image
                src={perfil.foto}
                alt="Foto de perfil"
                width="180"
                height="180"
                imageStyle={{ 
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--primary-color)"
                }}
                preview
              />
              {cargando && (
                <div className="image-loading-overlay">
                  <i className="pi pi-spin pi-spinner" />
                </div>
              )}
            </div>
            
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={2000000}
              chooseLabel={cargando ? "Subiendo..." : "Cambiar foto"}
              customUpload
              uploadHandler={onUpload}
              disabled={cargando}
              auto
              chooseOptions={{
                icon: 'pi pi-camera',
                iconOnly: false,
                className: 'p-button-rounded p-button-outlined'
              }}
            />
            
            <div className="text-center mt-2">
              <span className="font-bold block">{perfil.nombre}</span>
              <span className="text-color-secondary">{perfil.rol}</span>
            </div>
          </div>
          
          <Divider layout="vertical" className="hidden md:flex" />
          
          <div className="col-12 md:col-8">
            <div className="p-fluid grid formgrid">
              <div className="field col-12 md:col-6">
                <label htmlFor="nombre">Nombre completo</label>
                <InputText
                  id="nombre"
                  value={perfil.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ingresa tu nombre"
                />
              </div>
              
              <div className="field col-12 md:col-6">
                <label htmlFor="correo">Correo electrónico</label>
                <InputText
                  id="correo"
                  value={perfil.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  placeholder="tu@correo.com"
                  keyfilter="email"
                />
              </div>
              
              <div className="field col-12 md:col-6">
                <label htmlFor="rol">Rol en el sistema</label>
                <InputText 
                  id="rol" 
                  value={perfil.rol} 
                  disabled 
                />
              </div>
              
              <div className="col-12 mt-4">
                <Button 
                  label="Guardar cambios" 
                  icon="pi pi-save" 
                  onClick={guardarCambios}
                  loading={cargando}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(Perfil);