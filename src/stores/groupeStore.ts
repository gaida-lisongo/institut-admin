import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Groupe, 
  CreateGroupeData, 
  UpdateGroupeData
} from '@/types/groupe';

interface GroupeState {
  groupes: Groupe[];
  loading: boolean;
  error: string | null;

  // Actions CRUD pour les groupes
  fetchGroupes: () => Promise<void>;
  addGroupe: (data: CreateGroupeData) => Promise<void>;
  updateGroupe: (id: string, data: UpdateGroupeData) => Promise<void>;
  deleteGroupe: (id: string) => Promise<void>;
  duplicateGroupe: (id: string) => Promise<void>;
  getGroupeById: (id: string) => Groupe | undefined;
  getGroupeBySlug: (slug: string) => Groupe | undefined;

  // Actions pour la gestion des groupes
  changeGroupeStatut: (id: string, statut: Groupe['statut']) => Promise<void>;
  getGroupeStats: () => {
    totalGroupes: number;
    groupesActifs: number;
    totalParticipants: number;
    moyenneGenerale: number;
    tauxReussite: number;
  };
  generateSlug: (designation: string) => string;

  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearGroupes: () => void;
}

export const useGroupeStore = create<GroupeState>()(
  persist(
    (set, get) => ({
  groupes: [],
  loading: false,
  error: null,

  fetchGroupes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/groupes');
      if (!response.ok) throw new Error('Failed to fetch groupes');
      const groupes = await response.json();
      set({ groupes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addGroupe: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/groupes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create groupe');
      const newGroupe = await response.json();
      set((state) => ({
        groupes: [...state.groupes, newGroupe],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateGroupe: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD persister en backend
      const response = await fetch('/api/groupes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update groupe: ${response.status}`);
      }
      
      const serverGroupe = await response.json();
      console.log('✅ Groupe from store mis à jour avec succès:', updates);
      
      // 2. ENSUITE mettre à jour l'état local avec les données utilisateur
      set((state) => ({
        groupes: state.groupes.map((groupe) =>
          groupe._id === id ? {...groupe, ...updates} : groupe
        ),
        loading: false,
        error: null,
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteGroupe: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/groupes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete groupe');
      set((state) => ({
        groupes: state.groupes.filter((groupe) => groupe._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getGroupeById: (id) => {
    return get().groupes.find((groupe) => groupe._id === id);
  },

  getGroupeBySlug: (slug) => {
    return get().groupes.find((groupe) => 
      groupe.designation.toLowerCase().replace(/\s+/g, '-') === slug
    );
  },

  // Duplication de groupe
  duplicateGroupe: async (id) => {
    set({ loading: true, error: null });
    try {
      const originalGroupe = get().groupes.find(g => g._id === id);
      if (!originalGroupe) throw new Error('Groupe not found');
      
      const { _id, ...duplicatedData } = {
        ...originalGroupe,
        designation: `${originalGroupe.designation} (Copie)`,
        dateCreation: new Date().toISOString(),
        resolutions: [], // Nouveau groupe sans résolutions
      };
      
      const response = await fetch('/api/groupes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedData),
      });
      if (!response.ok) throw new Error('Failed to duplicate groupe');
      const newGroupe = await response.json();
      set((state) => ({
        groupes: [...state.groupes, newGroupe],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Changement de statut
  changeGroupeStatut: async (id, statut) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/groupes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut }),
      });
      if (!response.ok) throw new Error('Failed to update groupe status');
      
      set((state) => ({
        groupes: state.groupes.map((groupe) =>
          groupe._id === id ? { ...groupe, statut } : groupe
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Statistiques des groupes
  getGroupeStats: () => {
    const { groupes } = get();
    const totalGroupes = groupes.length;
    const groupesActifs = groupes.filter(g => g.statut === 'ouvert').length;
    const totalParticipants = groupes.reduce((sum, g) => sum + (g.resolutions?.length || 0), 0);
    
    // Calcul de la moyenne générale
    let totalNotes = 0;
    let nombreNotes = 0;
    groupes.forEach(groupe => {
      groupe.resolutions?.forEach(resolution => {
        if (resolution.note !== undefined && resolution.note !== null) {
          totalNotes += resolution.note;
          nombreNotes++;
        }
      });
    });
    const moyenneGenerale = nombreNotes > 0 ? Math.round((totalNotes / nombreNotes) * 10) / 10 : 0;
    
    // Calcul du taux de réussite (notes >= 10)
    let notesReussies = 0;
    groupes.forEach(groupe => {
      groupe.resolutions?.forEach(resolution => {
        if (resolution.note !== undefined && resolution.note >= 10) {
          notesReussies++;
        }
      });
    });
    const tauxReussite = nombreNotes > 0 ? Math.round((notesReussies / nombreNotes) * 100) : 0;
    
    return {
      totalGroupes,
      groupesActifs,
      totalParticipants,
      moyenneGenerale,
      tauxReussite
    };
  },

  // Génération de slug
  generateSlug: (designation) => {
    return designation
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplace espaces par tirets
      .replace(/-+/g, '-') // Supprime tirets multiples
      .trim();
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearGroupes: () => set({ groupes: [], error: null }),
    }),
    {
      name: 'groupe-storage',
      partialize: (state) => ({ groupes: state.groupes }),
      version: 1,
    }
  )
);
