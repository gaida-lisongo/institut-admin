import { create } from 'zustand';
import { Cycle, CycleFormData } from '@/services/CycleService';
import CycleService from '@/services/CycleService';

interface CycleState {
  cycles: Cycle[];
  currentCycle: Cycle | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCycles: () => Promise<void>;
  fetchCyclesBySection: (sectionId: string) => Promise<void>;
  fetchCycle: (id: string) => Promise<void>;
  createCycle: (data: CycleFormData) => Promise<void>;
  updateCycle: (id: string, data: Partial<CycleFormData>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  addSemestreToClasse: (cycleId: string, classeIndex: number, semestreId: string) => Promise<void>;
  removeSemestreFromClasse: (cycleId: string, classeIndex: number, semestreId: string) => Promise<void>;
  // Mise à jour optimiste
  updateCycleOptimistic: (cycleId: string, classeIndex: number, semestreId: string, action: 'add' | 'remove') => void;
  clearError: () => void;
  clearCurrentCycle: () => void;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  currentCycle: null,
  loading: false,
  error: null,

  fetchCycles: async () => {
    set({ loading: true, error: null });
    try {
      const cycles = await CycleService.getCycles();
      set({ cycles, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  fetchCyclesBySection: async (sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const cycles = await CycleService.getCyclesBySection(sectionId);
      set({ cycles, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  fetchCycle: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const cycle = await CycleService.getCycle(id);
      set({ currentCycle: cycle, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  createCycle: async (data: CycleFormData) => {
    set({ loading: true, error: null });
    try {
      const newCycle = await CycleService.createCycle(data);
      set(state => ({ 
        cycles: [...state.cycles, newCycle], 
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

  updateCycle: async (id: string, data: Partial<CycleFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedCycle = await CycleService.updateCycle(id, data);
      set(state => ({
        cycles: state.cycles.map(cycle => 
          cycle._id === id ? updatedCycle : cycle
        ),
        currentCycle: state.currentCycle?._id === id ? updatedCycle : state.currentCycle,
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

  deleteCycle: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await CycleService.deleteCycle(id);
      set(state => ({
        cycles: state.cycles.filter(cycle => cycle._id !== id),
        currentCycle: state.currentCycle?._id === id ? null : state.currentCycle,
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

  // Mise à jour optimiste pour un feedback immédiat
  updateCycleOptimistic: (cycleId: string, classeIndex: number, semestreId: string, action: 'add' | 'remove') => {
    set(state => ({
      cycles: state.cycles.map(cycle => {
        if (cycle._id === cycleId) {
          const updatedClasses = [...cycle.classes];
          if (updatedClasses[classeIndex]) {
            const currentSemestres = updatedClasses[classeIndex].semestres;
            updatedClasses[classeIndex] = {
              ...updatedClasses[classeIndex],
              semestres: action === 'add' 
                ? [...currentSemestres, semestreId]
                : currentSemestres.filter(id => id !== semestreId)
            };
          }
          return { ...cycle, classes: updatedClasses };
        }
        return cycle;
      })
    }));
  },

  addSemestreToClasse: async (cycleId: string, classeIndex: number, semestreId: string) => {
    // Mise à jour optimiste immédiate
    get().updateCycleOptimistic(cycleId, classeIndex, semestreId, 'add');
    
    try {
      const updatedCycle = await CycleService.addSemestreToClasse(cycleId, classeIndex, semestreId);
      // Mettre à jour avec la réponse du serveur
      set(state => ({
        cycles: state.cycles.map(cycle => 
          cycle._id === cycleId ? updatedCycle : cycle
        ),
        currentCycle: state.currentCycle?._id === cycleId ? updatedCycle : state.currentCycle,
      }));
    } catch (error) {
      // En cas d'erreur, revenir en arrière
      get().updateCycleOptimistic(cycleId, classeIndex, semestreId, 'remove');
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du semestre'
      });
      throw error;
    }
  },

  removeSemestreFromClasse: async (cycleId: string, classeIndex: number, semestreId: string) => {
    // Mise à jour optimiste immédiate
    get().updateCycleOptimistic(cycleId, classeIndex, semestreId, 'remove');
    
    try {
      const updatedCycle = await CycleService.removeSemestreFromClasse(cycleId, classeIndex, semestreId);
      // Mettre à jour avec la réponse du serveur
      set(state => ({
        cycles: state.cycles.map(cycle => 
          cycle._id === cycleId ? updatedCycle : cycle
        ),
        currentCycle: state.currentCycle?._id === cycleId ? updatedCycle : state.currentCycle,
      }));
    } catch (error) {
      // En cas d'erreur, revenir en arrière
      get().updateCycleOptimistic(cycleId, classeIndex, semestreId, 'add');
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du semestre'
      });
      
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentCycle: () => set({ currentCycle: null }),
}));