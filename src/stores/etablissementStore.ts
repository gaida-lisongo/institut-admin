import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Etablissement, EtablissementFormData } from '@/types/etablissement';

// Types pour les réponses API
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface EtablissementStats {
    total: number;
    public: number;
    privee: number;
    parProvince: Record<string, number>;
}

interface EtablissementStore {
    // État
    etablissements: Etablissement[];
    selectedEtablissement: Etablissement | null;
    isLoading: boolean;
    error: string | null;
    searchTerm: string;
    filterCategorie: 'all' | 'public' | 'prive';
    filterProvince: string | null;

    // Actions CRUD
    fetchEtablissements: () => Promise<void>;
    fetchEtablissementById: (id: string) => Promise<Etablissement | null>;
    createEtablissement: (data: EtablissementFormData) => Promise<Etablissement | null>;
    updateEtablissement: (id: string, data: Partial<EtablissementFormData>) => Promise<Etablissement | null>;
    deleteEtablissement: (id: string) => Promise<boolean>;

    // Actions locales
    setSelectedEtablissement: (etablissement: Etablissement | null) => void;
    setSearchTerm: (term: string) => void;
    setFilterCategorie: (categorie: 'all' | 'public' | 'prive') => void;
    setFilterProvince: (provinceId: string | null) => void;
    clearError: () => void;
    clearFilters: () => void;

    // Actions utilitaires
    addEtablissementLocal: (etablissement: Etablissement) => void;
    updateEtablissementLocal: (id: string, updates: Partial<Etablissement>) => void;
    removeEtablissementLocal: (id: string) => void;

    // Getters
    getFilteredEtablissements: () => Etablissement[];
    getEtablissementStats: () => EtablissementStats;
    getEtablissementsByProvince: (provinceId: string) => Etablissement[];
    getEtablissementsByCategorie: (categorie: 'public' | 'privee') => Etablissement[];
}

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:3001/api';

const buildApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

export const useEtablissementStore = create<EtablissementStore>()(
    persist(
        (set, get) => ({
            // État initial
            etablissements: [],
            selectedEtablissement: null,
            isLoading: false,
            error: null,
            searchTerm: '',
            filterCategorie: 'all',
            filterProvince: null,

            // Actions CRUD
            fetchEtablissements: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl('/etablissements'), {
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement[]> = await response.json();
                    
                    if (result.success) {
                        set({ etablissements: result.data, isLoading: false });
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des établissements';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur fetchEtablissements:', error);
                }
            },

            fetchEtablissementById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${id}`), {
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success) {
                        set({ selectedEtablissement: result.data, isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement de l\'établissement';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur fetchEtablissementById:', error);
                    return null;
                }
            },

            createEtablissement: async (data: EtablissementFormData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl('/etablissements'), {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success) {
                        const { addEtablissementLocal } = get();
                        addEtablissementLocal(result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de l\'établissement';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur createEtablissement:', error);
                    return null;
                }
            },

            updateEtablissement: async (id: string, data: Partial<EtablissementFormData>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${id}`), {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(id, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'établissement';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur updateEtablissement:', error);
                    return null;
                }
            },

            deleteEtablissement: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${id}`), {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<{ deleted: boolean }> = await response.json();
                    
                    if (result.success && result.data.deleted) {
                        const { removeEtablissementLocal } = get();
                        removeEtablissementLocal(id);
                        set({ isLoading: false });
                        return true;
                    } else {
                        throw new Error(result.message || 'Erreur lors de la suppression');
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'établissement';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur deleteEtablissement:', error);
                    return false;
                }
            },

            // Actions locales
            setSelectedEtablissement: (etablissement) => {
                set({ selectedEtablissement: etablissement });
            },

            setSearchTerm: (term) => {
                set({ searchTerm: term });
            },

            setFilterCategorie: (categorie) => {
                set({ filterCategorie: categorie });
            },

            setFilterProvince: (provinceId) => {
                set({ filterProvince: provinceId });
            },

            clearError: () => {
                set({ error: null });
            },

            clearFilters: () => {
                set({ 
                    searchTerm: '', 
                    filterCategorie: 'all', 
                    filterProvince: null 
                });
            },

            // Actions utilitaires
            addEtablissementLocal: (etablissement) => {
                set((state) => ({
                    etablissements: [...state.etablissements, etablissement]
                }));
            },

            updateEtablissementLocal: (id, updates) => {
                set((state) => ({
                    etablissements: state.etablissements.map(etablissement =>
                        etablissement._id === id ? { ...etablissement, ...updates } : etablissement
                    ),
                    selectedEtablissement: state.selectedEtablissement?._id === id 
                        ? { ...state.selectedEtablissement, ...updates }
                        : state.selectedEtablissement
                }));
            },

            removeEtablissementLocal: (id) => {
                set((state) => ({
                    etablissements: state.etablissements.filter(etablissement => etablissement._id !== id),
                    selectedEtablissement: state.selectedEtablissement?._id === id ? null : state.selectedEtablissement
                }));
            },

            // Getters
            getFilteredEtablissements: () => {
                const { etablissements, searchTerm, filterCategorie, filterProvince } = get();
                
                return etablissements.filter(etablissement => {
                    // Filtre par terme de recherche
                    const matchesSearch = !searchTerm || 
                        etablissement.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        etablissement.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        etablissement.description.toLowerCase().includes(searchTerm.toLowerCase());

                    // Filtre par catégorie
                    const matchesCategorie = filterCategorie === 'all' || etablissement.categorie === filterCategorie;

                    // Filtre par province
                    const matchesProvince = !filterProvince || etablissement.provinceId === filterProvince;

                    return matchesSearch && matchesCategorie && matchesProvince;
                });
            },

            getEtablissementStats: () => {
                const { etablissements } = get();
                
                const stats: EtablissementStats = {
                    total: etablissements.length,
                    public: etablissements.filter(e => e.categorie === 'public').length,
                    privee: etablissements.filter(e => e.categorie === 'privee').length,
                    parProvince: {}
                };

                // Compter par province
                etablissements.forEach(etablissement => {
                    const provinceId = etablissement.provinceId;
                    stats.parProvince[provinceId] = (stats.parProvince[provinceId] || 0) + 1;
                });

                return stats;
            },

            getEtablissementsByProvince: (provinceId) => {
                const { etablissements } = get();
                return etablissements.filter(etablissement => etablissement.provinceId === provinceId);
            },

            getEtablissementsByCategorie: (categorie) => {
                const { etablissements } = get();
                return etablissements.filter(etablissement => etablissement.categorie === categorie);
            }
        }),
        {
            name: 'etablissement-store',
            partialize: (state) => ({
                etablissements: state.etablissements,
                selectedEtablissement: state.selectedEtablissement
            })
        }
    )
);

// Hooks personnalisés pour faciliter l'utilisation
export const useEtablissements = () => {
    const store = useEtablissementStore();
    return {
        etablissements: store.getFilteredEtablissements(),
        isLoading: store.isLoading,
        error: store.error,
        fetchEtablissements: store.fetchEtablissements,
        createEtablissement: store.createEtablissement,
        updateEtablissement: store.updateEtablissement,
        deleteEtablissement: store.deleteEtablissement
    };
};

export const useEtablissementFilters = () => {
    const store = useEtablissementStore();
    return {
        searchTerm: store.searchTerm,
        filterCategorie: store.filterCategorie,
        filterProvince: store.filterProvince,
        setSearchTerm: store.setSearchTerm,
        setFilterCategorie: store.setFilterCategorie,
        setFilterProvince: store.setFilterProvince,
        clearFilters: store.clearFilters
    };
};

export const useEtablissementStats = () => {
    const store = useEtablissementStore();
    return {
        stats: store.getEtablissementStats(),
        getByProvince: store.getEtablissementsByProvince,
        getByCategorie: store.getEtablissementsByCategorie
    };
};

export const useSelectedEtablissement = () => {
    const store = useEtablissementStore();
    return {
        selectedEtablissement: store.selectedEtablissement,
        setSelectedEtablissement: store.setSelectedEtablissement,
        fetchEtablissementById: store.fetchEtablissementById
    };
};
