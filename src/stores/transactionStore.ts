import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import TransactionService from '../services/TransactionService';
import type { Deposit, Withdraw, WithdrawAgent, TransactionStats } from '../services/TransactionService';

interface TransactionState {
  deposits: Deposit[];
  withdraws: WithdrawAgent[];
  stats: TransactionStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDeposits: () => Promise<void>;
  fetchWithdraws: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createDeposit: (depositData: Omit<Deposit, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  createWithdraw: (withdrawData: Omit<Withdraw, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDeposit: (id: string, data: Partial<Deposit>) => Promise<boolean>;
  updateWithdraw: (id: string, data: any) => Promise<boolean>;
  deleteDeposit: (id: string) => Promise<boolean>;
  deleteWithdraw: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    persist(
      (set, get) => ({
        deposits: [],
        withdraws: [],
        stats: null,
        isLoading: false,
        error: null,

        fetchDeposits: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await TransactionService.getAllDeposits();
            const {
              success,
              data,
              message
            } = result;

            // Supposons que result.data est de la forme { success, data, message }
            if (success) {
              set({ deposits: data || [], isLoading: false });
            } else {
              set({ error: message || 'Erreur lors du chargement', isLoading: false });
            }
          } catch (error) {
            console.error('Error fetching deposits:', error);
            set({ error: 'Erreur lors du chargement des dépôts', isLoading: false });
          }
        },

        fetchWithdraws: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await TransactionService.getAllWithdraws();
            const {
              success,
              data,
              message
            } = result;

            if (success) {
                set({ withdraws: data || [], isLoading: false });
              
            } else {
              set({ error: message || 'Erreur lors du chargement', isLoading: false });
            }

          } catch (error) {
            console.error('Error fetching withdraws:', error);
            set({ error: 'Erreur lors du chargement des retraits', isLoading: false });
          }
        },

        fetchStats: async () => {
          set({ error: null });
          try {
            const result = await TransactionService.getTransactionStats();
            
            const { success, data, message } = result;
            if (success) {
              set({ stats: data || null });
            } else {
              set({ error: message || 'Erreur lors du chargement des statistiques' });
            }
          } catch (error) {
            console.error('Error fetching stats:', error);
            set({ error: 'Erreur lors du chargement des statistiques' });
          }
        },

        createDeposit: async (depositData) => {
          set({ error: null });
          try {
            const result = await TransactionService.createDeposit(depositData);
            
            // Gestion cohérente - pas besoin de type assertion
            const { success, message } = result || {};
            if (success) {
              await get().fetchDeposits();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la création' });
              return false;
            }
          } catch (error) {
            console.error('Error creating deposit:', error);
            set({ error: 'Erreur lors de la création du dépôt' });
            return false;
          }
        },

        createWithdraw: async (withdrawData) => {
          set({ error: null });
          try {
            const result = await TransactionService.createWithdraw(withdrawData);
            
            const { success, message, data } = result || {};
            if (success) {
              await get().fetchWithdraws();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la création' });
              return false;
            }
          } catch (error) {
            console.error('Error creating withdraw:', error);
            set({ error: 'Erreur lors de la création du retrait' });
            return false;
          }
        },

        updateDeposit: async (id, data) => {
          set({ error: null });
          try {
            const result = await TransactionService.updateDeposit(id, data);
            
            const { success, message } = result || {};
            if (success) {
              await get().fetchDeposits();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la modification' });
              return false;
            }
          } catch (error) {
            console.error('Error updating deposit:', error);
            set({ error: 'Erreur lors de la modification du dépôt' });
            return false;
          }
        },

        updateWithdraw: async (id, data) => {
          set({ error: null });
          try {
            const result = await TransactionService.updateWithdraw(id, data);
            
            const { success, message } = result || {};
            if (success) {
              await get().fetchWithdraws();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la modification' });
              return false;
            }
          } catch (error) {
            console.error('Error updating withdraw:', error);
            set({ error: 'Erreur lors de la modification du retrait' });
            return false;
          }
        },

        deleteDeposit: async (id) => {
          set({ error: null });
          try {
            const result = await TransactionService.deleteDeposit(id);
            
            const { success, message } = result || {};
            if (success) {
              await get().fetchDeposits();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la suppression' });
              return false;
            }
          } catch (error) {
            console.error('Error deleting deposit:', error);
            set({ error: 'Erreur lors de la suppression du dépôt' });
            return false;
          }
        },

        deleteWithdraw: async (id) => {
          set({ error: null });
          try {
            const result = await TransactionService.deleteWithdraw(id);
            
            const { success, message } = result || {};
            if (success) {
              await get().fetchWithdraws();
              return true;
            } else {
              set({ error: message || 'Erreur lors de la suppression' });
              return false;
            }
          } catch (error) {
            console.error('Error deleting withdraw:', error);
            set({ error: 'Erreur lors de la suppression du retrait' });
            return false;
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'transaction-storage',
        partialize: (state) => ({ 
          deposits: state.deposits, 
          withdraws: state.withdraws,
          stats: state.stats 
        }),
      }
    ),
    { name: 'transaction-store' }
  )
);