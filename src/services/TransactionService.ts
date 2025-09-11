// Types pour les transactions
export interface Deposit {
  _id?: string;
  userId: string;
  montant: number;
  orderNumber: string;
  reference: string;
  status: 'NO' | 'PENDING' | 'OK';
  createdAt?: string;
  updatedAt?: string;
}

export interface Withdraw {
  _id?: string;
  userId: string;
  montant: number;
  orderNumber: string;
  reference: string;
  status: 'NO' | 'PENDING' | 'OK';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  currency: string;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdraws: number;
  pendingDeposits: number;
  pendingWithdraws: number;
  successfulDeposits: number;
  successfulWithdraws: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class TransactionService {
  private baseUrl: string;

  constructor() {
    // Utilise l'URL du serveur distant
    this.baseUrl = 'https://legendary-barnacle.onrender.com/api/v1/transaction';
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      // Compose ApiResponse object
      return {
        success: response.ok,
        message: data?.message ?? (response.ok ? 'Succès' : 'Erreur'),
        data: data?.data ?? data,
        error: !response.ok ? (data?.error ?? data?.message ?? 'Erreur inconnue') : undefined,
      };
    } catch (error) {
      console.error('Transaction API Error:', error);
      return {
        success: false,
        message: 'Erreur de réseau',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // ============= MÉTHODES PAYMENT =============
  
  /**
   * Créer une transaction de paiement
   */
  async createPayment(paymentData: PaymentRequest): Promise<ApiResponse> {
    const url = `${this.baseUrl}/payment`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPayment(orderNumber: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}/payment/${encodeURIComponent(orderNumber)}`;
    return this.makeRequest(url);
  }

  // ============= MÉTHODES DEPOSITS =============

  /**
   * Créer un nouveau dépôt
   */
  async createDeposit(depositData: Omit<Deposit, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Deposit>> {
    const url = `${this.baseUrl}/deposit`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  /**
   * Récupérer tous les dépôts
   */
  async getAllDeposits(): Promise<ApiResponse<Deposit[]>> {
    const url = `${this.baseUrl}/deposits`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer les dépôts par utilisateur
   */
  async getDepositsByUserId(userId: string): Promise<ApiResponse<Deposit[]>> {
    const url = `${this.baseUrl}/deposits/user/${encodeURIComponent(userId)}`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer un dépôt par ID
   */
  async getDepositById(id: string): Promise<ApiResponse<Deposit>> {
    const url = `${this.baseUrl}/deposit/${encodeURIComponent(id)}`;
    return this.makeRequest(url);
  }

  /**
   * Modifier un dépôt
   */
  async updateDeposit(id: string, depositData: Partial<Deposit>): Promise<ApiResponse<Deposit>> {
    const url = `${this.baseUrl}/deposit/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(depositData),
    });
  }

  /**
   * Supprimer un dépôt
   */
  async deleteDeposit(id: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}/deposit/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // ============= MÉTHODES WITHDRAWALS =============

  /**
   * Créer un nouveau retrait
   */
  async createWithdraw(withdrawData: Omit<Withdraw, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Withdraw>> {
    const url = `${this.baseUrl}/withdraw`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    });
  }

  /**
   * Récupérer tous les retraits
   */
  async getAllWithdraws(): Promise<ApiResponse<Withdraw[]>> {
    const url = `${this.baseUrl}/withdraws`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer les retraits par utilisateur
   */
  async getWithdrawsByUserId(userId: string): Promise<ApiResponse<Withdraw[]>> {
    const url = `${this.baseUrl}/withdraws/user/${encodeURIComponent(userId)}`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer un retrait par ID
   */
  async getWithdrawById(id: string): Promise<ApiResponse<Withdraw>> {
    const url = `${this.baseUrl}/withdraw/${encodeURIComponent(id)}`;
    return this.makeRequest(url);
  }

  /**
   * Modifier un retrait
   */
  async updateWithdraw(id: string, withdrawData: Partial<Withdraw>): Promise<ApiResponse<Withdraw>> {
    const url = `${this.baseUrl}/withdraw/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(withdrawData),
    });
  }

  /**
   * Supprimer un retrait
   */
  async deleteWithdraw(id: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}/withdraw/${encodeURIComponent(id)}`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // ============= MÉTHODES UTILITAIRES =============

  /**
   * Récupérer toutes les transactions d'un utilisateur (dépôts + retraits)
   */
  async getAllTransactionsByUserId(userId: string): Promise<ApiResponse<{deposits: Deposit[], withdraws: Withdraw[]}>> {
    const url = `${this.baseUrl}/user/${encodeURIComponent(userId)}/all`;
    return this.makeRequest(url);
  }

  /**
   * Récupérer les statistiques des transactions
   */
  async getTransactionStats(): Promise<ApiResponse<TransactionStats>> {
    const url = `${this.baseUrl}/stats`;
    return this.makeRequest(url);
  }

  // ============= MÉTHODES DE RECHERCHE ET FILTRAGE =============

  /**
   * Rechercher des dépôts avec filtres
   */
  async searchDeposits(params: {
    userId?: string;
    status?: 'NO' | 'PENDING' | 'OK';
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse<Deposit[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/deposits?${searchParams.toString()}`;
    return this.makeRequest(url);
  }

  /**
   * Rechercher des retraits avec filtres
   */
  async searchWithdraws(params: {
    userId?: string;
    status?: 'NO' | 'PENDING' | 'OK';
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse<Withdraw[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/withdraws?${searchParams.toString()}`;
    return this.makeRequest(url);
  }

  // ============= MÉTHODES DE VALIDATION =============

  /**
   * Valider les données d'un dépôt
   */
  validateDepositData(data: Partial<Deposit>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) {
      errors.push('L\'ID utilisateur est requis');
    }

    if (!data.montant || data.montant <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }

    if (!data.orderNumber || data.orderNumber.trim() === '') {
      errors.push('Le numéro de commande est requis');
    }

    if (!data.reference || data.reference.trim() === '') {
      errors.push('La référence est requise');
    }

    if (data.status && !['NO', 'PENDING', 'OK'].includes(data.status)) {
      errors.push('Le statut doit être NO, PENDING ou OK');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valider les données d'un retrait
   */
  validateWithdrawData(data: Partial<Withdraw>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) {
      errors.push('L\'ID utilisateur est requis');
    }

    if (!data.montant || data.montant <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }

    if (!data.orderNumber || data.orderNumber.trim() === '') {
      errors.push('Le numéro de commande est requis');
    }

    if (!data.reference || data.reference.trim() === '') {
      errors.push('La référence est requise');
    }

    if (data.status && !['NO', 'PENDING', 'OK'].includes(data.status)) {
      errors.push('Le statut doit être NO, PENDING ou OK');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formater un numéro de téléphone
   */
  formatPhoneNumber(number: string): string | null {
    const cleaned = ('' + number).replace(/\D/g, '');
    const match = cleaned.match(/(\d{9})$/);
    if (match) {
      return '243' + match[1];
    }
    return null;
  }

  /**
   * Générer un numéro de commande unique
   */
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Générer une référence unique
   */
  generateReference(prefix: string = 'REF'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }
}

export default new TransactionService();