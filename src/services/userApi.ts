export class UserApi {
  private baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  async updateProfile(id: number, data: { nombre?: string; correo?: string }, token: string) {
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

  async changePassword(id: number, currentPassword: string, newPassword: string, token: string) {
    const response = await fetch(`${this.baseUrl}/users/${id}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) throw new Error("Error al cambiar contraseña");
    return response.json();
  }

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
}