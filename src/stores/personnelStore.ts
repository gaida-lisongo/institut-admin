import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Personnel } from '@/types/personnel';
import { fakePersonnelData, generatePersonnelStats } from '@/data/personnelData';

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
  loadPersonnels: () => void;
  getPersonnelsByType: (type: 'Académique' | 'Scientifique' | 'Administratif') => Personnel[];
  getPersonnelsByProvince: (provinceId: string) => Personnel[];
  addPersonnel: (personnel: CreatePersonnelData) => void;
  updatePersonnel: (id: string, personnel: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  setFilters: (filters: Partial<PersonnelFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  searchPersonnels: (query: string) => void;
  
  // Getters
  getPersonnelById: (id: string) => Personnel | undefined;
  getPersonnelStats: () => PersonnelStats;
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
          const response = await fetch(`${API_URL}/users`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.message || 'Erreur lors du chargement des personnels');
          }

          if (result.success) {
            const stats = generatePersonnelStats(result.data);
            set({
              personnels: result.data,
              filteredPersonnels: result.data,
              stats,
              isLoading: false
            });
          } else {
            throw new Error(result.message || 'Erreur lors du chargement des personnels');
          }
        } catch (error) {
          set({ 
            error: 'Erreur lors du chargement des personnels', 
            isLoading: false 
          });
        }
      },

      getPersonnelsByType: (type) => {
        const { personnels } = get();
        return personnels.filter(p => p.type === type);
      },

      getPersonnelsByProvince: (provinceId) => {
        const { personnels } = get();
        return personnels.filter(p => p.provinceId === provinceId);
      },

      addPersonnel: (personnelData) => {
        const { personnels } = get();
        const newPersonnel: Personnel = {
          ...personnelData,
          _id: `new_${Date.now()}`,
          statut: 'Actif',
          diplomes: [],
          experiences: [],
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updatedPersonnels = [...personnels, newPersonnel];
        const stats = generatePersonnelStats(updatedPersonnels);
        
        set({
          personnels: updatedPersonnels,
          stats
        });
        
        // Réappliquer les filtres
        get().applyFilters();
      },

      updatePersonnel: (id, updates) => {
        const { personnels } = get();
        const updatedPersonnels = personnels.map(p =>
          p._id === id 
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        );
        
        const stats = generatePersonnelStats(updatedPersonnels);
        
        set({
          personnels: updatedPersonnels,
          stats
        });
        
        // Réappliquer les filtres
        get().applyFilters();
      },

      deletePersonnel: (id) => {
        const { personnels } = get();
        const updatedPersonnels = personnels.filter(p => p._id !== id);
        const stats = generatePersonnelStats(updatedPersonnels);
        
        set({
          personnels: updatedPersonnels,
          stats
        });
        
        // Réappliquer les filtres
        get().applyFilters();
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

        // Filtrer par type
        if (filters.type) {
          filtered = filtered.filter(p => p.type === filters.type);
        }

        // Filtrer par statut
        if (filters.statut) {
          filtered = filtered.filter(p => p.statut === filters.statut);
        }

        // Filtrer par province
        if (filters.provinceId) {
          filtered = filtered.filter(p => p.provinceId === filters.provinceId);
        }

        // Recherche textuelle
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.nom.toLowerCase().includes(searchLower) ||
            p.prenom.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            p.telephone.includes(filters.search!) ||
            (p.grade && p.grade.toLowerCase().includes(searchLower))
          );
        }

        // Filtrer par âge
        if (filters.ageMin || filters.ageMax) {
          filtered = filtered.filter(p => {
            const age = new Date().getFullYear() - new Date(p.dateNaissance).getFullYear();
            const minAge = filters.ageMin || 0;
            const maxAge = filters.ageMax || 100;
            return age >= minAge && age <= maxAge;
          });
        }

        // Filtrer par salaire
        if (filters.salaireMin || filters.salaireMax) {
          filtered = filtered.filter(p => {
            const minSalaire = filters.salaireMin || 0;
            const maxSalaire = filters.salaireMax || Infinity;
            return p.salaire >= minSalaire && p.salaire <= maxSalaire;
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

      getPersonnelStats: async () => {
        try {
          const requet = await fetch(`${API_URL}/users/stats/overview`);
          
        } catch (error) {
          
        }
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
    getPersonnelStats: store.getPersonnelStats
  };
};

export const usePersonnelsByType = (type: 'Académique' | 'Scientifique' | 'Administratif') => {
  const store = usePersonnelStore();
  return {
    personnels: store.getPersonnelsByType(type),
    count: store.getPersonnelsByType(type).length
  };
};

export const usePersonnelsByProvince = (provinceId: string) => {
  const store = usePersonnelStore();
  return {
    personnels: store.getPersonnelsByProvince(provinceId),
    count: store.getPersonnelsByProvince(provinceId).length
  };
};
