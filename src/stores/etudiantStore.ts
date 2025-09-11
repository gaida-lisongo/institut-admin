import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Etudiant, EtudiantFormData } from "@/types/etudiant";
import { EtudiantService } from "@/services/EtudiantService";

interface EtudiantState {
  etudiants: Etudiant[];
  selectedEtudiant: Etudiant | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEtudiants: () => Promise<void>;
  fetchEtudiant: (id: string) => Promise<void>;
  createEtudiant: (etudiantData: EtudiantFormData) => Promise<Etudiant>;
  updateEtudiant: (id: string, etudiantData: Partial<EtudiantFormData>) => Promise<Etudiant>;
  deleteEtudiant: (id: string) => Promise<void>;
  importEtudiants: (etudiants: EtudiantFormData[]) => Promise<Etudiant[]>;
  exportEtudiants: () => Promise<void>;
  setSelectedEtudiant: (etudiant: Etudiant | null) => void;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useEtudiantStore = create<EtudiantState>()(
  persist(
    (set, get) => ({
      etudiants: [],
      selectedEtudiant: null,
      loading: false,
      error: null,

      fetchEtudiants: async () => {
        set({ loading: true, error: null });
        try {
          const etudiants = await EtudiantService.getEtudiants();
          set({ etudiants, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement des étudiants",
            loading: false 
          });
        }
      },

      fetchEtudiant: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const etudiant = await EtudiantService.getEtudiant(id);
          set({ selectedEtudiant: etudiant, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement de l'étudiant",
            loading: false 
          });
        }
      },

      createEtudiant: async (etudiantData: EtudiantFormData) => {
        set({ loading: true, error: null });
        try {
          const newEtudiant = await EtudiantService.createEtudiant(etudiantData);
          set(state => ({ 
            etudiants: [...state.etudiants, newEtudiant],
            loading: false 
          }));
          return newEtudiant;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création de l'étudiant";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateEtudiant: async (id: string, etudiantData: Partial<EtudiantFormData>) => {
        set({ loading: true, error: null });
        try {
          const updatedEtudiant = await EtudiantService.updateEtudiant(id, etudiantData);
          set(state => ({
            etudiants: state.etudiants.map(etudiant => 
              etudiant._id === id ? updatedEtudiant : etudiant
            ),
            selectedEtudiant: state.selectedEtudiant?._id === id ? updatedEtudiant : state.selectedEtudiant,
            loading: false
          }));
          return updatedEtudiant;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'étudiant";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteEtudiant: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await EtudiantService.deleteEtudiant(id);
          set(state => ({
            etudiants: state.etudiants.filter(etudiant => etudiant._id !== id),
            selectedEtudiant: state.selectedEtudiant?._id === id ? null : state.selectedEtudiant,
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression de l'étudiant";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      importEtudiants: async (etudiantsData: EtudiantFormData[]) => {
        set({ loading: true, error: null });
        try {
          const createdEtudiants: Etudiant[] = [];
          
          // Créer les étudiants un par un
          for (const etudiantData of etudiantsData) {
            try {
              const newEtudiant = await EtudiantService.createEtudiant(etudiantData);
              createdEtudiants.push(newEtudiant);
            } catch (error) {
              console.error(`Erreur lors de la création de l'étudiant ${etudiantData.nom} ${etudiantData.prenom}:`, error);
              // Continue avec les autres étudiants même si un échoue
            }
          }
          
          if (createdEtudiants.length === 0) {
            throw new Error("Aucun étudiant n'a pu être créé");
          }
          
          set(state => ({
            etudiants: [...state.etudiants, ...createdEtudiants],
            loading: false
          }));
          
          return createdEtudiants;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'import CSV";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      exportEtudiants: async () => {
        set({ loading: true, error: null });
        try {
          await EtudiantService.exportEtudiantsToCSV(get().etudiants);
          set({ loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'export CSV";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      setSelectedEtudiant: (etudiant: Etudiant | null) => {
        set({ selectedEtudiant: etudiant });
      },

      clearError: () => {
        set({ error: null });
      },

      setError: (error: string) => {
        set({ error });
      },
    }),
    {
      name: "etudiant-store",
      partialize: (state) => ({ 
        etudiants: state.etudiants,
        selectedEtudiant: state.selectedEtudiant 
      }),
    }
  )
);
