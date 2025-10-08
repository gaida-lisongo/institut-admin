import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Personnel, 
  PersonnelStats, 
  PersonnelFilters, 
  CreatePersonnelData, 
  UpdatePersonnelData,
  PersonnelApiResponse,
  PersonnelStatsApiResponse
} from '@/types/personnel';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
interface PersonnelStore {
  // État
  personnels: Personnel[];
  stats: PersonnelStats | null;
  filteredPersonnels: Personnel[];
  filters: PersonnelFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPersonnels: () => Promise<void>;
  loadPersonnelStats: () => Promise<void>;
  getPersonnelsByCategorie: (categorie: Personnel['categorie']) => Personnel[];
  getPersonnelsByProvince: (provinceId: string) => Personnel[];
  addPersonnel: (personnel: CreatePersonnelData) => Promise<void>;
  updatePersonnel: (id: string, personnel: UpdatePersonnelData) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PersonnelFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  searchPersonnels: (query: string) => void;
  
  // Getters
  getPersonnelById: (id: string) => Personnel | undefined;
  getPersonnelByMatricule: (matricule: string) => Personnel | undefined;
}

export const usePersonnelStore = create<PersonnelStore>()(
  persist(
    (set, get) => ({
      // État initial
      personnels: [],
      stats: null,
      filteredPersonnels: [],
      filters: {},
      isLoading: false,
      error: null,

      // Actions
      loadPersonnels: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/users`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result: PersonnelApiResponse = await response.json();
          
          if (result.success && Array.isArray(result.data)) {
            // Traitement des données pour ajouter les champs calculés
            const processedPersonnels = result.data.map((personnel: Personnel) => ({
              ...personnel,
              nomComplet: `${personnel.nom} ${personnel.post_nom} ${personnel.prenom}`,
              age: personnel.date_naissance ? 
                new Date().getFullYear() - new Date(personnel.date_naissance).getFullYear() : undefined
            }));
            
            set({
              personnels: processedPersonnels,
              filteredPersonnels: processedPersonnels,
              isLoading: false
            });
          } else {
            throw new Error(result.message || 'Erreur lors du chargement des personnels');
          }
        } catch (error) {
          console.error('Erreur loadPersonnels:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des personnels', 
            isLoading: false 
          });
        }
      },

      loadPersonnelStats: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/users/stats/overview`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result: PersonnelStatsApiResponse = await response.json();
          
          if (result.success && result.data) {
            // Transformation des données API vers notre format PersonnelStats
            const stats: PersonnelStats = {
              total: result.data.totalUsers,
              parCategorie: {
                scientifique: result.data.usersByCategory.find(cat => cat._id === 'SCIENTIFIQUE')?.count || 0,
                administratif: result.data.usersByCategory.find(cat => cat._id === 'ADMINISTRATIF')?.count || 0,
                academique: result.data.usersByCategory.find(cat => cat._id === 'ACADEMIQUE')?.count || 0,
                ouvrier: result.data.usersByCategory.find(cat => cat._id === 'OUVRIER')?.count || 0,
              },
              parSexe: {
                M: 0, // À calculer côté client si nécessaire
                F: 0,
              },
              avecAutorisations: result.data.usersWithAutorisations,
              sansAutorisations: result.data.usersWithoutAutorisations,
              nouveaux: 0, // À calculer côté client
              actifs: result.data.totalUsers, // Supposons que tous sont actifs
            };
            
            set({ stats });
          }
        } catch (error) {
          console.error('Erreur loadPersonnelStats:', error);
          // Ne pas mettre d'erreur pour les stats, ce n'est pas critique
        }
      },

      getPersonnelsByCategorie: (categorie) => {
        const { personnels } = get();
        return personnels.filter(p => p.categorie === categorie);
      },

      getPersonnelsByProvince: (provinceId) => {
        const { personnels } = get();
        return personnels.filter(p => {
          if (typeof p.province === 'string') {
            return p.province === provinceId;
          }
          return p.province._id === provinceId;
        });
      },

      addPersonnel: async (personnelData) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(personnelData),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result: PersonnelApiResponse = await response.json();
          
          if (result.success && result.data && !Array.isArray(result.data)) {
            const { personnels } = get();
            const newPersonnel = {
              ...result.data,
              nomComplet: `${result.data.nom} ${result.data.post_nom} ${result.data.prenom}`,
              age: result.data.date_naissance ? 
                new Date().getFullYear() - new Date(result.data.date_naissance).getFullYear() : undefined
            };
            
            const updatedPersonnels = [...personnels, newPersonnel];
            
            set({
              personnels: updatedPersonnels,
              isLoading: false
            });
            
            // Réappliquer les filtres et recharger les stats
            get().applyFilters();
            get().loadPersonnelStats();
          } else {
            throw new Error(result.message || 'Erreur lors de la création du personnel');
          }
        } catch (error) {
          console.error('Erreur addPersonnel:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création du personnel', 
            isLoading: false 
          });
          throw error;
        }
      },

      updatePersonnel: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result: PersonnelApiResponse = await response.json();
          
          if (result.success && result.data && !Array.isArray(result.data)) {
            const { personnels } = get();
            const updatedPersonnel = {
              ...result.data,
              nomComplet: `${result.data.nom} ${result.data.post_nom} ${result.data.prenom}`,
              age: result.data.date_naissance ? 
                new Date().getFullYear() - new Date(result.data.date_naissance).getFullYear() : undefined
            };
            
            const updatedPersonnels = personnels.map(p =>
              p._id === id ? updatedPersonnel : p
            );
            
            set({
              personnels: updatedPersonnels,
              isLoading: false
            });
            
            // Réappliquer les filtres et recharger les stats
            get().applyFilters();
            get().loadPersonnelStats();
          } else {
            throw new Error(result.message || 'Erreur lors de la mise à jour du personnel');
          }
        } catch (error) {
          console.error('Erreur updatePersonnel:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du personnel', 
            isLoading: false 
          });
          throw error;
        }
      },

      deletePersonnel: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const result: PersonnelApiResponse = await response.json();
          
          if (result.success) {
            const { personnels } = get();
            const updatedPersonnels = personnels.filter(p => p._id !== id);
            
            set({
              personnels: updatedPersonnels,
              isLoading: false
            });
            
            // Réappliquer les filtres et recharger les stats
            get().applyFilters();
            get().loadPersonnelStats();
          } else {
            throw new Error(result.message || 'Erreur lors de la suppression du personnel');
          }
        } catch (error) {
          console.error('Erreur deletePersonnel:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression du personnel', 
            isLoading: false 
          });
          throw error;
        }
      },

      setFilters: (newFilters) => {
        const { filters } = get();
        const updatedFilters = { ...filters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      clearFilters: () => {
        set({ filters: {} });
        get().applyFilters();
      },

      applyFilters: () => {
        const { personnels, filters } = get();
        let filtered = [...personnels];

        // Filtrer par catégorie
        if (filters.categorie) {
          filtered = filtered.filter(p => p.categorie === filters.categorie);
        }

        // Filtrer par sexe
        if (filters.sexe) {
          filtered = filtered.filter(p => p.sexe === filters.sexe);
        }

        // Filtrer par province
        if (filters.province) {
          filtered = filtered.filter(p => {
            if (typeof p.province === 'string') {
              return p.province === filters.province;
            }
            return p.province._id === filters.province;
          });
        }

        // Filtrer par autorisation
        if (filters.hasAutorisation) {
          filtered = filtered.filter(p => 
            p.autorisations?.some(auth => 
              auth.type === filters.hasAutorisation && auth.action === true
            )
          );
        }

        // Recherche textuelle
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.nom.toLowerCase().includes(searchLower) ||
            p.post_nom.toLowerCase().includes(searchLower) ||
            p.prenom.toLowerCase().includes(searchLower) ||
            p.matricule.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            p.telephone.includes(filters.search!) ||
            (p.grade && p.grade.toLowerCase().includes(searchLower)) ||
            (p.nomComplet && p.nomComplet.toLowerCase().includes(searchLower))
          );
        }

        // Filtrer par âge
        if (filters.ageMin || filters.ageMax) {
          filtered = filtered.filter(p => {
            if (!p.date_naissance) return false;
            const age = new Date().getFullYear() - new Date(p.date_naissance).getFullYear();
            const minAge = filters.ageMin || 0;
            const maxAge = filters.ageMax || 100;
            return age >= minAge && age <= maxAge;
          });
        }

        set({ filteredPersonnels: filtered });
      },

      searchPersonnels: (query) => {
        get().setFilters({ search: query });
      },

      // Getters
      getPersonnelById: (id) => {
        const { personnels } = get();
        return personnels.find(p => p._id === id);
      },

      getPersonnelByMatricule: (matricule) => {
        const { personnels } = get();
        return personnels.find(p => p.matricule === matricule);
      }
    }),
    {
      name: 'personnel-store',
      partialize: (state) => ({
        personnels: state.personnels,
        filters: state.filters
      })
    }
  )
);

// Hooks personnalisés pour faciliter l'utilisation
export const usePersonnels = () => {
  const store = usePersonnelStore();
  return {
    personnels: store.filteredPersonnels,
    allPersonnels: store.personnels,
    isLoading: store.isLoading,
    error: store.error,
    loadPersonnels: store.loadPersonnels
  };
};

export const usePersonnelActions = () => {
  const store = usePersonnelStore();
  return {
    addPersonnel: store.addPersonnel,
    updatePersonnel: store.updatePersonnel,
    deletePersonnel: store.deletePersonnel,
    searchPersonnels: store.searchPersonnels
  };
};

export const usePersonnelFilters = () => {
  const store = usePersonnelStore();
  return {
    filters: store.filters,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    applyFilters: store.applyFilters
  };
};

export const usePersonnelStats = () => {
  const store = usePersonnelStore();
  return {
    stats: store.stats,
    loadPersonnelStats: store.loadPersonnelStats
  };
};

export const usePersonnelsByCategorie = (categorie: Personnel['categorie']) => {
  const store = usePersonnelStore();
  return {
    personnels: store.getPersonnelsByCategorie(categorie),
    count: store.getPersonnelsByCategorie(categorie).length
  };
};

export const usePersonnelsByProvince = (provinceId: string) => {
  const store = usePersonnelStore();
  return {
    personnels: store.getPersonnelsByProvince(provinceId),
    count: store.getPersonnelsByProvince(provinceId).length
  };
};
