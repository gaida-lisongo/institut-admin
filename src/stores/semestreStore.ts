import { create } from 'zustand';
import semestreService, { Semestre, SemestreFormData, SemestreWithUnites } from '@/services/SemestreService';

interface SemestreState {
  semestres: Semestre[];
  currentSemestre: SemestreWithUnites | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSemestres: () => Promise<void>;
  fetchSemestre: (id: string) => Promise<void>;
  createSemestre: (data: SemestreFormData) => Promise<Semestre>;
  updateSemestre: (id: string, data: Partial<SemestreFormData>) => Promise<void>;
  deleteSemestre: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentSemestre: () => void;
}

const useSemestreStore = create<SemestreState>((set, get) => ({
  semestres: [],
  currentSemestre: null,
  loading: false,
  error: null,

  fetchSemestres: async () => {
    set({ loading: true, error: null });
    try {
      const semestres = await semestreService.getSemestres();
      set({ semestres, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des semestres',
        loading: false 
      });
    }
  },

  fetchSemestre: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const semestre = await semestreService.getSemestre(id);
      set({ currentSemestre: semestre, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du semestre',
        loading: false 
      });
    }
  },

  createSemestre: async (data: SemestreFormData) => {
    set({ loading: true, error: null });
    try {
      const newSemestre = await semestreService.createSemestre(data);
      set(state => ({ 
        semestres: [...state.semestres, newSemestre],
        loading: false 
      }));
      return newSemestre;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création du semestre',
        loading: false 
      });
      throw error;
    }
  },

  updateSemestre: async (id: string, data: Partial<SemestreFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedSemestre = await semestreService.updateSemestre(id, data);
      set(state => ({
        semestres: state.semestres.map(s => s._id === id ? updatedSemestre : s),
        currentSemestre: state.currentSemestre?._id === id 
          ? { ...state.currentSemestre, ...updatedSemestre, unites: state.currentSemestre.unites }
          : state.currentSemestre,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du semestre',
        loading: false 
      });
      throw error;
    }
  },

  deleteSemestre: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await semestreService.deleteSemestre(id);
      set(state => ({
        semestres: state.semestres.filter(s => s._id !== id),
        currentSemestre: state.currentSemestre?._id === id ? null : state.currentSemestre,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du semestre',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentSemestre: () => set({ currentSemestre: null })
}));

export default useSemestreStore;