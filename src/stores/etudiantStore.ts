import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Etudiant, EtudiantWithClasse } from '@/types/student';

interface EtudiantStore {
  etudiants: Etudiant[];
  loading: boolean;
  error: string | null;
  
  // Actions CRUD
  fetchEtudiants: () => Promise<void>;
  addEtudiant: (etudiant: Omit<Etudiant, '_id'>) => Promise<void>;
  updateEtudiant: (id: string, etudiant: Partial<Omit<Etudiant, '_id'>>) => Promise<void>;
  deleteEtudiant: (id: string) => Promise<void>;
  getEtudiantById: (id: string) => Etudiant | undefined;
  getEtudiantsByClasse: (classeId: string) => Etudiant[];
  
  // Actions pour import/export CSV
  importFromCSV: (csvData: string) => Promise<void>;
  exportToCSV: () => string;
  
  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearEtudiants: () => void;
}

export const useEtudiantStore = create<EtudiantStore>()(
  persist(
    (set, get) => ({
  etudiants: [],
  loading: false,
  error: null,

  fetchEtudiants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/etudiants');
      if (!response.ok) throw new Error('Failed to fetch etudiants');
      const etudiants = await response.json();
      set({ etudiants, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addEtudiant: async (etudiantData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/etudiants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(etudiantData),
      });
      if (!response.ok) throw new Error('Failed to create etudiant');
      const newEtudiant = await response.json();
      set((state) => ({
        etudiants: [...state.etudiants, newEtudiant],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateEtudiant: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD persister en backend
      const response = await fetch('/api/etudiants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update etudiant: ${response.status}`);
      }
      
      const serverEtudiant = await response.json();
      console.log('✅ Étudiant from store mis à jour avec succès:', updates);
      
      // 2. ENSUITE mettre à jour l'état local avec les données utilisateur
      set((state) => ({
        etudiants: state.etudiants.map((etudiant) =>
          etudiant._id === id ? {...etudiant, ...updates} : etudiant
        ),
        loading: false,
        error: null,
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteEtudiant: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/etudiants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete etudiant');
      set((state) => ({
        etudiants: state.etudiants.filter((etudiant) => etudiant._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getEtudiantById: (id) => {
    return get().etudiants.find((etudiant) => etudiant._id === id);
  },

  getEtudiantsByClasse: (classeId) => {
    return get().etudiants.filter((etudiant) => etudiant.classeId === classeId);
  },

  importFromCSV: async (csvData) => {
    try {
      set({ loading: true, error: null });
      
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Vérifier que les colonnes requises sont présentes
      const requiredColumns = ['nom', 'prenom', 'email', 'sexe', 'classeId'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
      }
      
      const promises = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          console.warn(`Ligne ${i + 1} ignorée: nombre de colonnes incorrect`);
          continue;
        }
        
        const etudiantData: Omit<Etudiant, '_id'> = {
          nom: '',
          prenom: '',
          email: '',
          sexe: '',
          classeId: '',
        };
        
        headers.forEach((header, index) => {
          if (header in etudiantData) {
            (etudiantData as any)[header] = values[index];
          }
        });
        
        // Validation basique
        if (etudiantData.nom && etudiantData.prenom && etudiantData.email) {
          promises.push(
            fetch('/api/etudiants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(etudiantData),
            })
          );
        }
      }
      
      await Promise.all(promises);
      await get().fetchEtudiants(); // Recharger les données
      
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'import CSV',
      });
    }
  },

  exportToCSV: () => {
    const { etudiants } = get();
    
    if (etudiants.length === 0) {
      return '';
    }
    
    const headers = ['_id', 'nom', 'prenom', 'email', 'sexe', 'classeId'];
    const csvContent = [
      headers.join(','),
      ...etudiants.map(etudiant =>
        headers.map(header => etudiant[header as keyof Etudiant]).join(',')
      ),
    ].join('\n');
    
    return csvContent;
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearEtudiants: () => set({ etudiants: [], error: null }),
    }),
    {
      name: 'etudiant-storage',
      partialize: (state) => ({ etudiants: state.etudiants }),
      version: 1,
    }
  )
);
