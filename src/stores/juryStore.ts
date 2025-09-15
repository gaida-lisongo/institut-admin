import { create } from 'zustand';
import { Jury, JuryWithDetails, JuryFormData, JuryClasse, JuryClasseWithDetails, JuryClasseFormData } from '@/services/JuryService';
import JuryService from '@/services/JuryService';

interface JuryState {
  juries: JuryWithDetails[];
  currentJury: JuryWithDetails | null;
  juryClasses: JuryClasseWithDetails[];
  currentJuryClasse: JuryClasseWithDetails | null;
  loading: boolean;
  error: string | null;

  // Actions Jury
  fetchJuries: () => Promise<void>;
  fetchJuryById: (id: string) => Promise<void>;
  fetchJuriesByAnneeAndSection: (anneeId: string, sectionId: string) => Promise<void>;
  createJury: (data: JuryFormData) => Promise<void>;
  updateJury: (id: string, data: Partial<JuryFormData>) => Promise<void>;
  deleteJury: (id: string) => Promise<void>;

  // Actions JuryClasse
  fetchJuryClasses: () => Promise<void>;
  fetchJuryClasseById: (id: string) => Promise<void>;
  createJuryClasse: (data: JuryClasseFormData) => Promise<void>;
  updateJuryClasse: (id: string, data: Partial<JuryClasseFormData>) => Promise<void>;
  deleteJuryClasse: (id: string) => Promise<void>;

  // Utilities
  clearError: () => void;
  clearCurrentJury: () => void;
  clearCurrentJuryClasse: () => void;
}

export const useJuryStore = create<JuryState>((set, get) => ({
  juries: [],
  currentJury: null,
  juryClasses: [],
  currentJuryClasse: null,
  loading: false,
  error: null,

  // Jury Actions
  fetchJuries: async () => {
    set({ loading: true, error: null });
    try {
      const juries = await JuryService.getJuries();
      set({ juries, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des jurys', 
        loading: false 
      });
    }
  },

  fetchJuryById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const jury = await JuryService.getJury(id);
      set({ currentJury: jury, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du jury', 
        loading: false 
      });
    }
  },

  fetchJuriesByAnneeAndSection: async (anneeId: string, sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const juries = await JuryService.getJuriesByAnneeAndSection(anneeId, sectionId);
      set({ juries, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des jurys par année et section', 
        loading: false 
      });
    }
  },

  createJury: async (data: JuryFormData) => {
    set({ loading: true, error: null });
    try {
      const newJury = await JuryService.createJury(data);
      
      // Recharger les jurys pour cette année et section
      get().fetchJuriesByAnneeAndSection(data.anneId, data.sectionId);
      
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création du jury', 
        loading: false 
      });
      throw error;
    }
  },

  updateJury: async (id: string, data: Partial<JuryFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedJury = await JuryService.updateJury(id, data);
      const { juries } = get();
      set({ 
        juries: juries.map(jury => 
          jury._id === id ? updatedJury : jury
        ),
        currentJury: updatedJury,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du jury', 
        loading: false 
      });
      throw error;
    }
  },

  deleteJury: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await JuryService.deleteJury(id);
      const { juries } = get();
      set({ 
        juries: juries.filter(jury => jury._id !== id),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du jury', 
        loading: false 
      });
      throw error;
    }
  },

  // JuryClasse Actions
  fetchJuryClasses: async () => {
    set({ loading: true, error: null });
    try {
      const juryClasses = await JuryService.getJuryClasses();
      set({ juryClasses, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des associations jury-classe', 
        loading: false 
      });
    }
  },

  fetchJuryClasseById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const juryClasse = await JuryService.getJuryClasse(id);
      set({ currentJuryClasse: juryClasse, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'association jury-classe', 
        loading: false 
      });
    }
  },

  createJuryClasse: async (data: JuryClasseFormData) => {
    set({ loading: true, error: null });
    try {
      const newJuryClasse = await JuryService.createJuryClasse(data);
      const { juryClasses } = get();
      set({ 
        juryClasses: [...juryClasses, newJuryClasse as JuryClasseWithDetails], 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'association jury-classe', 
        loading: false 
      });
      throw error;
    }
  },

  updateJuryClasse: async (id: string, data: Partial<JuryClasseFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedJuryClasse = await JuryService.updateJuryClasse(id, data);
      const { juryClasses } = get();
      set({ 
        juryClasses: juryClasses.map(jc => 
          jc._id === id ? updatedJuryClasse : jc
        ),
        currentJuryClasse: updatedJuryClasse,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'association jury-classe', 
        loading: false 
      });
      throw error;
    }
  },

  deleteJuryClasse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await JuryService.deleteJuryClasse(id);
      const { juryClasses } = get();
      set({ 
        juryClasses: juryClasses.filter(jc => jc._id !== id),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'association jury-classe', 
        loading: false 
      });
      throw error;
    }
  },

  // Utilities
  clearError: () => {
    set({ error: null });
  },

  clearCurrentJury: () => {
    set({ currentJury: null });
  },

  clearCurrentJuryClasse: () => {
    set({ currentJuryClasse: null });
  },
}));