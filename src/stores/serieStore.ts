import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Interface pour les questions d'une série
export interface Question {
  _id: string;
  enonce: string;
  assertions: string[];
  reponse: string;
  pts: number;
}

// Interface pour créer une question (sans _id)
export interface CreateQuestionData {
  enonce: string;
  assertions: string[];
  reponse: string;
  pts: number;
}

// Interface pour les séries
export interface Serie {
  _id: string;
  coursId: string;
  questions: Question[];
}

// Interface pour créer une série (sans _id)
export interface CreateSerieData {
  coursId: string;
  questions: CreateQuestionData[];
}

// Interface pour la réponse API
export interface SerieResponse {
  success: boolean;
  message: string;
  data?: Serie | Serie[];
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

// Interface du store
interface SerieStore {
  // État
  series: Serie[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSeriesByCours: (coursId: string) => Promise<void>;
  createSerie: (serieData: CreateSerieData) => Promise<boolean>;
  updateSerie: (serie: Serie) => Promise<boolean>;
  deleteSerie: (id: string) => Promise<boolean>;
  clearError: () => void;
  
  // Actions locales (pour la gestion d'état)
  addSerieLocal: (serie: Serie) => void;
  updateSerieLocal: (serie: Serie) => void;
  deleteSerieLocal: (id: string) => void;
}

// Store Zustand avec persistance
export const useSerieStore = create<SerieStore>()(
  persist(
    (set, get) => ({
      // État initial
      series: [],
      isLoading: false,
      error: null,

      // Actions
      fetchSeriesByCours: async (coursId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/serie/cours/${coursId}`, {
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: SerieResponse = await response.json();
          
          if (data.success && data.data) {
            const series = Array.isArray(data.data) ? data.data : [data.data];
            set({ series, isLoading: false });
          } else {
            throw new Error(data.message || 'Erreur lors du chargement des séries');
          }
        } catch (error) {
          console.error('Erreur lors du fetch des séries:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },

      createSerie: async (serieData: CreateSerieData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/serie`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(serieData)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: SerieResponse = await response.json();
          
          if (data.success && data.data && !Array.isArray(data.data)) {
            get().addSerieLocal(data.data);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(data.message || 'Erreur lors de la création de la série');
          }
        } catch (error) {
          console.error('Erreur lors de la création de la série:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      updateSerie: async (serie: Serie) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/serie/${serie._id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(serie)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: SerieResponse = await response.json();
          
          if (data.success && data.data && !Array.isArray(data.data)) {
            get().updateSerieLocal(data.data);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(data.message || 'Erreur lors de la mise à jour de la série');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la série:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      deleteSerie: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/serie/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
          
          const data: SerieResponse = await response.json();
          
          if (data.success) {
            get().deleteSerieLocal(id);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(data.message || 'Erreur lors de la suppression de la série');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de la série:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),

      // Actions locales
      addSerieLocal: (serie: Serie) => {
        const { series } = get();
        set({ series: [...series, serie] });
      },

      updateSerieLocal: (updatedSerie: Serie) => {
        const { series } = get();
        const updatedSeries = series.map(serie => 
          serie._id === updatedSerie._id ? updatedSerie : serie
        );
        set({ series: updatedSeries });
      },

      deleteSerieLocal: (id: string) => {
        const { series } = get();
        const filteredSeries = series.filter(serie => serie._id !== id);
        set({ series: filteredSeries });
      }
    }),
    {
      name: 'serie-store',
      partialize: (state) => ({ 
        series: state.series 
      })
    }
  )
);

// Hooks personnalisés pour faciliter l'utilisation
export const useSeries = () => {
  const series = useSerieStore(state => state.series);
  const isLoading = useSerieStore(state => state.isLoading);
  const error = useSerieStore(state => state.error);
  
  return { series, isLoading, error };
};

export const useSerieActions = () => {
  const fetchSeriesByCours = useSerieStore(state => state.fetchSeriesByCours);
  const createSerie = useSerieStore(state => state.createSerie);
  const updateSerie = useSerieStore(state => state.updateSerie);
  const deleteSerie = useSerieStore(state => state.deleteSerie);
  const clearError = useSerieStore(state => state.clearError);
  
  return {
    fetchSeriesByCours,
    createSerie,
    updateSerie,
    deleteSerie,
    clearError
  };
};

export const useSerieStats = () => {
  const series = useSerieStore(state => state.series);
  
  const totalSeries = series.length;
  const totalQuestions = series.reduce((total, serie) => total + serie.questions.length, 0);
  const averageQuestionsPerSerie = totalSeries > 0 ? Math.round(totalQuestions / totalSeries) : 0;
  
  return {
    totalSeries,
    totalQuestions,
    averageQuestionsPerSerie
  };
};
