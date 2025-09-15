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

  clearError: () => set({ error: null }),
  clearCurrentCycle: () => set({ currentCycle: null }),
}));