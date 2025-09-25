import useAuthStore from "@/stores/authStore";
import { Cours } from "./CoursService";
import { Annee } from "./AnneeService";
import config from "./config.json";

export interface Responsable {
  titulaireId: string;
  anneeId: string | Annee;
}

export interface Descripteur {
  mention: string;
  code: string;
  designation: string;
  credit: number;
  type: 'Obigatoire' | 'Optionnelle';
  prealables: string[];
  objectif: string[];
  competences: string[];
  approches: string[];
  evaluation: string[];
}

export interface Unite {
  _id?: string;
  semestreId: string;
  responsable: Responsable[];
  descripteur: Descripteur;
  ressources: string[];
  bibliographie: string[];
  videographie: string[];
  cours: string[] | Cours[]; // IDs des cours
  createdAt?: string;
  updatedAt?: string;
}

export interface UniteFormData {
  semestreId: string;
  responsable: Responsable[];
  descripteur: Descripteur;
  ressources: string[];
  bibliographie: string[];
  videographie: string[];
  cours: string[];
}

class UniteService {
  private baseUrl = `${config.API_BASE_URL}/enseignement`;

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  async getUnites(): Promise<Unite[]> {
    try {
      const response = await fetch(`${this.baseUrl}/unite`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des unités:", error);
      throw error;
    }
  }

  async getUnite(id: string): Promise<Unite> {
    try {
      const response = await fetch(`${this.baseUrl}/unite/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'unité:", error);
      throw error;
    }
  }

  async createUnite(data: UniteFormData): Promise<Unite> {
    try {
      const response = await fetch(`${this.baseUrl}/unite`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'unité:", error);
      throw error;
    }
  }

  async updateUnite(id: string, data: Partial<UniteFormData>): Promise<Unite> {
    try {
      const response = await fetch(`${this.baseUrl}/unite/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'unité:", error);
      throw error;
    }
  }

  async deleteUnite(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/unite/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'unité:", error);
      throw error;
    }
  }
}

export default new UniteService();