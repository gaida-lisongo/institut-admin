import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Annee, AnneeFormData, EvenementCalendrier } from '@/types/annee';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL //|| 'http://localhost:4003/api/v1';
console.log("Base url :", API_URL);
interface AnneeState {
  // État des données
  annees: Annee[];
  currentAnnee: Annee | null;
  loading: boolean;
  error: string | null;

  // Actions CRUD
  fetchAnnees: () => Promise<void>;
  getAnneeById: (id: string) => Promise<Annee | null>;
  createAnnee: (data: AnneeFormData) => Promise<Annee | null>;
  updateAnnee: (id: string, data: Partial<AnneeFormData>) => Promise<Annee | null>;
  deleteAnnee: (id: string) => Promise<boolean>;

  // Actions pour les événements du calendrier
  addEvenementToAnnee: (anneeId: string, evenement: Omit<EvenementCalendrier, 'date'> & { date: string }) => Promise<boolean>;
  updateEvenementInAnnee: (anneeId: string, evenementIndex: number, evenement: Partial<EvenementCalendrier>) => Promise<boolean>;
  deleteEvenementFromAnnee: (anneeId: string, evenementIndex: number) => Promise<boolean>;

  // Actions utilitaires
  setCurrentAnnee: (annee: Annee | null) => void;
  clearError: () => void;
  getAnneeActive: () => Annee | null;
  getAnneesByStatut: (statut: Annee['statut']) => Annee[];
  
  // Actions locales (sans API)
  addAnneeLocal: (annee: Annee) => void;
  updateAnneeLocal: (id: string, updates: Partial<Annee>) => void;
  removeAnneeLocal: (id: string) => void;
}

export const useAnneeStore = create<AnneeState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        annees: [],
        currentAnnee: null,
        loading: false,
        error: null,

        // Récupérer toutes les années
        fetchAnnees: async () => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/annees`);
            
            const result = await response.json();
            
            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              set({ 
                annees: result.data,
                loading: false 
              });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors du chargement des années',
              loading: false 
            });
          }
        },

        // Récupérer une année par ID
        getAnneeById: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/annees/${id}`);
            const result = await response.json();
            
            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const annee = result.data;
              set({ 
                currentAnnee: annee,
                loading: false 
              });
              return annee;
            }
            
            set({ loading: false });
            return null;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'année',
              loading: false 
            });
            return null;
          }
        },

        // Créer une nouvelle année
        createAnnee: async (data: AnneeFormData) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/annees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const newAnnee: Annee = result.data;

              set(state => ({
                annees: [...state.annees, newAnnee],
                loading: false
              }));

              return newAnnee;
            }
            
            set({ loading: false });
            return null;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'année',
              loading: false 
            });
            return null;
          }
        },

        // Mettre à jour une année
        updateAnnee: async (id: string, data: Partial<AnneeFormData>) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/annees/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await response.json();

            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const updatedAnnee: Annee = result.data;

              set(state => ({
                annees: state.annees.map(annee => 
                  annee._id === id ? updatedAnnee : annee
                ),
                currentAnnee: state.currentAnnee?._id === id ? updatedAnnee : state.currentAnnee,
                loading: false 
              }));

              return updatedAnnee;
            }
            
            set({ loading: false });
            return null;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'année',
              loading: false 
            });
            return null;
          }
        },

        // Supprimer une année
        deleteAnnee: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/annees/${id}`, {
              method: 'DELETE'
            });
            const result = await response.json();

            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              set(state => ({
                annees: state.annees.filter(a => a._id !== id),
                currentAnnee: state.currentAnnee?._id === id ? null : state.currentAnnee,
                loading: false
              }));

              return true;
            }
            
            set({ loading: false });
            return false;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'année',
              loading: false 
            });
            return false;
          }
        },

        // Ajouter un événement à une année
        addEvenementToAnnee: async (anneeId: string, evenement: Omit<EvenementCalendrier, 'date'> & { date: string }) => {
          set({ loading: true, error: null });
          try {
            const newEvenement: EvenementCalendrier = {
              ...evenement,
              date: new Date(evenement.date)
            };

            // Récupérer l'année actuelle pour avoir le calendrier complet
            const { annees } = get();
            const currentAnnee = annees.find(a => a._id === anneeId);
            if (!currentAnnee) {
              throw new Error('Année introuvable');
            }

            const updatedCalendrier = [...(currentAnnee.calendrier || []), newEvenement];

            const response = await fetch(`${API_URL}/annees/calendrier/${anneeId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ calendrier: updatedCalendrier })
            });
            const result = await response.json();

            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const updatedAnnee: Annee = result.data;

              set(state => ({
                annees: state.annees.map(annee => 
                  annee._id === anneeId ? updatedAnnee : annee
                ),
                currentAnnee: state.currentAnnee?._id === anneeId ? updatedAnnee : state.currentAnnee,
                loading: false 
              }));

              return true;
            }
            
            set({ loading: false });
            return false;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de l\'événement',
              loading: false 
            });
            return false;
          }
        },

        // Mettre à jour un événement dans une année
        updateEvenementInAnnee: async (anneeId: string, evenementIndex: number, evenement: Partial<EvenementCalendrier>) => {
          set({ loading: true, error: null });
          try {
            // Récupérer l'année actuelle pour avoir le calendrier complet
            const { annees } = get();
            const currentAnnee = annees.find(a => a._id === anneeId);
            if (!currentAnnee || !currentAnnee.calendrier) {
              throw new Error('Année ou calendrier introuvable');
            }

            const updatedCalendrier = [...currentAnnee.calendrier];
            updatedCalendrier[evenementIndex] = {
              ...updatedCalendrier[evenementIndex],
              ...evenement,
              date: evenement.date ? new Date(evenement.date) : updatedCalendrier[evenementIndex].date
            };

            const response = await fetch(`${API_URL}/annees/calendrier/${anneeId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ calendrier: updatedCalendrier })
            });
            const result = await response.json();

            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const updatedAnnee: Annee = result.data;

              set(state => ({
                annees: state.annees.map(annee => 
                  annee._id === anneeId ? updatedAnnee : annee
                ),
                currentAnnee: state.currentAnnee?._id === anneeId ? updatedAnnee : state.currentAnnee,
                loading: false 
              }));

              return true;
            }
            
            set({ loading: false });
            return false;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'événement',
              loading: false 
            });
            return false;
          }
        },

        // Supprimer un événement d'une année
        deleteEvenementFromAnnee: async (anneeId: string, evenementIndex: number) => {
          set({ loading: true, error: null });
          try {
            // Récupérer l'année actuelle pour avoir le calendrier complet
            const { annees } = get();
            const currentAnnee = annees.find(a => a._id === anneeId);
            if (!currentAnnee || !currentAnnee.calendrier) {
              throw new Error('Année ou calendrier introuvable');
            }

            const updatedCalendrier = currentAnnee.calendrier.filter((_, index) => index !== evenementIndex);

            const response = await fetch(`${API_URL}/annees/calendrier/${anneeId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ calendrier: updatedCalendrier })
            });
            const result = await response.json();

            if(!response.ok){
              throw new Error(result.message);
            }

            if(result.success){
              const updatedAnnee: Annee = result.data;

              set(state => ({
                annees: state.annees.map(annee => 
                  annee._id === anneeId ? updatedAnnee : annee
                ),
                currentAnnee: state.currentAnnee?._id === anneeId ? updatedAnnee : state.currentAnnee,
                loading: false 
              }));

              return true;
            }
            
            set({ loading: false });
            return false;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'événement',
              loading: false 
            });
            return false;
          }
        },

        // Actions utilitaires
        setCurrentAnnee: (annee: Annee | null) => {
          set({ currentAnnee: annee });
        },

        clearError: () => {
          set({ error: null });
        },

        getAnneeActive: () => {
          const { annees } = get();
          return annees.find(a => a.statut === 'active') || null;
        },

        getAnneesByStatut: (statut: Annee['statut']) => {
          const { annees } = get();
          return annees.filter(a => a.statut === statut);
        },

        // Actions locales (sans API)
        addAnneeLocal: (annee: Annee) => {
          set(state => ({
            annees: [...state.annees, annee]
          }));
        },

        updateAnneeLocal: (id: string, updates: Partial<Annee>) => {
          set(state => ({
            annees: state.annees.map(annee => 
              annee._id === id 
                ? { ...annee, ...updates, dateModification: new Date() }
                : annee
            )
          }));
        },

        removeAnneeLocal: (id: string) => {
          set(state => ({
            annees: state.annees.filter(a => a._id !== id),
            currentAnnee: state.currentAnnee?._id === id ? null : state.currentAnnee
          }));
        },
      }),
      {
        name: 'annee-store',
        partialize: (state) => ({
          annees: state.annees,
          currentAnnee: state.currentAnnee,
        }),
      }
    ),
    {
      name: 'annee-store',
    }
  )
);
