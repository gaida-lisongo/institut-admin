import useAuthStore from "@/stores/authStore";

export interface Classe {
  _id?: string;
  designation: string;
  description: string;
  semestres: string[]; // IDs des semestres
}

export interface Cycle {
  _id?: string;
  designation: string;
  description: string;
  systeme: string;
  sectionId: string;
  classes: Classe[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CycleFormData {
  designation: string;
  description: string;
  systeme: string;
  sectionId: string;
  classes: Omit<Classe, '_id'>[];
}

class CycleService {
  private baseUrl = "https://server.inbtp.net/api/v1/enseignement";

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Récupérer tous les cycles
  async getCycles(): Promise<Cycle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des cycles:", error);
      throw error;
    }
  }

  // Récupérer un cycle par ID
  async getCycle(id: string): Promise<Cycle> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du cycle:", error);
      throw error;
    }
  }

  // Récupérer les cycles d'une section
  async getCyclesBySection(sectionId: string): Promise<Cycle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle/section/${sectionId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des cycles de la section:", error);
      throw error;
    }
  }

  // Créer un cycle
  async createCycle(data: CycleFormData): Promise<Cycle> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du cycle:", error);
      throw error;
    }
  }

  // Mettre à jour un cycle
  async updateCycle(id: string, data: Partial<CycleFormData>): Promise<Cycle> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cycle:", error);
      throw error;
    }
  }

  // Supprimer un cycle
  async deleteCycle(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cycle/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du cycle:", error);
      throw error;
    }
  }
}

export default new CycleService();