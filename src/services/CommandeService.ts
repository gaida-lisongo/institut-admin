import useAuthStore from "@/stores/authStore";

export interface Commande {
  _id?: string;
  productId: string;
  statu: 'NO' | 'PENDING' | 'OK';
  reference: string;
  anneeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandeWithDetails {
  _id?: string;
  productIds: string[];
  statu: 'NO' | 'PENDING' | 'OK';
  reference: string;
  matricule?: string;
  telephone?: string;
  currency?: string;
  montant?: number;
  anneeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Annee {
  _id?: string;
  debut: number;
  fin: number;
  motDg?: {
    photo?: string;
    description?: string;
  };
  articles: Array<{
    title?: string;
    content?: string;
    author?: string;
    date?: string;
    tags?: string[];
    image?: string;
    sectionId: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandeStats {
  totalCommandes: number;
  commandesApprouvees: number;
  commandesEnAttente: number;
  commandesRejetees: number;
  commandesParMois: Array<{
    mois: string;
    total: number;
    approuvees: number;
    enAttente: number;
    rejetees: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class CommandeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://server.inbtp.net/api/v1/vente';
  }

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<{status: number, data: any}> {
    try {
      const response = await fetch(url, {
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      return {
        status: response.status,
        data: data
      };
    } catch (error) {
      console.error('Commande API Error:', error);
      throw new Error(`Erreur de réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // ============= MÉTHODES COMMANDES =============

  /**
   * Créer une nouvelle commande
   */
  async createCommande(commandeData: Omit<Commande, '_id' | 'createdAt' | 'updatedAt'>): Promise<{status: number, data: ApiResponse<Commande>}> {
    const url = `${this.baseUrl}/commande`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(commandeData),
    });
  }

  /**
   * Récupérer toutes les commandes
   */
  async getAllCommandes(): Promise<{status: number, data: ApiResponse<Commande[]>}> {
    const url = `${this.baseUrl}/commande`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer une commande par ID
   */
  async getCommandeById(id: string): Promise<{status: number, data: ApiResponse<Commande>}> {
    const url = `${this.baseUrl}/commande/${encodeURIComponent(id)}`;
    return this.makeRequest(url);
  }

  /**
   * Modifier une commande
   */
  async updateCommande(id: string, commandeData: Partial<Commande>): Promise<{status: number, data: ApiResponse<Commande>}> {
    const url = `${this.baseUrl}/commande/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(commandeData),
    });
  }

  /**
   * Supprimer une commande
   */
  async deleteCommande(id: string): Promise<{status: number, data: ApiResponse}> {
    const url = `${this.baseUrl}/commande/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // ============= MÉTHODES UTILITAIRES =============

  /**
   * Récupérer les commandes par année
   */
  async getCommandesByAnnee(anneeId: string): Promise<{status: number, data: ApiResponse<Commande[]>}> {
    const url = `${this.baseUrl}/commande?anneeId=${encodeURIComponent(anneeId)}`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer les statistiques des commandes pour une année
   */
  async getCommandeStats(anneeId?: string): Promise<{status: number, data: ApiResponse<CommandeStats>}> {
    const url = anneeId 
      ? `${this.baseUrl}/commande/stats?anneeId=${encodeURIComponent(anneeId)}`
      : `${this.baseUrl}/commande/stats`;
    return this.makeRequest(url);
  }

  /**
   * Générer une référence unique
   */
  generateReference(prefix: string = 'CMD'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Valider les données d'une commande
   */
  validateCommandeData(data: Partial<Commande>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.productId) {
      errors.push('L\'ID du produit est requis');
    }

    if (!data.reference || data.reference.trim() === '') {
      errors.push('La référence est requise');
    }

    if (!data.anneeId) {
      errors.push('L\'ID de l\'année est requis');
    }

    if (data.statu && !['NO', 'PENDING', 'OK'].includes(data.statu)) {
      errors.push('Le statut doit être NO, PENDING ou OK');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new CommandeService();