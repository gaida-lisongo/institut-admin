import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RecoursWithDetails, RecoursResponse } from '@/types/recours';
import { AgentService } from '@/services/AgentService';
import RecoursService from '@/services/RecoursService';

interface RecoursStore {
  recours: RecoursWithDetails[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;

  // Actions
  setRecours: (recours: RecoursWithDetails[]) => void;
  addRecours: (recours: RecoursWithDetails) => void;
  removeRecours: (recoursId: string) => void;
  updateRecours: (recoursId: string, updates: Partial<RecoursWithDetails>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRecoursByAgent: (chargesIds: string[]) => Promise<void>;
  deleteRecours: (recoursId: string) => Promise<void>;
  processRecours: (recoursId: string, newGrades: {
    cmi?: number;
    examen?: number;
    rattrapage?: number;
  }) => Promise<void>;
  markAsRead: (recoursId: string) => void;
  getUnreadCount: () => number;
}

const useRecoursStore = create<RecoursStore>()(
  devtools(
    (set, get) => ({
      // État initial
      recours: [],
      isLoading: false,
      error: null,
      unreadCount: 0,

      // Actions
      setRecours: (recours: RecoursWithDetails[]) => {
        const unreadCount = recours.filter(r => r.status === 'PENDING').length;
        set({ recours, unreadCount });
      },

      addRecours: (newRecours: RecoursWithDetails) => {
        const currentRecours = get().recours;
        const updatedRecours = [newRecours, ...currentRecours];
        const unreadCount = updatedRecours.filter(r => r.status === 'PENDING').length;
        set({ recours: updatedRecours, unreadCount });
      },

      removeRecours: (recoursId: string) => {
        const currentRecours = get().recours;
        const updatedRecours = currentRecours.filter(r => r._id !== recoursId);
        const unreadCount = updatedRecours.filter(r => r.status === 'PENDING').length;
        set({ recours: updatedRecours, unreadCount });
      },

      updateRecours: (recoursId: string, updates: Partial<RecoursWithDetails>) => {
        const currentRecours = get().recours;
        const updatedRecours = currentRecours.map(r => 
          r._id === recoursId ? { ...r, ...updates } : r
        );
        const unreadCount = updatedRecours.filter(r => r.status === 'PENDING').length;
        set({ recours: updatedRecours, unreadCount });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      fetchRecoursByAgent: async (chargesIds: string[]) => {
        set({ isLoading: true, error: null });
        
        let recoursData: RecoursWithDetails[] = [];
        let compteur = 0;
        
        for (const chargeId of chargesIds) {
          compteur++;
          try {
            const response = await RecoursService.getRecoursByCharge(chargeId);
            if (response.success) {
              recoursData = [...recoursData, ...response.data];
              set({ recours: recoursData });
              set({ unreadCount: recoursData.filter(r => r.status === 'PENDING').length });
            } else {
              set({ error: response.message });
            }
          } catch (error) {    
            console.error('Error lors de la recupération des recours de la charge :', chargeId, '=>', error)        
            set({ error: "Un rpoblème est survenu lors de la recupération des recours" });
          } finally {
            set({ isLoading: false });
          }
          console.log("Compteur => ", compteur);
        }
      },

      deleteRecours: async (recoursId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AgentService.deleteRecours(recoursId);
          if (response.success) {
            get().removeRecours(recoursId);
          } else {
            set({ error: response.message });
          }
        } catch (error) {
          console.error('Erreur lors de la suppression du recours:', error);
          set({ error: 'Erreur lors de la suppression du recours' });
        } finally {
          set({ isLoading: false });
        }
      },

      processRecours: async (recoursId: string, newGrades: {
        cmi?: number;
        examen?: number;
        rattrapage?: number;
      }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AgentService.processRecours(recoursId, newGrades);
          if (response.success) {
            // Marquer le recours comme traité et le supprimer de la liste
            get().removeRecours(recoursId);
          } else {
            set({ error: response.message });
          }
        } catch (error) {
          console.error('Erreur lors du traitement du recours:', error);
          set({ error: 'Erreur lors du traitement du recours' });
        } finally {
          set({ isLoading: false });
        }
      },

      markAsRead: (recoursId: string) => {
        get().updateRecours(recoursId, { status: 'PROCESSED' });
      },

      getUnreadCount: () => {
        return get().recours.filter(r => r.status === 'PENDING').length;
      },
    }),
    {
      name: 'recours-store',
    }
  )
);

export default useRecoursStore;
