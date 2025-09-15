import { create } from 'zustand';
import { Produit, ProduitWithDetails, ProduitFormData } from '@/services/ProduitService';
import ProduitService from '@/services/ProduitService';

interface ProduitState {
  produits: ProduitWithDetails[];
  currentProduit: ProduitWithDetails | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProduits: () => Promise<void>;
  fetchProduitById: (id: string) => Promise<void>;
  fetchProduitsByCategorie: (categorie: string) => Promise<void>;
  fetchProduitByAnneeAndSection: (anneeId: string, sectionId: string) => Promise<void>;
  createProduit: (data: ProduitFormData) => Promise<void>;
  updateProduit: (id: string, data: Partial<ProduitFormData>) => Promise<void>;
  deleteProduit: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentProduit: () => void;
}

export const useProduitStore = create<ProduitState>((set, get) => ({
  produits: [],
  currentProduit: null,
  loading: false,
  error: null,

  fetchProduits: async () => {
    set({ loading: true, error: null });
    try {
      const produits = await ProduitService.getProduits();
      set({ produits, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits', 
        loading: false 
      });
    }
  },

  fetchProduitById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const produit = await ProduitService.getProduit(id);
      set({ currentProduit: produit, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du produit', 
        loading: false 
      });
    }
  },

  fetchProduitsByCategorie: async (categorie: string) => {
    set({ loading: true, error: null });
    try {
      const produits = await ProduitService.getProduitsByCategorie(categorie);
      set({ produits, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits par catégorie', 
        loading: false 
      });
    }
  },

  fetchProduitByAnneeAndSection: async (anneeId: string, sectionId: string) => {
    set({ loading: true, error: null });
    try {
      const produits = await ProduitService.getProduitByAnneeAndSection(anneeId, sectionId);
      set({ produits, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du produit par année et section', 
        loading: false 
      });
    }
  },

  createProduit: async (data: ProduitFormData) => {
    set({ loading: true, error: null });
    try {
      const newProduit = await ProduitService.createProduit(data);
      
      // Recharger les produits pour avoir les détails complets
      if (data.categorie.includes('sujet')) {
        get().fetchProduitsByCategorie('sujet');
      } else if (data.categorie.includes('stage')) {
        get().fetchProduitsByCategorie('stage');
      } else {
        get().fetchProduits();
      }
      
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création du produit', 
        loading: false 
      });
      throw error;
    }
  },

  updateProduit: async (id: string, data: Partial<ProduitFormData>) => {
    set({ loading: true, error: null });
    try {
      const updatedProduit = await ProduitService.updateProduit(id, data);
      const { produits } = get();
      set({ 
        produits: produits.map(produit => 
          produit._id === id ? updatedProduit : produit
        ),
        currentProduit: updatedProduit,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du produit', 
        loading: false 
      });
      throw error;
    }
  },

  deleteProduit: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await ProduitService.deleteProduit(id);
      const { produits } = get();
      set({ 
        produits: produits.filter(produit => produit._id !== id),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du produit', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentProduit: () => {
    set({ currentProduit: null });
  },
}));