import axios from "axios";

export class UserApi {
  private baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  // Actualiza perfil (nombre y correo)
  async updateProfile(
    id: number,
    data: { nombre?: string; correo?: string },
    token: string
  ) {
    const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
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

  // Cambia contraseña
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    token: string
  ) {
    const response = await fetch(`${this.baseUrl}/usuarios/${id}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contraseñaActual: currentPassword, nuevaContraseña: newPassword }),
    });
    if (!response.ok) throw new Error("Error al cambiar contraseña");
    return response.json();
  }

  // Actualiza foto de perfil
  async updatePhoto(id: number, file: File, token: string) {
    const formData = new FormData();
    formData.append("foto", file);

    const response = await fetch(`${this.baseUrl}/usuarios/${id}/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error("Error al actualizar foto");
    return response.json();
  }
}

// Obtener historial de accesos
export const getHistorialAccesos = async () => {
  const baseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const response = await axios.get(`${baseUrl}/users/historial-accesos`);
  if (response.data && response.data.success) {
    // Si tu backend responde con { success, data, ... }
    return response.data.data;
  }
  // Si responde directo con el array
  return response.data;
};