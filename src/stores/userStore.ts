import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  UserState, 
  SignupData, 
  LoginData, 
  UpdateUserData, 
  AuthResponse, 
  UserResponse,
  SignupResponse
} from '@/types/user';
import { API_ENDPOINTS, buildApiUrl, getAuthHeaders } from '@/config/api';
import { setToken, removeToken, getToken } from '@/utils/auth';

/**
 * Store Zustand pour la gestion des utilisateurs
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // État initial
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Action: Inscription
      signup: async (data: SignupData): Promise<SignupResponse> => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.SIGNUP), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
          });

          const result: SignupResponse = await response.json();

          if (result._id) {
            // Pas de token ni d'utilisateur dans signup, juste l'ID
            set({
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: result.error || 'Erreur lors de l\'inscription',
            });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur réseau';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            _id: '',
            error: errorMessage,
          };
        }
      },

      // Action: Connexion
      login: async (data: LoginData): Promise<AuthResponse> => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.LOGIN), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
          });

          const result: AuthResponse = await response.json();

          if (result.success !== false && result.user && result.token) {
            setToken(result.token);
            set({
              currentUser: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: result.error || result.message || 'Erreur lors de la connexion',
            });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur réseau';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
            error: errorMessage,
          };
        }
      },

      // Action: Déconnexion
      logout: () => {
        removeToken();
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Action: Mise à jour utilisateur
      updateUser: async (id: string, data: UpdateUserData): Promise<UserResponse> => {
        set({ isLoading: true, error: null });

        try {
          const token = getToken();
          const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.UPDATE(id)), {
            method: 'PUT',
            headers: getAuthHeaders(token || undefined),
            body: JSON.stringify(data),
          });

          const result: UserResponse = await response.json();

          // Si le serveur répond sans erreur, mettre à jour avec les données locales
          if (response.ok && !result.error) {
            const currentUserInStore = get().currentUser;
            if (currentUserInStore && currentUserInStore._id === id) {
              // Mettre à jour avec les données locales (data) envoyées
              const updatedUser = {
                ...currentUserInStore,
                ...data,
              };
              set({
                currentUser: updatedUser,
                isLoading: false,
                error: null,
              });
            } else {
              set({ isLoading: false, error: null });
            }
          } else {
            // Le serveur a retourné une erreur
            set({
              isLoading: false,
              error: result.error || result.message || 'Erreur lors de la mise à jour',
            });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur réseau';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
            error: errorMessage,
          };
        }
      },

      // Action: Suppression utilisateur
      deleteUser: async (id: string): Promise<UserResponse> => {
        set({ isLoading: true, error: null });

        try {
          const token = getToken();
          const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.DELETE(id)), {
            method: 'DELETE',
            headers: getAuthHeaders(token || undefined),
          });

          const result: UserResponse = await response.json();

          if (result.success) {
            // Si l'utilisateur supprime son propre compte, le déconnecter
            const currentUser = get().currentUser;
            if (currentUser && currentUser._id === id) {
              get().logout();
            } else {
              set({ isLoading: false, error: null });
            }
          } else {
            set({
              isLoading: false,
              error: result.error || result.message || 'Erreur lors de la suppression',
            });
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur réseau';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
            error: errorMessage,
          };
        }
      },

      // Action: Obtenir l'utilisateur courant
      getCurrentUser: (): User | null => {
        return get().currentUser;
      },

      // Action: Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },

      // Action: Définir le statut de chargement
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'user-store', // Nom pour la persistance
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }), // Ne persister que les données essentielles
    }
  )
);
