export interface PreferenciasPayload {
  idioma: string;
  notificaciones: boolean;
  modoOscuro: boolean;
  temaColor: string;
}

export class UserApi {
  private baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  // Actualizar datos de perfil (nombre o correo)
  async updateProfile(
    id: number,
    data: { nombre?: string; correo?: string },
    token: string
  ) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar perfil");
    return response.json();
  }

  // Actualizar foto de perfil
  async updatePhoto(id: number, file: File, token: string) {
    const formData = new FormData();
    formData.append("foto", file);

    const response = await fetch(`${this.baseUrl}/users/${id}/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error("Error al actualizar foto");
    return response.json();
  }

  // Cambiar solo correo (endpoint dedicado)
  async updateEmail(id: number, correo: string, token: string) {
    const response = await fetch(`${this.baseUrl}/users/${id}/email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ correo }),
    });
    if (!response.ok) throw new Error("Error al cambiar correo");
    return response.json();
  }

  // Cambiar solo contraseña (endpoint dedicado)
  async updatePassword(
    id: number,
    contraseñaActual: string,
    nuevaContraseña: string,
    token: string
  ) {
    const response = await fetch(`${this.baseUrl}/users/${id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contraseñaActual, nuevaContraseña }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al cambiar contraseña");
    return data;
  }

  // Guardar preferencias del usuario
  async updatePreferences(id: number, preferencias: PreferenciasPayload, token: string) {
    const response = await fetch(`${this.baseUrl}/users/${id}/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferencias),
    });
    if (!response.ok) throw new Error("Error al guardar preferencias");
    return response.json();
  }
}