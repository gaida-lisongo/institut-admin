import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cours } from '@/types/session';

interface CoursStore {
  cours: Cours[];
  loading: boolean;
  error: string | null;
  
  // Actions CRUD
  fetchCours: () => Promise<void>;
  addCours: (cours: Omit<Cours, '_id'>) => Promise<void>;
  updateCours: (id: string, cours: Partial<Omit<Cours, '_id'>>) => Promise<void>;
  deleteCours: (id: string) => Promise<void>;
  getCoursById: (id: string) => Cours | undefined;
  getCoursByUnite: (unite: string) => Cours[];
  
  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCours: () => void;
  initializeDefaultCours: () => Promise<void>;
}

export const useCoursStore = create<CoursStore>()(
  persist(
    (set, get) => ({
  cours: [],
  loading: false,
  error: null,

  fetchCours: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cours');
      if (!response.ok) throw new Error('Failed to fetch cours');
      const cours = await response.json();
      set({ cours, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addCours: async (coursData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursData),
      });
      if (!response.ok) throw new Error('Failed to create cours');
      const newCours = await response.json();
      set((state) => ({
        cours: [...state.cours, newCours],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCours: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD persister en backend
      const response = await fetch('/api/cours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update cours: ${response.status}`);
      }
      
      const serverCours = await response.json();
      console.log('✅ Cours from store mis à jour avec succès:', updates);
      
      // 2. ENSUITE mettre à jour l'état local avec les données utilisateur
      set((state) => ({
        cours: state.cours.map((cours) =>
          cours._id === id ? {...cours, ...updates} : cours
        ),
        loading: false,
        error: null,
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteCours: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cours', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete cours');
      set((state) => ({
        cours: state.cours.filter((cours) => cours._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getCoursById: (id) => {
    return get().cours.find((cours) => cours._id === id);
  },

  getCoursByUnite: (unite) => {
    return get().cours.filter((cours) => cours.unite === unite);
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearCours: () => set({ cours: [], error: null }),

  initializeDefaultCours: async () => {
    const { cours, fetchCours } = get();
    
    if (cours.length === 0) {
      try {
        await fetchCours();
        const { cours: updatedCours } = get();
        
        if (updatedCours.length === 0) {
          const defaultCours = [
            { designation: 'Mathématiques', credit: 4, unite: 'Sciences' },
            { designation: 'Français', credit: 4, unite: 'Lettres' },
            { designation: 'Histoire-Géographie', credit: 3, unite: 'Sciences Humaines' },
            { designation: 'Anglais', credit: 3, unite: 'Langues' },
            { designation: 'Physique-Chimie', credit: 4, unite: 'Sciences' },
            { designation: 'SVT', credit: 3, unite: 'Sciences' },
            { designation: 'Philosophie', credit: 2, unite: 'Lettres' },
            { designation: 'EPS', credit: 2, unite: 'Sport' },
          ];
          
          const promises = defaultCours.map(cours =>
            fetch('/api/cours', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cours),
            })
          );
          
          await Promise.all(promises);
          await fetchCours(); // Recharger après création
        }
      } catch (error) {
        set({ error: (error as Error).message });
      }
    }
  },
    }),
    {
      name: 'cours-storage',
      partialize: (state) => ({ cours: state.cours }),
      version: 1,
    }
  )
);
