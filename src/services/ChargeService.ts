import useAuthStore from "@/stores/authStore";
import { Etudiant } from "@/types/etudiant";
import { Cours } from "./CoursService";
import { Annee } from "./AnneeService";

export interface Charge {
  _id?: string;
  agentId: string | AgentDetails;
  coursId: string | CoursDetails;
  anneeId: string | AnneeDetails;
  status?: "ok" | "pending" | "no";
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChargeWithDetails {
  cours: Cours;
  annee: Annee;
  fiche: {
    _id: string;
    etudiantId: Etudiant
    chargeId: string;
    reference: string;
    logs: any[];
    status: "OK" | "PENDING" | "NO";
    cmi?: number;
    examen?: number;
    rattrapage?: number;
  }[];
}
export interface ChargeFormData {
  agentId: string;
  coursId: string;
  anneeId: string;
  status?: "ok" | "pending" | "no";
}

export interface AgentDetails {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: string;
  matricule: string;
  secure: string;
  solde: number;
  grade: string;
  titre: string;
  photo: string;
  __v: number;
  adresse?: string;
  email?: string;
  telephone?: string;
}

export interface CoursDetails {
  _id: string;
  titre: string;
  description: string;
  enseignement: string[];
  credit: number;
  contenu: any[];
  repartition: any[];
  plan: any[];
  seances: any[];
  travaux: any[];
  ressources: any[];
  penalites: any[];
  plagiat: any[];
  __v: number;
}

export interface AnneeDetails {
  _id: string;
  debut: number;
  fin: number;
  articles: any[];
  __v: number;
  motDg: {
    photo: string;
    description: string;
  };
}

export interface ChargeWithDetails extends Charge {
  agentId: AgentDetails;
  coursId: CoursDetails;
  anneeId: AnneeDetails;
  status: "ok" | "pending" | "no";
}

class ChargeService {
  private baseUrl = "https://server.inbtp.net/api/v1";

  private getAuthHeaders() {
    const { token } = useAuthStore.getState();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getCharges(): Promise<ChargeWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des charges:", error);
      throw error;
    }
  }

  async getCharge(id: string): Promise<ChargeWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de la charge:", error);
      throw error;
    }
  }

  async getChargesByAgent(agentId: string): Promise<ChargeWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/agent/${agentId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des charges par agent:", error);
      throw error;
    }
  }

  async getChargesByAnnee(anneeId: string): Promise<ChargeWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/annee/${anneeId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des charges par année:", error);
      throw error;
    }
  }

  async getChargesByCours(coursId: string): Promise<ChargeWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/cours/${coursId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des charges par cours:", error);
      throw error;
    }
  }

  async createCharge(data: ChargeFormData): Promise<Charge> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de la charge:", error);
      throw error;
    }
  }

  async updateCharge(id: string, data: Partial<ChargeFormData>): Promise<ChargeWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la charge:", error);
      throw error;
    }
  }

  async deleteCharge(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/enseignement/charge/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la charge:", error);
      throw error;
    }
  }
}

export default new ChargeService();