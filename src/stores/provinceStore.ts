import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Province, ProvinceFormData } from '@/types/province';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

interface ProvinceState {
  // État des données
  provinces: Province[];
  currentProvince: Province | null;
  loading: boolean;
  error: string | null;

  // Actions CRUD
  fetchProvinces: () => Promise<void>;
  getProvinceById: (id: string) => Promise<Province | null>;
  getProvinceByCode: (code: string) => Promise<Province | null>;
  createProvince: (data: ProvinceFormData) => Promise<Province | null>;
  updateProvince: (id: string, data: ProvinceFormData) => Promise<Province | null>;
  deleteProvince: (id: string) => Promise<boolean>;
  
  // Actions utilitaires
  clearError: () => void;
  setCurrentProvince: (province: Province | null) => void;
}

export const useProvinceStore = create<ProvinceState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        provinces: [],
        currentProvince: null,
        loading: false,
        error: null,

        // Récupérer toutes les provinces
        fetchProvinces: async () => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces`);
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Erreur lors de la récupération des provinces');
            }

            if (result.success) {
              set({ 
                provinces: result.data || [], 
                loading: false 
              });
            } else {
              throw new Error(result.message || 'Erreur lors de la récupération des provinces');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
          }
        },

        // Récupérer une province par ID
        getProvinceById: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces/${id}`);
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Province non trouvée');
            }

            if (result.success && result.data) {
              set({ 
                currentProvince: result.data,
                loading: false 
              });
              return result.data;
            } else {
              throw new Error(result.message || 'Province non trouvée');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false,
              currentProvince: null
            });
            return null;
          }
        },

        // Récupérer une province par code
        getProvinceByCode: async (code: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces/code/${code}`);
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Province non trouvée');
            }

            if (result.success && result.data) {
              set({ 
                currentProvince: result.data,
                loading: false 
              });
              return result.data;
            } else {
              throw new Error(result.message || 'Province non trouvée');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false,
              currentProvince: null
            });
            return null;
          }
        },

        // Créer une nouvelle province
        createProvince: async (data: ProvinceFormData) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Erreur lors de la création de la province');
            }

            if (result.success && result.data) {
              // Ajouter la nouvelle province à la liste locale
              set((state) => ({
                provinces: [...state.provinces, result.data],
                loading: false
              }));
              return result.data;
            } else {
              throw new Error(result.message || 'Erreur lors de la création de la province');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
            return null;
          }
        },

        // Mettre à jour une province
        updateProvince: async (id: string, data: ProvinceFormData) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Erreur lors de la mise à jour de la province');
            }

            if (result.success && result.data) {
              // Mettre à jour la province dans la liste locale
              set((state) => ({
                provinces: state.provinces.map(province => 
                  province._id === id ? result.data : province
                ),
                currentProvince: state.currentProvince?._id === id ? result.data : state.currentProvince,
                loading: false
              }));
              return result.data;
            } else {
              throw new Error(result.message || 'Erreur lors de la mise à jour de la province');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
            return null;
          }
        },

        // Supprimer une province
        deleteProvince: async (id: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${API_URL}/provinces/${id}`, {
              method: 'DELETE',
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.message || 'Erreur lors de la suppression de la province');
            }

            if (result.success) {
              // Supprimer la province de la liste locale
              set((state) => ({
                provinces: state.provinces.filter(province => province._id !== id),
                currentProvince: state.currentProvince?._id === id ? null : state.currentProvince,
                loading: false
              }));
              return true;
            } else {
              throw new Error(result.message || 'Erreur lors de la suppression de la province');
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
            return false;
          }
        },

        // Effacer les erreurs
        clearError: () => set({ error: null }),

        // Définir la province courante
        setCurrentProvince: (province: Province | null) => set({ currentProvince: province }),
      }),
      {
        name: 'province-store',
        partialize: (state) => ({ 
          provinces: state.provinces,
          currentProvince: state.currentProvince 
        }),
      }
    ),
    {
      name: 'province-store',
    }
  )
);
