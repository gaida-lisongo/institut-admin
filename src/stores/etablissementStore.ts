import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
    Etablissement, 
    EtablissementFormData, 
    FaculteFormData, 
    PatrimoineFormData, 
    AdministratifFormData,
    Faculte,
    Patrimoine,
    Administratif
} from '@/types/etablissement';

// Types pour les réponses API
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface EtablissementStats {
    total: number;
    public: number;
    prive: number;
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

    // Actions CRUD Etablissement
    fetchEtablissements: () => Promise<void>;
    fetchEtablissementById: (id: string) => Promise<Etablissement | null>;
    createEtablissement: (data: EtablissementFormData) => Promise<Etablissement | null>;
    updateEtablissement: (id: string, data: Partial<EtablissementFormData>) => Promise<Etablissement | null>;
    deleteEtablissement: (id: string) => Promise<boolean>;

    // Actions CRUD Facultés
    updateFacultes: (etabId: string, facultes: FaculteFormData[]) => Promise<Etablissement | null>;
    saveFaculte: (etabId: string, faculte: FaculteFormData & { _id?: string }) => Promise<Etablissement | null>;
    deleteFaculte: (etabId: string, faculteId: string) => Promise<Etablissement | null>;
    
    // Actions CRUD Patrimoines
    updatePatrimoines: (etabId: string, patrimoines: PatrimoineFormData[]) => Promise<Etablissement | null>;
    
    // Actions CRUD Administratifs
    updateAdministratifs: (etabId: string, administratifs: AdministratifFormData[]) => Promise<Etablissement | null>;

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
    getEtablissementsByCategorie: (categorie: 'public' | 'prive') => Etablissement[];
}

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:4003/api/v1';

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
                    prive: etablissements.filter(e => e.categorie === 'prive').length,
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
            },

            // Actions CRUD Facultés
            updateFacultes: async (etabId: string, facultes: FaculteFormData[]) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${etabId}/faculte`), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeaders()
                        },
                        body: JSON.stringify(facultes)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success && result.data) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(etabId, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des facultés';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur updateFacultes:', error);
                    return null;
                }
            },

            // Sauvegarder une seule faculté (création ou modification)
            saveFaculte: async (etabId: string, faculte: FaculteFormData & { _id?: string }) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${etabId}/faculte`), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeaders()
                        },
                        body: JSON.stringify(faculte)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success && result.data) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(etabId, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de la faculté';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur saveFaculte:', error);
                    return null;
                }
            },

            // Supprimer une faculté
            deleteFaculte: async (etabId: string, faculteId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${etabId}/faculte/${faculteId}`), {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success && result.data) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(etabId, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de la faculté';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur deleteFaculte:', error);
                    return null;
                }
            },

            // Actions CRUD Patrimoines
            updatePatrimoines: async (etabId: string, patrimoines: PatrimoineFormData[]) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${etabId}/patrimoine`), {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(patrimoines)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(etabId, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du patrimoine';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur updatePatrimoines:', error);
                    return null;
                }
            },

            // Actions CRUD Administratifs
            updateAdministratifs: async (etabId: string, administratifs: AdministratifFormData[]) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(buildApiUrl(`/etablissements/${etabId}/administratif`), {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(administratifs)
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                    }

                    const result: ApiResponse<Etablissement> = await response.json();
                    
                    if (result.success) {
                        const { updateEtablissementLocal } = get();
                        updateEtablissementLocal(etabId, result.data);
                        set({ isLoading: false });
                        return result.data;
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des administratifs';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Erreur updateAdministratifs:', error);
                    return null;
                }
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
        deleteEtablissement: store.deleteEtablissement,
        // Nouvelles actions
        updateFacultes: store.updateFacultes,
        updatePatrimoines: store.updatePatrimoines,
        updateAdministratifs: store.updateAdministratifs
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
        fetchEtablissementById: store.fetchEtablissementById,
        // Actions spécialisées pour l'établissement sélectionné
        updateFacultes: (facultes: FaculteFormData[]) => 
            store.selectedEtablissement?._id ? store.updateFacultes(store.selectedEtablissement._id, facultes) : Promise.resolve(null),
        saveFaculte: (faculte: FaculteFormData & { _id?: string }) => 
            store.selectedEtablissement?._id ? store.saveFaculte(store.selectedEtablissement._id, faculte) : Promise.resolve(null),
        deleteFaculte: (faculteId: string) => 
            store.selectedEtablissement?._id ? store.deleteFaculte(store.selectedEtablissement._id, faculteId) : Promise.resolve(null),
        updatePatrimoines: (patrimoines: PatrimoineFormData[]) => 
            store.selectedEtablissement?._id ? store.updatePatrimoines(store.selectedEtablissement._id, patrimoines) : Promise.resolve(null),
        updateAdministratifs: (administratifs: AdministratifFormData[]) => 
            store.selectedEtablissement?._id ? store.updateAdministratifs(store.selectedEtablissement._id, administratifs) : Promise.resolve(null)
    };
};

// Hooks spécialisés pour les nouvelles fonctionnalités
export const useFaculteActions = () => {
    const store = useEtablissementStore();
    return {
        updateFacultes: store.updateFacultes,
        saveFaculte: store.saveFaculte,
        deleteFaculte: store.deleteFaculte,
        isLoading: store.isLoading,
        error: store.error,
        clearError: store.clearError
    };
};

export const usePatrimoineActions = () => {
    const store = useEtablissementStore();
    return {
        updatePatrimoines: store.updatePatrimoines,
        isLoading: store.isLoading,
        error: store.error,
        clearError: store.clearError
    };
};

export const useAdministratifActions = () => {
    const store = useEtablissementStore();
    return {
        updateAdministratifs: store.updateAdministratifs,
        isLoading: store.isLoading,
        error: store.error,
        clearError: store.clearError
    };
};
