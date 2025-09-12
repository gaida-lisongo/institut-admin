import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Agent, AuthState } from '@/types/auth';
import { AgentService } from '@/services/AgentService';
import { AgentFormData } from '@/types/agent';

interface AuthStore extends AuthState {
  // Actions
  login: (token: string, user: Agent) => void;
  logout: () => void;
  updateUser: (user: Partial<Agent>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  // Nouvel état pour la réhydratation
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        hasHydrated: false,

        // Actions
        login: (token: string, user: Agent) => {
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // Supprimer le token du localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
          }
        },

        updateUser: (userData: Partial<Agent>) => {
          const currentUser = get().user;
          if (currentUser) {
            const userToUpdate : Partial<AgentFormData> = {
              nom: userData.nom,
              post_nom: userData.post_nom,
              prenom: userData.prenom,
              sexe: userData?.sexe as "" | "M" | "F" | undefined,
              nationalite: userData?.nationalite,
              lieu_naissance: userData?.lieu_naissance,
              date_naissance: userData?.date_naissance?.toISOString(),
              matricule: userData?.matricule,
              solde: userData?.solde,
              grade: userData?.grade,
              titre: userData?.titre,
              photo: userData?.photo,
              telephone: userData?.telephone,
              email: userData?.email,
              adresse: userData?.adresse,
            };

            AgentService.updateAgent(currentUser._id!, userToUpdate).then((updatedUser) => {
              console.log("Utilisateur mis à jour avec succès:", updatedUser);
              set({
                user: { ...currentUser, ...userData },
              });

            }).catch((error) => {
              console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            });
          }
        },

        clearAuth: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setHasHydrated: (hasHydrated: boolean) => {
          set({ hasHydrated });
        },
      }),
      {
        name: 'auth-storage', // nom de la clé dans localStorage
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

export default useAuthStore;