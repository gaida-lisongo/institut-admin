import { Offre, OffreFormData, CreateOffreData, UpdateOffreData } from "@/types/offre";

const API_BASE_URL = "https://legendary-barnacle.onrender.com/api";

export class OffreService {
  static async getOffres(): Promise<Offre[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
      throw error;
    }
  }

  static async getOffre(id: string): Promise<Offre> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du chargement de l'offre:", error);
      throw error;
    }
  }

  static async getOffresBySection(sectionId: string): Promise<Offre[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres?sectionId=${sectionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du chargement des offres de la section:", error);
      throw error;
    }
  }

  static async createOffre(offreData: OffreFormData): Promise<Offre> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offreData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'offre:", error);
      throw error;
    }
  }

  static async updateOffre(id: string, offreData: Partial<OffreFormData>): Promise<Offre> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offreData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'offre:", error);
      throw error;
    }
  }

  static async deleteOffre(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/offres/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre:", error);
      throw error;
    }
  }

  // Méthodes utilitaires pour les icônes
  static getIconOptions(): { value: string; label: string; icon: string }[] {
    return [
      { value: "book", label: "Livre", icon: "📚" },
      { value: "computer", label: "Ordinateur", icon: "💻" },
      { value: "science", label: "Science", icon: "🔬" },
      { value: "engineering", label: "Ingénierie", icon: "⚙️" },
      { value: "medicine", label: "Médecine", icon: "🏥" },
      { value: "business", label: "Business", icon: "💼" },
      { value: "art", label: "Art", icon: "🎨" },
      { value: "music", label: "Musique", icon: "🎵" },
      { value: "law", label: "Droit", icon: "⚖️" },
      { value: "education", label: "Éducation", icon: "🎓" },
      { value: "agriculture", label: "Agriculture", icon: "🌾" },
      { value: "architecture", label: "Architecture", icon: "🏗️" },
      { value: "communication", label: "Communication", icon: "📢" },
      { value: "psychology", label: "Psychologie", icon: "🧠" },
      { value: "economics", label: "Économie", icon: "📈" },
      { value: "languages", label: "Langues", icon: "🗣️" },
      { value: "sports", label: "Sport", icon: "🏃" },
      { value: "chemistry", label: "Chimie", icon: "⚗️" },
      { value: "physics", label: "Physique", icon: "🔭" },
      { value: "biology", label: "Biologie", icon: "🧬" },
    ];
  }

  static getEmojiForIcon(iconValue: string): string {
    const options = this.getIconOptions();
    const option = options.find(opt => opt.value === iconValue);
    return option?.icon || "📚";
  }
}
