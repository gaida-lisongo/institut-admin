import useAuthStore from "@/stores/authStore";

export interface Inscription {
  anneeId: string;
  produitId: string;
}

export interface Semestre<TUnite = string> {
  _id?: string;
  designation: string;
  description: string;
  unites: TUnite[]; // IDs des unités d'enseignement ou détails selon le type
  insription: Inscription[]; // Note: le serveur utilise "insription" (sans 'c')
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SemestreFormData {
  designation: string;
  description: string;
  unites: string[];
  insription: Inscription[]; // Note: utiliser "insription" pour correspondre au serveur
}

export interface UniteDetails {
  _id: string;
  descripteur: {
    designation: string;
    code: string;
    credit: number;
    type: 'Obigatoire' | 'Optionnelle';
  };
}

export interface SemestreWithUnites extends Semestre<UniteDetails> {}

class SemestreService {
  private baseUrl = "https://server-gr.he-section.site/api/v1/enseignement";

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Récupérer tous les semestres
  async getSemestres(): Promise<Semestre[]> {
    try {
      const response = await fetch(`${this.baseUrl}/semestre`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des semestres:", error);
      throw error;
    }
  }

  // Récupérer un semestre par ID avec détails des unités
  async getSemestre(id: string): Promise<SemestreWithUnites> {
    try {
      const response = await fetch(`${this.baseUrl}/semestre/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du semestre:", error);
      throw error;
    }
  }

  // Créer un semestre
  async createSemestre(data: SemestreFormData): Promise<Semestre> {
    try {
      const response = await fetch(`${this.baseUrl}/semestre`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du semestre:", error);
      throw error;
    }
  }

  // Mettre à jour un semestre
  async updateSemestre(id: string, data: Partial<SemestreFormData>): Promise<Semestre> {
    try {
      const response = await fetch(`${this.baseUrl}/semestre/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du semestre:", error);
      throw error;
    }
  }

  // Supprimer un semestre
  async deleteSemestre(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/semestre/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du semestre:", error);
      throw error;
    }
  }
}

export default new SemestreService();