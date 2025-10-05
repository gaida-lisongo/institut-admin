import { useUserStore } from '@/stores/userStore';
import { User, SignupData, LoginData, UpdateUserData } from '@/types/user';

/**
 * Hook personnalisé pour la gestion des utilisateurs
 */
export const useUser = () => {
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    signup,
    login,
    logout,
    updateUser,
    deleteUser,
    getCurrentUser,
    clearError,
    setLoading,
  } = useUserStore();

  return {
    // État
    user: currentUser,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    signup,
    login,
    logout,
    updateUser,
    deleteUser,
    getCurrentUser,
    clearError,
    setLoading,
  };
};

/**
 * Hook pour obtenir uniquement les informations de l'utilisateur courant
 */
export const useCurrentUser = (): User | null => {
  return useUserStore((state) => state.currentUser);
};

/**
 * Hook pour obtenir uniquement le statut d'authentification
 */
export const useAuth = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);
  const logout = useUserStore((state) => state.logout);

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
};

/**
 * Hook pour les actions d'authentification (login/signup)
 */
export const useAuthActions = () => {
  const { signup, login, logout, clearError, error, isLoading } = useUserStore();

  return {
    signup,
    login,
    logout,
    clearError,
    error,
    isLoading,
  };
};

/**
 * Hook pour les actions de gestion de profil
 */
export const useProfile = () => {
  const { 
    currentUser, 
    updateUser, 
    deleteUser, 
    error, 
    isLoading, 
    clearError 
  } = useUserStore();

  // Fonction helper pour mettre à jour le profil courant
  const updateProfile = async (data: UpdateUserData) => {
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }
    return updateUser(currentUser._id, data);
  };

  // Fonction helper pour supprimer le profil courant
  const deleteProfile = async () => {
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }
    return deleteUser(currentUser._id);
  };

  return {
    user: currentUser,
    updateProfile,
    deleteProfile,
    updateUser,
    deleteUser,
    error,
    isLoading,
    clearError,
  };
};
