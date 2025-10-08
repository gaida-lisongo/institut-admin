import { Autorisation } from '@/types/personnel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class PersonnelService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Gestion des autorisations
  static async addAutorisation(userId: string, autorisation: Partial<Autorisation>) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/autorisations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(autorisation)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'ajout de l\'autorisation');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'autorisation:', error);
      throw error;
    }
  }

  static async updateAutorisation(userId: string, autorisationId: string, autorisation: Partial<Autorisation>) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/autorisations/${autorisationId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(autorisation)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la mise à jour de l\'autorisation');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'autorisation:', error);
      throw error;
    }
  }

  static async deleteAutorisation(userId: string, autorisationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/autorisations/${autorisationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la suppression de l\'autorisation');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'autorisation:', error);
      throw error;
    }
  }

  static async getAutorisations(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/autorisations`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la récupération des autorisations');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des autorisations:', error);
      throw error;
    }
  }
}

export default PersonnelService;
