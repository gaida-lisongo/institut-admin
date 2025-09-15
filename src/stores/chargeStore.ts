import { create } from 'zustand';
import { Charge, ChargeWithDetails, ChargeFormData } from '@/services/ChargeService';
import ChargeService from '@/services/ChargeService';

interface ChargeState {
  charges: ChargeWithDetails[];
  currentAnneeCharges: ChargeWithDetails[]; // Pour l'année courante
  currentCharge: ChargeWithDetails | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCharges: () => Promise<void>;
  fetchChargeById: (id: string) => Promise<void>;
  fetchChargesByAnnee: (anneeId: string) => Promise<void>;
  createCharge: (data: ChargeFormData) => Promise<void>;
  updateCharge: (id: string, data: Partial<ChargeFormData>) => Promise<void>;
  deleteCharge: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentCharge: () => void;
}

export const useChargeStore = create<ChargeState>((set, get) => ({
  charges: [],
  currentAnneeCharges: [],
  currentCharge: null,
  loading: false,
  error: null,

  fetchCharges: async () => {
    set({ loading: true, error: null });
    try {
      const charges = await ChargeService.getCharges();
      set({ charges, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des charges horaires', 
        loading: false 
      });
    }
  },

  fetchChargeById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const charge = await ChargeService.getCharge(id);
      set({ currentCharge: charge, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement de la charge horaire', 
        loading: false 
      });
    }
  },

  fetchChargesByAnnee: async (anneeId: string) => {
    set({ loading: true, error: null });
    try {
      const charges = await ChargeService.getChargesByAnnee(anneeId);
      set({ currentAnneeCharges: charges, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des charges de l\'année', 
        loading: false 
      });
    }
  },

  createCharge: async (data: ChargeFormData) => {
    set({ loading: true, error: null });
    try {
      const newCharge = await ChargeService.createCharge(data);
      
      // Le serveur retourne juste l'objet basique, on l'ajoute tel quel
      const { currentAnneeCharges } = get();
      set({ 
        currentAnneeCharges: [...currentAnneeCharges, newCharge as ChargeWithDetails], 
        loading: false 
      });
      
      // Recharger pour avoir les détails complets
      if (data.anneeId) {
        get().fetchChargesByAnnee(data.anneeId);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la charge horaire', 
        loading: false 
      });
      throw error;
    }
  },

  updateCharge: async (id: string, data: Partial<ChargeFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedCharge = await ChargeService.updateCharge(id, data);
      const { currentAnneeCharges } = get();
      set({ 
        currentAnneeCharges: currentAnneeCharges.map(charge => 
          charge._id === id ? updatedCharge : charge
        ),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la charge horaire', 
        loading: false 
      });
      throw error;
    }
  },

  deleteCharge: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await ChargeService.deleteCharge(id);
      const { currentAnneeCharges } = get();
      set({ 
        currentAnneeCharges: currentAnneeCharges.filter(charge => charge._id !== id),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la charge horaire', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentCharge: () => {
    set({ currentCharge: null });
  },
}));