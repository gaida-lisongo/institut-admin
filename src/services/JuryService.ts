import useAuthStore from "@/stores/authStore";

export interface Bureau {
  agentId: string | AgentDetails;
  fonction: 'Président' | 'Secrétaire' | 'Membre';
}

export interface Jury {
  _id?: string;
  anneId: string | AnneeDetails;
  sectionId: string | SectionDetails;
  designation: string;
  code: string;
  bureau: Bureau[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // Champ MongoDB version
}

// Interface spécifique pour les réponses de création du serveur
export interface JuryCreateResponse extends Jury {
  _id: string;
  anneId: string; // Toujours des strings dans les réponses de création
  sectionId: string;
  bureau: Array<{
    agentId: string; // Toujours des strings dans les réponses de création
    fonction: 'Président' | 'Secrétaire' | 'Membre';
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface JuryClasse {
  _id?: string;
  juryId: string | Jury;
  classeId: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface JuryFormData {
  anneId: string;
  sectionId: string;
  designation: string;
  code: string;
  bureau: Bureau[];
}

export interface JuryClasseFormData {
  juryId: string;
  classeId: string;
  status: 'active' | 'inactive';
}

export interface AgentDetails {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  grade: string;
  titre: string;
  photo?: string;
}

export interface SectionDetails {
  _id: string;
  description: {
    sigle: string;
    designation: string;
  };
}

export interface AnneeDetails {
  _id: string;
  debut: number;
  fin: number;
  designation?: string;
}

export interface JuryWithDetails extends Jury {
  anneId: AnneeDetails;
  sectionId: SectionDetails;
  bureau: Array<{
    agentId: AgentDetails;
    fonction: 'Président' | 'Secrétaire' | 'Membre';
  }>;
}

export interface JuryClasseWithDetails extends JuryClasse {
  juryId: JuryWithDetails;
}

class JuryService {
  private baseUrl = "https://server-gr.he-section.site/api/v1";

  private getAuthHeaders() {
    const { token } = useAuthStore.getState();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Jury CRUD
  async getJuries(): Promise<JuryWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jury`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des jurys:", error);
      throw error;
    }
  }

  async getJury(id: string): Promise<JuryWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du jury:", error);
      throw error;
    }
  }

  async getJuriesByAnneeAndSection(anneeId: string, sectionId: string): Promise<JuryWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/annee/${anneeId}/section/${sectionId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des jurys par année et section:", error);
      throw error;
    }
  }

  async createJury(data: JuryFormData): Promise<JuryCreateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jury`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du jury:", error);
      throw error;
    }
  }

  async updateJury(id: string, data: Partial<JuryFormData>): Promise<JuryWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du jury:", error);
      throw error;
    }
  }

  async deleteJury(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/jury/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du jury:", error);
      throw error;
    }
  }

  // JuryClasse CRUD
  async getJuryClasses(): Promise<JuryClasseWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/classe`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des associations jury-classe:", error);
      throw error;
    }
  }

  async getJuryClasse(id: string): Promise<JuryClasseWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/classe/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'association jury-classe:", error);
      throw error;
    }
  }

  async createJuryClasse(data: JuryClasseFormData): Promise<JuryClasse> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/classe`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'association jury-classe:", error);
      throw error;
    }
  }

  async updateJuryClasse(id: string, data: Partial<JuryClasseFormData>): Promise<JuryClasseWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/classe/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'association jury-classe:", error);
      throw error;
    }
  }

  async deleteJuryClasse(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jury/classe/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'association jury-classe:", error);
      throw error;
    }
  }
}

export default new JuryService();