import { Admin, AdminWithAgent, CreateAdminRequest, UpdateAdminRequest } from "@/types/admin";
import useAuthStore from "@/stores/authStore";

const API_BASE_URL = "https://legendary-barnacle.onrender.com/api/v1/admin";

export class AdminService {

  // Fonction helper pour obtenir les headers d'authentification
  private static getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Créer un nouvel administrateur
  static async createAdmin(adminData: CreateAdminRequest): Promise<Admin> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'admin:", error);
      throw error;
    }
  }

  // Récupérer tous les administrateurs avec leurs informations d'agent
  static async getAdmins(): Promise<AdminWithAgent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des admins:", error);
      throw error;
    }
  }

  // Récupérer un administrateur par ID
  static async getAdmin(id: string): Promise<AdminWithAgent> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'admin:", error);
      throw error;
    }
  }

  // Mettre à jour un administrateur
  static async updateAdmin(id: string, adminData: UpdateAdminRequest): Promise<Admin> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'admin:", error);
      throw error;
    }
  }

  // Supprimer un administrateur
  static async deleteAdmin(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'admin:", error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur connecté est administrateur
  static async checkMe(): Promise<{ isAdmin: boolean; admin?: Admin }> {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la vérification admin:", error);
      throw error;
    }
  }

  // Vérifier si un utilisateur spécifique est administrateur
  static async isUserAdmin(userId: string): Promise<{ isAdmin: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/check/${userId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la vérification utilisateur admin:", error);
      throw error;
    }
  }

  // Méthode utilitaire pour rafraîchir les données d'admin dans le store
  static async refreshAdmins(): Promise<AdminWithAgent[]> {
    try {
      const admins = await this.getAdmins();
      return admins;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des admins:", error);
      throw error;
    }
  }

  // Méthode utilitaire pour vérifier les permissions avant les opérations sensibles
  static async checkAdminPermissions(): Promise<boolean> {
    try {
      const result = await this.checkMe();
      return result.isAdmin;
    } catch (error) {
      console.error("Erreur lors de la vérification des permissions:", error);
      return false;
    }
  }
}