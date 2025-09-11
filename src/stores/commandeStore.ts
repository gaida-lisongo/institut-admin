import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import CommandeService from '../services/CommandeService';
import type { Commande, CommandeStats, Annee } from '../services/CommandeService';

interface CommandeState {
  commandes: Commande[];
  stats: CommandeStats | null;
  annees: Annee[];
  selectedAnnee: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCommandes: () => Promise<void>;
  fetchCommandesByAnnee: (anneeId: string) => Promise<void>;
  fetchStats: (anneeId?: string) => Promise<void>;
  fetchAnnees: () => Promise<void>;
  createCommande: (commandeData: Omit<Commande, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateCommande: (id: string, data: Partial<Commande>) => Promise<boolean>;
  deleteCommande: (id: string) => Promise<boolean>;
  setSelectedAnnee: (anneeId: string | null) => void;
  clearError: () => void;
}

export const useCommandeStore = create<CommandeState>()(
  devtools(
    persist(
      (set, get) => ({
        commandes: [],
        stats: null,
        annees: [],
        selectedAnnee: null,
        isLoading: false,
        error: null,

        fetchCommandes: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await CommandeService.getAllCommandes();
            
            if (result.status === 200) {
              const { success, data, message } = result.data;
              if (success) {
                set({ commandes: data || [], isLoading: false });
              } else {
                set({ error: message || 'Erreur lors du chargement', isLoading: false });
              }
            } else {
              set({ error: result.data?.message || 'Erreur lors du chargement', isLoading: false });
            }
          } catch (error) {
            console.error('Error fetching commandes:', error);
            set({ error: 'Erreur lors du chargement des commandes', isLoading: false });
          }
        },

        fetchCommandesByAnnee: async (anneeId: string) => {
          set({ isLoading: true, error: null, selectedAnnee: anneeId });
          try {
            const result = await CommandeService.getCommandesByAnnee(anneeId);
            
            if (result.status === 200) {
              const { success, data, message } = result.data;
              if (success) {
                set({ commandes: data || [], isLoading: false });
              } else {
                set({ error: message || 'Erreur lors du chargement', isLoading: false });
              }
            } else {
              set({ error: result.data?.message || 'Erreur lors du chargement', isLoading: false });
            }
          } catch (error) {
            console.error('Error fetching commandes by annee:', error);
            set({ error: 'Erreur lors du chargement des commandes', isLoading: false });
          }
        },

        fetchStats: async (anneeId?: string) => {
          set({ error: null });
          try {
            const result = await CommandeService.getCommandeStats(anneeId);
            
            if (result.status === 200) {
              const { success, data, message } = result.data;
              if (success) {
                set({ stats: data || null });
              } else {
                set({ error: message || 'Erreur lors du chargement des statistiques' });
              }
            } else {
              set({ error: result.data?.message || 'Erreur lors du chargement des statistiques' });
            }
          } catch (error) {
            console.error('Error fetching stats:', error);
            set({ error: 'Erreur lors du chargement des statistiques' });
          }
        },

        fetchAnnees: async () => {
          set({ error: null });
          try {
            // Supposons qu'il y a un endpoint pour récupérer les années
            // Si ce n'est pas le cas, vous devrez l'ajouter à votre API
            const response = await fetch('https://legendary-barnacle-7v54v7x64jgxcpwvg-3000.app.github.dev/api/v1/annee');
            const result = await response.json();
            
            if (response.status === 200 && result.success) {
              set({ annees: result.data || [] });
            }
          } catch (error) {
            console.error('Error fetching annees:', error);
            // Set quelques années par défaut si l'endpoint n'existe pas
            const currentYear = new Date().getFullYear();
            const defaultAnnees: Annee[] = [
              { _id: '1', debut: currentYear - 1, fin: currentYear, articles: [] },
              { _id: '2', debut: currentYear, fin: currentYear + 1, articles: [] }
            ];
            set({ annees: defaultAnnees });
          }
        },

        createCommande: async (commandeData) => {
          set({ error: null });
          try {
            const result = await CommandeService.createCommande(commandeData);
            
            const { success, message } = result.data || {};
            if (success) {
              await get().fetchCommandes();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la création' });
              return false;
            }
          } catch (error) {
            console.error('Error creating commande:', error);
            set({ error: 'Erreur lors de la création de la commande' });
            return false;
          }
        },

        updateCommande: async (id, data) => {
          set({ error: null });
          try {
            const result = await CommandeService.updateCommande(id, data);
            
            const { success, message } = result.data || {};
            if (success) {
              const selectedAnnee = get().selectedAnnee;
              if (selectedAnnee) {
                await get().fetchCommandesByAnnee(selectedAnnee);
              } else {
                await get().fetchCommandes();
              }
              return true;
            } else {
              set({ error: message || 'Erreur lors de la modification' });
              return false;
            }
          } catch (error) {
            console.error('Error updating commande:', error);
            set({ error: 'Erreur lors de la modification de la commande' });
            return false;
          }
        },

        deleteCommande: async (id) => {
          set({ error: null });
          try {
            const result = await CommandeService.deleteCommande(id);
            
            const { success, message } = result.data || {};
            if (success) {
              const selectedAnnee = get().selectedAnnee;
              if (selectedAnnee) {
                await get().fetchCommandesByAnnee(selectedAnnee);
              } else {
                await get().fetchCommandes();
              }
              return true;
            } else {
              set({ error: message || 'Erreur lors de la suppression' });
              return false;
            }
          } catch (error) {
            console.error('Error deleting commande:', error);
            set({ error: 'Erreur lors de la suppression de la commande' });
            return false;
          }
        },

        setSelectedAnnee: (anneeId) => {
          set({ selectedAnnee: anneeId });
          if (anneeId) {
            get().fetchCommandesByAnnee(anneeId);
            get().fetchStats(anneeId);
          } else {
            get().fetchCommandes();
            get().fetchStats();
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'commande-storage',
        partialize: (state) => ({ 
          commandes: state.commandes, 
          stats: state.stats,
          annees: state.annees,
          selectedAnnee: state.selectedAnnee
        }),
      }
    ),
    { name: 'commande-store' }
  )
);