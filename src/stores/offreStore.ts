import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Offre, OffreFormData } from "@/types/offre";
import { OffreService } from "@/services/OffreService";

interface OffreState {
  offres: Offre[];
  selectedOffre: Offre | null;
  loading: boolean;
  error: string | null;
  selectedSectionId: string | null;
  
  // Actions
  fetchOffres: () => Promise<void>;
  fetchOffresBySection: (sectionId: string) => Promise<void>;
  fetchOffre: (id: string) => Promise<void>;
  createOffre: (offreData: OffreFormData) => Promise<Offre>;
  updateOffre: (id: string, offreData: Partial<OffreFormData>) => Promise<Offre>;
  deleteOffre: (id: string) => Promise<void>;
  setSelectedOffre: (offre: Offre | null) => void;
  setSelectedSectionId: (sectionId: string | null) => void;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useOffreStore = create<OffreState>()(
  persist(
    (set, get) => ({
      offres: [],
      selectedOffre: null,
      loading: false,
      error: null,
      selectedSectionId: null,

      fetchOffres: async () => {
        set({ loading: true, error: null });
        try {
          const offres = await OffreService.getOffres();
          set({ offres, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement des offres",
            loading: false 
          });
        }
      },

      fetchOffresBySection: async (sectionId: string) => {
        set({ loading: true, error: null, selectedSectionId: sectionId });
        try {
          const offres = await OffreService.getOffresBySection(sectionId);
          set({ offres, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement des offres de la section",
            loading: false 
          });
        }
      },

      fetchOffre: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const offre = await OffreService.getOffre(id);
          set({ selectedOffre: offre, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement de l'offre",
            loading: false 
          });
        }
      },

      createOffre: async (offreData: OffreFormData) => {
        set({ loading: true, error: null });
        try {
          const newOffre = await OffreService.createOffre(offreData);
          set(state => ({ 
            offres: [...state.offres, newOffre],
            loading: false 
          }));
          return newOffre;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création de l'offre";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateOffre: async (id: string, offreData: Partial<OffreFormData>) => {
        set({ loading: true, error: null });
        try {
          const updatedOffre = await OffreService.updateOffre(id, offreData);
          set(state => ({
            offres: state.offres.map(offre => 
              offre._id === id ? updatedOffre : offre
            ),
            selectedOffre: state.selectedOffre?._id === id ? updatedOffre : state.selectedOffre,
            loading: false
          }));
          return updatedOffre;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'offre";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteOffre: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await OffreService.deleteOffre(id);
          set(state => ({
            offres: state.offres.filter(offre => offre._id !== id),
            selectedOffre: state.selectedOffre?._id === id ? null : state.selectedOffre,
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression de l'offre";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      setSelectedOffre: (offre: Offre | null) => {
        set({ selectedOffre: offre });
      },

      setSelectedSectionId: (sectionId: string | null) => {
        set({ selectedSectionId: sectionId });
      },

      clearError: () => {
        set({ error: null });
      },

      setError: (error: string) => {
        set({ error });
      },
    }),
    {
      name: "offre-store",
      partialize: (state) => ({ 
        offres: state.offres,
        selectedOffre: state.selectedOffre,
        selectedSectionId: state.selectedSectionId
      }),
    }
  )
);
