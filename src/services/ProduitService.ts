import useAuthStore from "@/stores/authStore";

export interface Produit {
  _id?: string;
  benefice: string[];
  designation: string;
  image?: string;
  montant: number;
  caracteristiques: string[];
  sectionId: string | SectionDetails;
  anneeId: string | AnneeDetails;
  categorie: string[];
  avantages: string[];
}

export interface ProduitFormData {
  benefice: string[];
  designation: string;
  image?: string;
  montant: number;
  caracteristiques: string[];
  sectionId: string;
  anneeId: string;
  categorie: string[];
  avantages: string[];
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

export interface ProduitWithDetails extends Produit {
  sectionId: SectionDetails;
  anneeId: AnneeDetails;
}

class ProduitService {
  private baseUrl = "https://server-gr.he-section.site/api/v1";

  private getAuthHeaders() {
    const { token } = useAuthStore.getState();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getProduits(): Promise<ProduitWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      throw error;
    }
  }

  async getProduit(id: string): Promise<ProduitWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      throw error;
    }
  }

  async getProduitsByCategorie(categorie: string): Promise<ProduitWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit/categorie/${categorie}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des produits par catégorie:", error);
      throw error;
    }
  }

  async getProduitByAnneeAndSection(anneeId: string, sectionId: string): Promise<ProduitWithDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit/annee/${anneeId}/section/${sectionId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du produit par année et section:", error);
      throw error;
    }
  }

  async createProduit(data: ProduitFormData): Promise<Produit> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      throw error;
    }
  }

  async updateProduit(id: string, data: Partial<ProduitFormData>): Promise<ProduitWithDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      throw error;
    }
  }

  async deleteProduit(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vente/produit/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      throw error;
    }
  }
}

export default new ProduitService();