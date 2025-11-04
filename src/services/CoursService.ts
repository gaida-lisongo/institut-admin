import useAuthStore from "@/stores/authStore";
import { Produit } from "./ProduitService";
import config from "./config.json";

export interface PlanItem {
  anneeId: string;
  contenu: string[];
}

export interface Seance {
  _id?: string;
  anneeId: string;
  produitId: string;
  status: 'NO' | 'PENDING' | 'OK';
  produit?: Produit;
}

export interface Travail {
  _id?: string;
  anneeId: string;
  questionnaire: string;
  produitId: string;
  status: 'NO' | 'PENDING' | 'OK';
  produit?: Produit;
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
  private baseUrl = `${config.API_BASE_URL}/enseignement`;

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

  // CRUD pour les travaux
  // async createTravail(coursId: string, travail: Omit<Travail, '_id'>): Promise<Travail> {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/cours/${coursId}/travaux`, {
  //       method: "POST",
  //       headers: this.getAuthHeaders(),
  //       body: JSON.stringify(travail),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error("Erreur lors de la création du travail:", error);
  //     throw error;
  //   }
  // }

  async updateTravail(coursId: string, travailId: string, travail: Partial<Travail>): Promise<Travail> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/travaux/${travailId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(travail),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du travail:", error);
      throw error;
    }
  }

  async deleteTravail(coursId: string, travailId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/travaux/${travailId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du travail:", error);
      throw error;
    }
  }

  // CRUD pour les séances
  async createSeance(coursId: string, seance: Omit<Seance, '_id'>): Promise<Seance> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/seances`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(seance),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de la séance:", error);
      throw error;
    }
  }

  async updateSeance(coursId: string, seanceId: string, seance: Partial<Seance>): Promise<Seance> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/seances/${seanceId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(seance),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la séance:", error);
      throw error;
    }
  }

  async deleteSeance(coursId: string, seanceId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/seances/${seanceId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression de la séance:", error);
      throw error;
    }
  }

  // CRUD pour les plans
  async updatePlan(coursId: string, plan: PlanItem[]): Promise<Cours> {
    try {
      const response = await fetch(`${this.baseUrl}/cours/${coursId}/plan`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du plan:", error);
      throw error;
    }
  }

  // CRUD pour les plans par charge
  async updatePlanByCharge(chargeId: string, plan: PlanItem[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/charges/${chargeId}/plan`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du plan par charge:", error);
      throw error;
    }
  }

  async createTravail(
    {
      coursId,
      questionnaire,
      anneeId,
      produitId
    } : {
      coursId: string;
      questionnaire: string;
      anneeId: string;
      produitId: string;
    }
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/travail`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ questionnaire, anneeId, coursId, produitId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as Travail;
    } catch (error) {
      console.error("Erreur lors de la création du travail:", error);
      throw error;
    }
  }
}

export default new CoursService();