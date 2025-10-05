import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Interface pour les étudiants
export interface Etudiant {
  _id: string;
  nom: string;
  prenom: string;
  post_nom: string;
  matricule: string;
  password: string;
}

// Interface pour créer un étudiant (sans _id)
export interface CreateEtudiantData {
  nom: string;
  prenom: string;
  post_nom: string;
  matricule: string;
  password: string;
}

// Interface pour l'import CSV
export interface EtudiantCSVData {
  nom: string;
  prenom: string;
  post_nom: string;
  matricule: string;
  password?: string; // Optionnel, sera généré si absent
}

// Interface pour la réponse API
export interface EtudiantResponse {
  success: boolean;
  message: string;
  data?: Etudiant | Etudiant[];
  count?: number;
}

// Helper pour les headers d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper pour générer un mot de passe simple
const generatePassword = (nom: string, prenom: string) => {
  return `${nom.toLowerCase()}${prenom.toLowerCase()}123`;
};

// Interface du store
interface EtudiantStore {
  // État
  etudiants: Etudiant[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEtudiants: () => Promise<void>;
  createEtudiant: (etudiantData: CreateEtudiantData) => Promise<Etudiant | null>;
  createMultipleEtudiants: (etudiantsData: CreateEtudiantData[]) => Promise<Etudiant[]>;
  updateEtudiant: (etudiant: Etudiant) => Promise<boolean>;
  deleteEtudiant: (id: string) => Promise<boolean>;
  importFromCSV: (csvData: EtudiantCSVData[]) => Promise<Etudiant[]>;
  clearError: () => void;
  
  // Actions locales (pour la gestion d'état)
  addEtudiantLocal: (etudiant: Etudiant) => void;
  addMultipleEtudiantsLocal: (etudiants: Etudiant[]) => void;
  updateEtudiantLocal: (etudiant: Etudiant) => void;
  deleteEtudiantLocal: (id: string) => void;
}

// Store Zustand avec persistance
export const useEtudiantStore = create<EtudiantStore>()(
  persist(
    (set, get) => ({
      // État initial
      etudiants: [],
      isLoading: false,
      error: null,

      // Actions
      fetchEtudiants: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/etudiant/`, {
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: Etudiant[] = await response.json();
          console.log("Liste des étudiants :", data);
          
          if (data) {
            const etudiants = Array.isArray(data) ? data : [data];
            set({ etudiants, isLoading: false });
          } else {
            throw new Error('Erreur lors du chargement des étudiants');
          }
        } catch (error) {
          console.error('Erreur lors du fetch des étudiants:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },

      createEtudiant: async (etudiantData: CreateEtudiantData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/etudiant`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(etudiantData)
          });
          
          const data: Etudiant = await response.json();
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          } else {            
            get().addEtudiantLocal(data);
            set({ isLoading: false });
            return data;
          }
        } catch (error) {
          console.error('Erreur lors de la création de l\'étudiant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return null;
        }
      },

      createMultipleEtudiants: async (etudiantsData: CreateEtudiantData[]) => {
        set({ isLoading: true, error: null });
        const createdEtudiants: Etudiant[] = [];
        
        try {
          // Créer les étudiants un par un
          for (const etudiantData of etudiantsData) {
            const response = await fetch(`${API_BASE_URL}/etudiant`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(etudiantData)
            });
            
            if (!response.ok) {
              throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            
            const data: Etudiant = await response.json();
            createdEtudiants.push(data);
          }
          
          get().addMultipleEtudiantsLocal(createdEtudiants);
          set({ isLoading: false });
          return createdEtudiants;
        } catch (error) {
          console.error('Erreur lors de la création multiple des étudiants:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return createdEtudiants; // Retourner ceux qui ont été créés avec succès
        }
      },

      updateEtudiant: async (etudiant: Etudiant) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/etudiant/${etudiant._id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(etudiant)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: Etudiant = await response.json();
          console.log("Étudiant mis à jour :", data);
          
          if (data) {
            get().updateEtudiantLocal(data);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error('Erreur lors de la mise à jour de l\'étudiant');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      deleteEtudiant: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/etudiant/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          get().deleteEtudiantLocal(id);
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'étudiant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      importFromCSV: async (csvData: EtudiantCSVData[]) => {
        set({ isLoading: true, error: null });
        
        try {
          // Convertir les données CSV en CreateEtudiantData
          const etudiantsData: CreateEtudiantData[] = csvData.map(item => ({
            nom: item.nom,
            prenom: item.prenom,
            post_nom: item.post_nom,
            matricule: item.matricule,
            password: item.password || generatePassword(item.nom, item.prenom)
          }));
          
          // Créer les étudiants
          const createdEtudiants = await get().createMultipleEtudiants(etudiantsData);
          return createdEtudiants;
        } catch (error) {
          console.error('Erreur lors de l\'import CSV:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de l\'import CSV',
            isLoading: false 
          });
          return [];
        }
      },

      clearError: () => set({ error: null }),

      // Actions locales
      addEtudiantLocal: (etudiant: Etudiant) => {
        const { etudiants } = get();
        set({ etudiants: [...etudiants, etudiant] });
      },

      addMultipleEtudiantsLocal: (newEtudiants: Etudiant[]) => {
        const { etudiants } = get();
        set({ etudiants: [...etudiants, ...newEtudiants] });
      },

      updateEtudiantLocal: (updatedEtudiant: Etudiant) => {
        const { etudiants } = get();
        const updatedEtudiants = etudiants.map(etudiant => 
          etudiant._id === updatedEtudiant._id ? updatedEtudiant : etudiant
        );
        set({ etudiants: updatedEtudiants });
      },

      deleteEtudiantLocal: (id: string) => {
        const { etudiants } = get();
        const filteredEtudiants = etudiants.filter(etudiant => etudiant._id !== id);
        set({ etudiants: filteredEtudiants });
      }
    }),
    {
      name: 'etudiant-store',
      partialize: (state) => ({ 
        etudiants: state.etudiants 
      })
    }
  )
);

// Hooks personnalisés pour faciliter l'utilisation
export const useEtudiants = () => {
  const etudiants = useEtudiantStore(state => state.etudiants);
  const isLoading = useEtudiantStore(state => state.isLoading);
  const error = useEtudiantStore(state => state.error);
  
  return { etudiants, isLoading, error };
};

export const useEtudiantActions = () => {
  const fetchEtudiants = useEtudiantStore(state => state.fetchEtudiants);
  const createEtudiant = useEtudiantStore(state => state.createEtudiant);
  const createMultipleEtudiants = useEtudiantStore(state => state.createMultipleEtudiants);
  const updateEtudiant = useEtudiantStore(state => state.updateEtudiant);
  const deleteEtudiant = useEtudiantStore(state => state.deleteEtudiant);
  const importFromCSV = useEtudiantStore(state => state.importFromCSV);
  const clearError = useEtudiantStore(state => state.clearError);
  
  return {
    fetchEtudiants,
    createEtudiant,
    createMultipleEtudiants,
    updateEtudiant,
    deleteEtudiant,
    importFromCSV,
    clearError
  };
};

export const useEtudiantStats = () => {
  const etudiants = useEtudiantStore(state => state.etudiants);
  
  const totalEtudiants = etudiants.length;
  
  return {
    totalEtudiants
  };
};

// Utilitaires pour CSV
export const parseCSV = (csvContent: string): EtudiantCSVData[] => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: EtudiantCSVData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 4) {
      data.push({
        nom: values[0] || '',
        prenom: values[1] || '',
        post_nom: values[2] || '',
        matricule: values[3] || '',
        password: values[4] || undefined
      });
    }
  }
  
  return data;
};

export const generateCSVTemplate = (): string => {
  const headers = ['nom', 'prenom', 'post_nom', 'matricule', 'password'];
  const example = ['Doe', 'John', 'Junior', 'MAT001', 'doejohn123'];
  
  return [headers.join(','), example.join(',')].join('\n');
};
