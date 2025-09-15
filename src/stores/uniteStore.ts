import { create } from 'zustand';
import { Unite, UniteFormData } from '@/services/UniteService';
import UniteService from '@/services/UniteService';

interface UniteState {
  unites: Unite[];
  currentUnite: Unite | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchUnites: () => Promise<void>;
  loadUnites: () => Promise<void>; // Alias pour compatibilité
  fetchUnite: (id: string) => Promise<void>;
  createUnite: (data: UniteFormData) => Promise<void>;
  updateUnite: (id: string, data: Partial<UniteFormData>) => Promise<void>;
  deleteUnite: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentUnite: () => void;
}

export const useUniteStore = create<UniteState>((set, get) => ({
  unites: [],
  currentUnite: null,
  loading: false,
  error: null,

  fetchUnites: async () => {
    set({ loading: true, error: null });
    try {
      const unites = await UniteService.getUnites();
      set({ unites, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  // Alias pour compatibilité
  loadUnites: async () => {
    const { fetchUnites } = get();
    await fetchUnites();
  },

  fetchUnite: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const unite = await UniteService.getUnite(id);
      set({ currentUnite: unite, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  createUnite: async (data: UniteFormData) => {
    set({ loading: true, error: null });
    try {
      const newUnite = await UniteService.createUnite(data);
      set(state => ({ 
        unites: [...state.unites, newUnite], 
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

  updateUnite: async (id: string, data: Partial<UniteFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedUnite = await UniteService.updateUnite(id, data);
      set(state => ({
        unites: state.unites.map(unite => 
          unite._id === id ? updatedUnite : unite
        ),
        currentUnite: state.currentUnite?._id === id ? updatedUnite : state.currentUnite,
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

  deleteUnite: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await UniteService.deleteUnite(id);
      set(state => ({
        unites: state.unites.filter(unite => unite._id !== id),
        currentUnite: state.currentUnite?._id === id ? null : state.currentUnite,
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
  
  clearCurrentUnite: () => set({ currentUnite: null })
}));