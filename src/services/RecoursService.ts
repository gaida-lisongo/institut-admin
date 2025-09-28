import useAuthStore from "@/stores/authStore";
import { Recours, RecoursWithDetails, RecoursResponse, RecoursFormData } from "@/types/recours";
import config from "./config.json";

const API_BASE_URL = config.API_BASE_URL;

export class RecoursService {
  // Fonction helper pour obtenir les headers d'authentification
  private static getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Récupérer tous les recours liés à une charge
  static async getRecoursByCharge(chargeId: string): Promise<RecoursResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours/charge/${chargeId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error! status: ${response.status}`,
          data: [],
          count: 0
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des recours par charge:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        data: [],
        count: 0
      };
    }
  }

  // Récupérer tous les recours d'un agent (enseignant)
  static async getRecoursByAgent(agentId: string): Promise<RecoursResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours/agent/${agentId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error! status: ${response.status}`,
          data: [],
          count: 0
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des recours par agent:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        data: [],
        count: 0
      };
    }
  }

  // Créer un nouveau recours
  static async createRecours(recoursData: RecoursFormData): Promise<Recours> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(recoursData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du recours:", error);
      throw error;
    }
  }

  // Supprimer un recours
  static async deleteRecours(recoursId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours/${recoursId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du recours:", error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un recours
  static async updateRecoursStatus(recoursId: string, status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED"): Promise<Recours> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours/${recoursId}/status`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du recours:", error);
      throw error;
    }
  }

  // Traiter un recours (approuver et ajuster la note)
  static async processRecours(recoursId: string, newGrades: {
    cmi?: number;
    examen?: number;
    rattrapage?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/recours/${recoursId}/process`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(newGrades),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du traitement du recours:", error);
      throw error;
    }
  }
}

export default RecoursService;
