import { create } from "zustand";
import AnneeService, { Annee, Article } from "../services/AnneeService";

interface AnneeState {
  annees: Annee[];
  selectedAnnee: Annee | null;
  isLoading: boolean;
  error: string | null;
  fetchAnnees: () => Promise<void>;
  fetchAnnee: (id: string) => Promise<void>;
  createAnnee: (data: Partial<Annee>) => Promise<boolean>;
  updateAnnee: (id: string, data: Partial<Annee>) => Promise<boolean>;
  deleteAnnee: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAnneeStore = create<AnneeState>((set) => ({
  annees: [],
  selectedAnnee: null,
  isLoading: false,
  error: null,

  fetchAnnees: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await AnneeService.getAnnees();
      set({ annees: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAnnee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AnneeService.getAnnee(id);
      set({ selectedAnnee: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createAnnee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await AnneeService.createAnnee(data);
      await useAnneeStore.getState().fetchAnnees();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateAnnee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await AnneeService.updateAnnee(id, data);
      await useAnneeStore.getState().fetchAnnees();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteAnnee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await AnneeService.deleteAnnee(id);
      await useAnneeStore.getState().fetchAnnees();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
