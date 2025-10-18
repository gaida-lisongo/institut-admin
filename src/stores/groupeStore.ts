import { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Serie } from './serieStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Interface pour les groupes
export interface Groupe {
  _id: string;
  serieId: string;
  etudiantIds: string[];
  userId: string;
  designation: string;
  statut: string;
}

export interface GroupeDetail {
  _id: string;
  designation: string;
  etudiantIds: {
    _id: string;
    nom: string;
    post_nom:string;
    prenom: string;
    matricule: string;
  }[];
  serieId: Serie;
  userId: User;
  statut: string;
}

// Interface pour créer un groupe (sans _id)
export interface CreateGroupeData {
  serieId: string;
  etudiantIds: string[];
  userId: string;
  designation: string;
  statut: string;
}

// Interface pour la réponse API
export interface GroupeResponse {
  success: boolean;
  message: string;
  data?: Groupe | GroupeDetail[];
  count?: number;
}

// Helper pour les headers d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Interface du store
interface GroupeStore {
  groupes: GroupeDetail[];
  groupesData: {
    groupes: GroupeDetail[];
    cours: any[];
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGroupesData: () => Promise<void>;
  fetchGroupes: () => Promise<void>;
  fetchGroupesBySerie: (serieId: string) => Promise<void>;
  createGroupe: (groupeData: CreateGroupeData) => Promise<boolean>;
  updateGroupe: (groupe: Groupe) => Promise<boolean>;
  deleteGroupe: (id: string, serieId?: string) => Promise<boolean>;
  clearError: () => void;
}

// Store Zustand avec persistance
export const useGroupeStore = create<GroupeStore>()(
  persist(
    (set, get) => ({
      // État initial
      groupes: [],
      groupesData: {
        groupes: [],
        cours: []
      },
      isLoading: false,
      error: null,

      // Actions
      fetchGroupesData: async () => {
        set({ isLoading: true, error: null });
        console.log('AuthHeader :', getAuthHeaders());
        try {
          const response = await fetch(`${API_BASE_URL}/groupe/all`, {
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response}: ${response.statusText}`);
          }
          
          const data: {
            groupes: GroupeDetail[];
            cours: any[];
          } = await response.json();
          console.log("Liste des groupes :", data);
          
          if (data) {
            set({ groupesData: data, isLoading: false });
          } else {
            throw new Error('Erreur lors du chargement des groupes');
          }
        } catch (error) {
          console.error('Erreur lors du fetch des groupes:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },

      fetchGroupes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/groupe`, {
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response}: ${response.statusText}`);
          }
          
          const data: GroupeDetail[] = await response.json();
          console.log("Liste des groupes :", data);
          
          if (data) {
            set({ groupes: data, isLoading: false });
          } else {
            throw new Error('Erreur lors du chargement des groupes');
          }
        } catch (error) {
          console.error('Erreur lors du fetch des groupes:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },

      fetchGroupesBySerie: async (serieId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/groupe/serie/${serieId}`, {
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: GroupeDetail[] = await response.json();
          console.log("Liste des groupes par série :", data);
          
          if (data) {
            // Filtrer les groupes par serieId (comparer avec l'ID de la série)
            const groupesFiltres = Array.isArray(data) ? data.filter(g => 
              typeof g.serieId === 'object' ? g.serieId._id === serieId : g.serieId === serieId
            ) : [];
            set({ groupes: groupesFiltres, isLoading: false });
          } else {
            throw new Error('Erreur lors du chargement des groupes');
          }
        } catch (error) {
          console.error('Erreur lors du fetch des groupes par série:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },

      createGroupe: async (groupeData: CreateGroupeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/groupe`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(groupeData)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: GroupeDetail = await response.json();
          console.log("Groupe créé :", data);
          
          // Recharger automatiquement les groupes pour cette série pour avoir les données complètes
          await get().fetchGroupesBySerie(groupeData.serieId);
          return true;
        } catch (error) {
          console.error('Erreur lors de la création du groupe:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      updateGroupe: async (groupe: Groupe) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/groupe/${groupe._id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(groupe)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: GroupeDetail = await response.json();
          console.log("Groupe mis à jour :", data);
          
          // Recharger automatiquement les groupes pour cette série pour avoir les données complètes
          await get().fetchGroupesBySerie(groupe.serieId);
          return true;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du groupe:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      deleteGroupe: async (id: string, serieId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/groupe/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          // Si on a le serieId, recharger les groupes, sinon juste supprimer localement
          if (serieId) {
            await get().fetchGroupesBySerie(serieId);
          } else {
            // Supprimer le groupe de l'état local
            const { groupes } = get();
            const filteredGroupes = groupes.filter(g => g._id !== id);
            set({ groupes: filteredGroupes, isLoading: false });
          }
          return true;
        } catch (error) {
          console.error('Erreur lors de la suppression du groupe:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'groupe-store',
      partialize: (state) => ({ 
        groupes: state.groupes 
      })
    }
  )
);

// Hooks personnalisés pour faciliter l'utilisation
export const useGroupes = () => {
  const groupes = useGroupeStore(state => state.groupes);
  const isLoading = useGroupeStore(state => state.isLoading);
  const error = useGroupeStore(state => state.error);
  
  return { groupes, isLoading, error };
};

export const useGroupeActions = () => {
  const fetchGroupes = useGroupeStore(state => state.fetchGroupes);
  const fetchGroupesBySerie = useGroupeStore(state => state.fetchGroupesBySerie);
  const createGroupe = useGroupeStore(state => state.createGroupe);
  const updateGroupe = useGroupeStore(state => state.updateGroupe);
  const deleteGroupe = useGroupeStore(state => state.deleteGroupe);
  const clearError = useGroupeStore(state => state.clearError);
  
  return {
    fetchGroupes,
    fetchGroupesBySerie,
    createGroupe,
    updateGroupe,
    deleteGroupe,
    clearError
  };
};

export const useGroupeStats = () => {
  const groupes = useGroupeStore(state => state.groupes);
  console.log("Liste of groupes", groupes);
  const totalGroupes = groupes.length;
  const totalEtudiants = groupes.reduce((total, groupe) => {
    console.log("Groupe", groupe);
    return total + groupe.etudiantIds.length
  }, 0);
  const averageEtudiantsPerGroupe = totalGroupes > 0 ? Math.round(totalEtudiants / totalGroupes) : 0;
  
  return {
    totalGroupes,
    totalEtudiants,
    averageEtudiantsPerGroupe
  };
};
