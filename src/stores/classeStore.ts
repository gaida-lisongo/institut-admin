import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Classe } from '@/types/student';
import { CLASSES_PAR_DEFAUT } from '@/config/education';

interface ClasseStore {
  classes: Classe[];
  loading: boolean;
  error: string | null;
  
  // Actions CRUD
  fetchClasses: () => Promise<void>;
  addClasse: (classe: Omit<Classe, '_id'>) => Promise<void>;
  updateClasse: (id: string, classe: Partial<Omit<Classe, '_id'>>) => Promise<void>;
  deleteClasse: (id: string) => Promise<void>;
  getClasseById: (id: string) => Classe | undefined;
  getClassesByNiveau: (niveau: string) => Classe[];
  
  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearClasses: () => void;
  initializeDefaultClasses: () => Promise<void>;
}

export const useClasseStore = create<ClasseStore>()(
  persist(
    (set, get) => ({
  classes: [],
  loading: false,
  error: null,

  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const classes = await response.json();
      set({ classes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addClasse: async (classeData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classeData),
      });
      if (!response.ok) throw new Error('Failed to create classe');
      const newClasse = await response.json();
      set((state) => ({
        classes: [...state.classes, newClasse],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateClasse: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD persister en backend
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update classe: ${response.status}`);
      }
      
      const serverClasse = await response.json();
      console.log('✅ Classe from store mise à jour avec succès:', updates);
      // 2. ENSUITE mettre à jour l'état local avec les données du serveur
      set((state) => ({
        classes: state.classes.map((classe) =>
          classe._id === id ? {...classe, ...updates} : classe
        ),
        loading: false,
        error: null,
      }));
      
      console.log('✅ Classe mise à jour avec succès:', serverClasse);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteClasse: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/classes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete classe');
      set((state) => ({
        classes: state.classes.filter((classe) => classe._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getClasseById: (id) => {
    return get().classes.find((classe) => classe._id === id);
  },

  getClassesByNiveau: (niveau) => {
    return get().classes.filter((classe) => classe.niveau === niveau);
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearClasses: () => set({ classes: [], error: null }),

  initializeDefaultClasses: async () => {
    const { classes, fetchClasses } = get();
    
    if (classes.length === 0) {
      try {
        await fetchClasses();
        const { classes: updatedClasses } = get();
        
        if (updatedClasses.length === 0) {
          // Créer les classes par défaut via l'API
          const promises = CLASSES_PAR_DEFAUT.flatMap(({ niveau, classes: classesNiveau }) =>
            classesNiveau.map(nomClasse =>
              fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: nomClasse, niveau }),
              })
            )
          );
          
          await Promise.all(promises);
          await fetchClasses(); // Recharger après création
        }
      } catch (error) {
        set({ error: (error as Error).message });
      }
    }
  },
    }),
    {
      name: 'classe-storage',
      partialize: (state) => ({ classes: state.classes }),
      version: 1,
    }
  )
);
