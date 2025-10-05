import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Interface pour les matières
export interface Matiere {
  _id: string;
  designation: string;
  unite: string;
  credit: number;
  semestre: string;
  annee: string;
  userId: string;
}

// Interface pour créer une matière (sans _id)
export interface CreateMatiereData {
  designation: string;
  unite: string;
  credit: number;
  semestre: string;
  annee: string;
  userId?: string;
}

// Interface pour la réponse API
export interface MatiereResponse {
  success: boolean;
  message: string;
  data?: Matiere | Matiere[];
  count?: number;
}

// Interface du store
interface MatiereStore {
  // État
  matieres: Matiere[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMatieres: () => Promise<void>;
  createMatiere: (matiereData: CreateMatiereData) => Promise<boolean>;
  updateMatiere: (matiere: Matiere) => Promise<boolean>;
  deleteMatiere: (id: string) => Promise<boolean>;
  clearError: () => void;
  
  // Actions locales (pour la gestion d'état)
  addMatiereLocal: (matiere: Matiere) => void;
  updateMatiereLocal: (matiere: Matiere) => void;
  deleteMatiereLocal: (id: string) => void;
}

// Helper pour obtenir le token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper pour les headers d'authentification
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const useMatiereStore = create<MatiereStore>()(
  persist(
    (set, get) => ({
      // État initial
      matieres: [],
      isLoading: false,
      error: null,

      // Récupérer toutes les matières
      fetchMatieres: async () => {
        const token = getToken();
        if (!token) {
          set({ error: 'Token d\'authentification manquant' });
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/cours`, {
            method: 'GET',
            headers: getAuthHeaders()
          });

          const data = await response.json();
          
          if (response.ok && data) {
            // Normaliser les données
            const matieres = Array.isArray(data) ? data : (data.data || []);
            const normalizedMatieres = matieres.map((matiere: any) => ({
              _id: matiere._id,
              designation: matiere.designation,
              unite: matiere.unite,
              credit: matiere.credit,
              semestre: matiere.semestre,
              annee: matiere.annee,
              userId: matiere.userId
            }));
            
            set({ 
              matieres: normalizedMatieres, 
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              error: data.message || 'Erreur lors du chargement des matières',
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error fetching matieres:', error);
          set({ 
            error: 'Erreur de connexion au serveur',
            isLoading: false 
          });
        }
      },

      // Créer une nouvelle matière
      createMatiere: async (matiereData: CreateMatiereData) => {
        const token = getToken();
        if (!token) {
          set({ error: 'Token d\'authentification manquant' });
          return false;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/cours`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(matiereData)
          });

          const data = await response.json();
          if (response.ok) {
            const newMatiere = data;
            if (newMatiere) {
              // Ajouter la nouvelle matière au store
              get().addMatiereLocal(newMatiere);
            }
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: data.message || 'Erreur lors de la création de la matière',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          console.error('Error creating matiere:', error);
          set({ 
            error: 'Erreur de connexion au serveur',
            isLoading: false 
          });
          return false;
        }
      },

      // Modifier une matière
      updateMatiere: async (matiere: Matiere) => {
        const token = getToken();
        if (!token) {
          set({ error: 'Token d\'authentification manquant' });
          return false;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/cours/${matiere._id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(matiere)
          });

          const data = await response.json();
          
          if (response.ok) {
            // Mettre à jour la matière dans le store
            get().updateMatiereLocal(matiere);
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: data.message || 'Erreur lors de la modification de la matière',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          console.error('Error updating matiere:', error);
          set({ 
            error: 'Erreur de connexion au serveur',
            isLoading: false 
          });
          return false;
        }
      },

      // Supprimer une matière
      deleteMatiere: async (id: string) => {
        const token = getToken();
        if (!token) {
          set({ error: 'Token d\'authentification manquant' });
          return false;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/cours/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          const data = await response.json();
          if (response.ok) {
            // Supprimer la matière du store
            get().deleteMatiereLocal(id);
            set({ isLoading: false });
            return true;
          } else {
            set({ 
              error: data.message || 'Erreur lors de la suppression de la matière',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          console.error('Error deleting matiere:', error);
          set({ 
            error: 'Erreur de connexion au serveur',
            isLoading: false 
          });
          return false;
        }
      },

      // Effacer les erreurs
      clearError: () => set({ error: null }),

      // Actions locales pour la gestion d'état
      addMatiereLocal: (matiere: Matiere) => {
        set(state => ({
          matieres: [...state.matieres, matiere]
        }));
      },

      updateMatiereLocal: (updatedMatiere: Matiere) => {
        set(state => ({
          matieres: state.matieres.map(matiere => 
            matiere._id === updatedMatiere._id ? updatedMatiere : matiere
          )
        }));
      },

      deleteMatiereLocal: (id: string) => {
        set(state => ({
          matieres: state.matieres.filter(matiere => matiere._id !== id)
        }));
      }
    }),
    {
      name: 'matiere-store',
      partialize: (state) => ({
        matieres: state.matieres
      })
    }
  )
);

// Hooks personnalisés pour faciliter l'utilisation
export const useMatieres = () => {
  const store = useMatiereStore();
  return {
    matieres: store.matieres,
    isLoading: store.isLoading,
    error: store.error,
    fetchMatieres: store.fetchMatieres,
    clearError: store.clearError
  };
};

export const useMatiereActions = () => {
  const store = useMatiereStore();
  return {
    createMatiere: store.createMatiere,
    updateMatiere: store.updateMatiere,
    deleteMatiere: store.deleteMatiere,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError
  };
};

export const useMatiereStats = () => {
  const matieres = useMatiereStore(state => state.matieres);
  
  const totalMatieres = matieres.length;
  const totalCredits = matieres.reduce((sum, matiere) => sum + matiere.credit, 0);
  const unites = [...new Set(matieres.map(m => m.unite))];
  const semestres = [...new Set(matieres.map(m => m.semestre))];
  
  return {
    totalMatieres,
    totalCredits,
    totalUnites: unites.length,
    totalSemestres: semestres.length,
    unites,
    semestres
  };
};
