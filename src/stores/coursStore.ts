import { create } from 'zustand';
import { Cours, CoursFormData } from '@/services/CoursService';
import CoursService from '@/services/CoursService';

interface CoursState {
  cours: Cours[];
  currentCours: Cours | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCours: () => Promise<void>;
  loadCours: () => Promise<void>; // Alias pour compatibilité
  fetchCoursById: (id: string) => Promise<void>;
  createCours: (data: CoursFormData) => Promise<Cours>;
  updateCours: (id: string, data: Partial<CoursFormData>) => Promise<void>;
  deleteCours: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentCours: () => void;
}

export const useCoursStore = create<CoursState>((set, get) => ({
  cours: [],
  currentCours: null,
  loading: false,
  error: null,

  fetchCours: async () => {
    set({ loading: true, error: null });
    try {
      const cours = await CoursService.getCoursList();
      set({ cours, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  // Alias pour compatibilité
  loadCours: async () => {
    const { fetchCours } = get();
    await fetchCours();
  },

  fetchCoursById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const cours = await CoursService.getCours(id);
      set({ currentCours: cours, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  createCours: async (data: CoursFormData) => {
    set({ loading: true, error: null });
    try {
      const newCours = await CoursService.createCours(data);
      set(state => ({ 
        cours: [...state.cours, newCours], 
        loading: false 
      }));

      return newCours;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
      throw error;
    }
  },

  updateCours: async (id: string, data: Partial<CoursFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedCours = await CoursService.updateCours(id, data);
      set(state => ({
        cours: state.cours.map(cours => 
          cours._id === id ? updatedCours : cours
        ),
        currentCours: state.currentCours?._id === id ? updatedCours : state.currentCours,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
      throw error;
    }
  },

  deleteCours: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await CoursService.deleteCours(id);
      set(state => ({
        cours: state.cours.filter(cours => cours._id !== id),
        currentCours: state.currentCours?._id === id ? null : state.currentCours,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  clearCurrentCours: () => set({ currentCours: null })
}));