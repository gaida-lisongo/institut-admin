import { create } from 'zustand';
import { 
  Frais, 
  FraisInput, 
  FraisFilters, 
  FraisApiResponse, 
  FraisDetailResponse, 
  FraisStats,
  FraisPagination 
} from '@/types/frais';

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:4000/api/v1';

interface FraisStore {
  // État
  frais: Frais[];
  filteredFrais: Frais[];
  currentFrais: Frais | null;
  stats: FraisStats | null;
  filters: FraisFilters;
  pagination: FraisPagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions de récupération
  loadFrais: (page?: number, limit?: number) => Promise<void>;
  loadFraisById: (id: string) => Promise<Frais | null>;
  loadFraisByCategorie: (categorie: string, page?: number, limit?: number) => Promise<void>;
  loadFraisByEtab: (type: 'public' | 'prive' | 'tous', page?: number, limit?: number) => Promise<void>;
  searchFrais: (query: string, page?: number, limit?: number) => Promise<void>;
  loadFraisStats: () => Promise<void>;

  // Actions CRUD
  addFrais: (fraisData: FraisInput) => Promise<Frais | null>;
  updateFrais: (id: string, fraisData: FraisInput) => Promise<Frais | null>;
  deleteFrais: (id: string) => Promise<boolean>;

  // Actions de filtrage local
  applyFilters: (filters: FraisFilters) => void;
  setFilters: (filters: Partial<FraisFilters>) => void;
  clearFilters: () => void;

  // Actions utilitaires
  setCurrentFrais: (frais: Frais | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Fonction pour obtenir le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Headers par défaut pour les requêtes
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const useFraisStore = create<FraisStore>((set, get) => ({
  // État initial
  frais: [],
  filteredFrais: [],
  currentFrais: null,
  stats: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,

  // Récupération de tous les frais avec pagination
  loadFrais: async (page = 1, limit = 500) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/frais?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisApiResponse = await response.json();
      
      if (result.success) {
        set({ 
          frais: result.data,
          filteredFrais: result.data,
          pagination: result.pagination || null,
          isLoading: false 
        });
      } else {
        throw new Error(result.message || 'Erreur lors du chargement des frais');
      }
    } catch (error) {
      console.error('Erreur loadFrais:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Récupération d'un frais par ID
  loadFraisById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/frais/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisDetailResponse = await response.json();
      
      if (result.success) {
        set({ currentFrais: result.data, isLoading: false });
        return result.data;
      } else {
        throw new Error(result.message || 'Frais non trouvé');
      }
    } catch (error) {
      console.error('Erreur loadFraisById:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
      return null;
    }
  },

  // Récupération des frais par catégorie
  loadFraisByCategorie: async (categorie: string, page = 1, limit = 500) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/frais/categorie/${encodeURIComponent(categorie)}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisApiResponse = await response.json();
      
      if (result.success) {
        set({ 
          frais: result.data,
          filteredFrais: result.data,
          pagination: result.pagination || null,
          isLoading: false 
        });
      } else {
        throw new Error(result.message || 'Erreur lors du filtrage par catégorie');
      }
    } catch (error) {
      console.error('Erreur loadFraisByCategorie:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Récupération des frais par type d'établissement
  loadFraisByEtab: async (type: 'public' | 'prive' | 'tous', page = 1, limit = 500) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/frais/etabs/${type}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisApiResponse = await response.json();
      
      if (result.success) {
        set({ 
          frais: result.data,
          filteredFrais: result.data,
          pagination: result.pagination || null,
          isLoading: false 
        });
      } else {
        throw new Error(result.message || 'Erreur lors du filtrage par établissement');
      }
    } catch (error) {
      console.error('Erreur loadFraisByEtab:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Recherche textuelle
  searchFrais: async (query: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/frais/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisApiResponse = await response.json();
      
      if (result.success) {
        set({ 
          frais: result.data,
          filteredFrais: result.data,
          pagination: result.pagination || null,
          isLoading: false 
        });
      } else {
        throw new Error(result.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur searchFrais:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Chargement des statistiques
  loadFraisStats: async () => {
    try {
      const { frais } = get();
      
      // Calcul des statistiques côté client
      const stats: FraisStats = {
        total: frais.length,
        parCategorie: {},
        parTypeEtab: {},
        montantTotal: 0,
        montantMoyen: 0
      };

      frais.forEach(f => {
        // Statistiques par catégorie
        stats.parCategorie[f.categorie] = (stats.parCategorie[f.categorie] || 0) + 1;
        
        // Statistiques par type d'établissement
        f.etabs.forEach(etab => {
          stats.parTypeEtab[etab] = (stats.parTypeEtab[etab] || 0) + 1;
        });
        
        // Montant total
        stats.montantTotal += f.montant;
      });

      // Montant moyen
      stats.montantMoyen = stats.total > 0 ? stats.montantTotal / stats.total : 0;

      set({ stats });
    } catch (error) {
      console.error('Erreur loadFraisStats:', error);
      set({ error: 'Erreur lors du calcul des statistiques' });
    }
  },

  // Ajout d'un nouveau frais
  addFrais: async (fraisData: FraisInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/frais`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(fraisData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisDetailResponse = await response.json();
      
      if (result.success) {
        const { frais } = get();
        const nouveauxFrais = [result.data, ...frais];
        set({ 
          frais: nouveauxFrais,
          filteredFrais: nouveauxFrais,
          isLoading: false 
        });
        
        // Recalculer les statistiques
        get().loadFraisStats();
        
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la création du frais');
      }
    } catch (error) {
      console.error('Erreur addFrais:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
      return null;
    }
  },

  // Mise à jour d'un frais
  updateFrais: async (id: string, fraisData: FraisInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/frais/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fraisData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: FraisDetailResponse = await response.json();
      
      if (result.success) {
        const { frais } = get();
        const fraisMisAJour = frais.map(f => 
          f._id === id ? result.data : f
        );
        
        set({ 
          frais: fraisMisAJour,
          filteredFrais: fraisMisAJour,
          currentFrais: result.data,
          isLoading: false 
        });
        
        // Recalculer les statistiques
        get().loadFraisStats();
        
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la mise à jour du frais');
      }
    } catch (error) {
      console.error('Erreur updateFrais:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
      return null;
    }
  },

  // Suppression d'un frais
  deleteFrais: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/frais/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const { frais } = get();
        const fraisRestants = frais.filter(f => f._id !== id);
        
        set({ 
          frais: fraisRestants,
          filteredFrais: fraisRestants,
          currentFrais: null,
          isLoading: false 
        });
        
        // Recalculer les statistiques
        get().loadFraisStats();
        
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression du frais');
      }
    } catch (error) {
      console.error('Erreur deleteFrais:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
      return false;
    }
  },

  // Application des filtres locaux
  applyFilters: (filters: FraisFilters) => {
    const { frais } = get();
    let filtered = [...frais];

    // Filtrage par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(f => 
        f.designation.toLowerCase().includes(searchLower) ||
        f.categorie.toLowerCase().includes(searchLower) ||
        f.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par catégorie
    if (filters.categorie) {
      filtered = filtered.filter(f => 
        f.categorie.toLowerCase().includes(filters.categorie!.toLowerCase())
      );
    }

    // Filtrage par type d'établissement
    if (filters.typeEtab) {
      filtered = filtered.filter(f => 
        f.etabs.includes(filters.typeEtab!)
      );
    }

    // Filtrage par montant minimum
    if (filters.montantMin !== undefined) {
      filtered = filtered.filter(f => f.montant >= filters.montantMin!);
    }

    // Filtrage par montant maximum
    if (filters.montantMax !== undefined) {
      filtered = filtered.filter(f => f.montant <= filters.montantMax!);
    }

    set({ filteredFrais: filtered, filters });
  },

  // Définition des filtres
  setFilters: (newFilters: Partial<FraisFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    get().applyFilters(updatedFilters);
  },

  // Effacement des filtres
  clearFilters: () => {
    const { frais } = get();
    set({ 
      filters: {},
      filteredFrais: frais 
    });
  },

  // Définition du frais courant
  setCurrentFrais: (frais: Frais | null) => {
    set({ currentFrais: frais });
  },

  // Effacement des erreurs
  clearError: () => {
    set({ error: null });
  },

  // Réinitialisation du store
  reset: () => {
    set({
      frais: [],
      filteredFrais: [],
      currentFrais: null,
      stats: null,
      filters: {},
      pagination: null,
      isLoading: false,
      error: null
    });
  }
}));

// Hooks personnalisés pour faciliter l'utilisation
export const useFrais = () => {
  const frais = useFraisStore(state => state.filteredFrais);
  const isLoading = useFraisStore(state => state.isLoading);
  const error = useFraisStore(state => state.error);
  const pagination = useFraisStore(state => state.pagination);
  const loadFrais = useFraisStore(state => state.loadFrais);
  
  return { frais, isLoading, error, pagination, loadFrais };
};

export const useFraisActions = () => {
  const addFrais = useFraisStore(state => state.addFrais);
  const updateFrais = useFraisStore(state => state.updateFrais);
  const deleteFrais = useFraisStore(state => state.deleteFrais);
  const searchFrais = useFraisStore(state => state.searchFrais);
  
  return { addFrais, updateFrais, deleteFrais, searchFrais };
};

export const useFraisFilters = () => {
  const filters = useFraisStore(state => state.filters);
  const setFilters = useFraisStore(state => state.setFilters);
  const clearFilters = useFraisStore(state => state.clearFilters);
  const applyFilters = useFraisStore(state => state.applyFilters);
  
  return { filters, setFilters, clearFilters, applyFilters };
};

export const useFraisStats = () => {
  const stats = useFraisStore(state => state.stats);
  const loadFraisStats = useFraisStore(state => state.loadFraisStats);
  
  return { stats, loadFraisStats };
};