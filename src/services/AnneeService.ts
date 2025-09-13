import { ApiResponse } from "./CommandeService";
import useAuthStore from "@/stores/authStore";

export interface Article {
  title: string;
  content: string;
  author: string;
  date?: string;
  tags?: string[];
  image?: string;
  sectionId: string;
}

export interface MotDg {
  photo?: string;
  description?: string;
}

export interface Annee {
  _id?: string;
  debut: number;
  fin: number;
  motDg?: MotDg;
  articles: Article[];
  createdAt?: string;
  updatedAt?: string;
}

class AnneeService {
  private baseUrl = "https://server.inbtp.net/api/v1/annee";

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  async getAnnees(): Promise<Annee[]> {
    const res = await fetch(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des années");
    return await res.json();
  }

  async getAnnee(id: string): Promise<Annee> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Année non trouvée");
    return await res.json();
  }

  async createAnnee(data: Partial<Annee>): Promise<Annee> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création");
    return await res.json();
  }

  async updateAnnee(id: string, data: Partial<Annee>): Promise<Annee> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la modification");
    return await res.json();
  }

  async deleteAnnee(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    return await res.json();
  }
}

export default new AnneeService();
