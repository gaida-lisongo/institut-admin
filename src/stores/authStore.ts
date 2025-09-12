import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Agent, AuthState } from '@/types/auth';

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
            set({
              user: { ...currentUser, ...userData },
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