
import useAuthStore from "@/stores/authStore";

export interface CoursPopulated {
    _id: string;
    titre: string;
    description: string;
    enseignement: string[];
    credit: number;
    contenu: string[];
    repartition: string[];
    plan: any[];
    seances: any[];
    travaux: any[];
    ressources: string[];
    penalites: string[];
    plagiat: string[];
    __v?: number;
}

export interface SessionFormData {
    anneeId: string;
    cours: string[]; // Array of ObjectIds
    produitId?: string; // ObjectId (optional)
    nomSession: string;
    dateDebut: string; // ISO date string
    dateFin: string; // ISO date string
}

export interface SessionResponse {
    _id: string;
    anneeId: string;
    cours: CoursPopulated[]; // Array of populated cours objects
    produitId?: string; // ObjectId (optional)
    nomSession: string;
    dateDebut: string;
    dateFin: string;
    __v?: number; // Mongoose version field
    createdAt?: string; // Optional, may not be present
    updatedAt?: string; // Optional, may not be present
}

class SessionService {
  private baseUrl = "https://server-gr.he-section.site/api/v1/annee";

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  async getSessions(id: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/session/annee/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json();
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }

  async createSession(data: SessionFormData): Promise<SessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  async updateSession(id: string, data: Partial<SessionFormData>): Promise<SessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/session/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update session");
      return response.json();
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/session/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete session");
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

}

export default new SessionService();