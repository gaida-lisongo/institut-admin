import useAuthStore from "@/stores/authStore";

export interface PlanItem {
  anneeId: string;
  contenu: string[];
}

export interface Seance {
  anneeId: string;
  produitId: string;
  status: 'NO' | 'PENDING' | 'OK';
}

export interface Travail {
  anneeId: string;
  produitId: string;
  status: 'NO' | 'PENDING' | 'OK';
}

export interface Cours {
  _id?: string;
  titre: string;
  description: string;
  enseignement: string[];
  credit: number;
  contenu: string[];
  repartition: string[];
  plan: PlanItem[];
  seances: Seance[];
  travaux: Travail[];
  ressources: string[];
  penalites: string[];
  plagiat: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CoursFormData {
  titre: string;
  description: string;
  enseignement: string[];
  credit: number;
  contenu: string[];
  repartition: string[];
  plan: PlanItem[];
  seances: Seance[];
  travaux: Travail[];
  ressources: string[];
  penalites: string[];
  plagiat: string[];
}

class CoursService {
  private baseUrl = "https://server.inbtp.net/api/v1/enseignement";

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  async getCoursList(): Promise<Cours[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cours`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error);
      throw error;
    }
  }

  async getCours(id: string): Promise<Cours> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du cours:", error);
      throw error;
    }
  }

  async createCours(data: CoursFormData): Promise<Cours> {
    try {
      const response = await fetch(`${this.baseUrl}/cours`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du cours:", error);
      throw error;
    }
  }

  async updateCours(id: string, data: Partial<CoursFormData>): Promise<Cours> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours:", error);
      throw error;
    }
  }

  async deleteCours(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      throw error;
    }
  }
}

export default new CoursService();