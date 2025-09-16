"use client";

import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { useProduitStore } from "../../stores/produitStore";
import { useSectionStore } from "../../stores/sectionStore";
import { useAnneeStore } from "../../stores/anneeStore";
import { useCommandeStore } from "../../stores/commandeStore";
import type { ProduitWithDetails } from "../../services/ProduitService";
import type { Commande } from "../../services/CommandeService";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

// Types pour les filtres
interface ProductFilterState {
  search: string;
  categorie: string;
  sectionId: string;
  anneeId: string;
  montantMin: number;
  montantMax: number;
}

export default function ProductList() {
  // Store Zustand pour les produits
  const { 
    produits, 
    loading: isLoading, 
    error, 
    fetchProduits, 
    deleteProduit,
    clearError 
  } = useProduitStore();
  
  // Autres stores
  const { sections, fetchSections } = useSectionStore();
  const { annees, fetchAnnees } = useAnneeStore();
  const { 
    commandes, 
    isLoading: isLoadingCommandes, 
    fetchCommandes
  } = useCommandeStore();

  // États des filtres
  const [filters, setFilters] = useState<ProductFilterState>({
    search: '',
    categorie: '',
    sectionId: '',
    anneeId: '',
    montantMin: 0,
    montantMax: 100000,
  });

  // États pour l'UI
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProduitWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCommandesModal, setShowCommandesModal] = useState(false);
  const [productCommandes, setProductCommandes] = useState<Commande[]>([]);

  // Charger les données initiales
  useEffect(() => {
    fetchProduits();
    fetchSections();
    fetchAnnees();
    fetchCommandes();
  }, [fetchProduits, fetchSections, fetchAnnees, fetchCommandes]);

  // Filtrer les produits
  const getFilteredProduits = (): ProduitWithDetails[] => {
    let filtered = [...produits];

    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(produit => 
        produit.designation.toLowerCase().includes(searchTerm) ||
        produit.categorie.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        (typeof produit.sectionId === 'object' && 
         produit.sectionId.description?.sigle.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre par catégorie
    if (filters.categorie) {
      filtered = filtered.filter(produit => 
        produit.categorie.includes(filters.categorie)
      );
    }

    // Filtre par section
    if (filters.sectionId) {
      filtered = filtered.filter(produit => {
        const sectionId = typeof produit.sectionId === 'object' 
          ? produit.sectionId._id 
          : produit.sectionId;
        return sectionId === filters.sectionId;
      });
    }

    // Filtre par année
    if (filters.anneeId) {
      filtered = filtered.filter(produit => {
        const anneeId = typeof produit.anneeId === 'object' 
          ? produit.anneeId._id 
          : produit.anneeId;
        return anneeId === filters.anneeId;
      });
    }

    // Filtre par montant
    filtered = filtered.filter(produit => 
      produit.montant >= filters.montantMin && 
      produit.montant <= filters.montantMax
    );

    return filtered;
  };

  // Gestion des filtres
  const handleFilterChange = (key: keyof ProductFilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categorie: '',
      sectionId: '',
      anneeId: '',
      montantMin: 0,
      montantMax: 100000,
    });
  };

  // Obtenir le nom de la section
  const getSectionName = (sectionId: string | object) => {
    if (typeof sectionId === 'string') {
        const findSection = sections.find(s => s._id === sectionId);
        return findSection ? findSection.description?.sigle || 'N/A' : 'N/A';
    }
    // const section = sections.find(s => s._id === sectionId);
    // return section?.description?.sigle || 'N/A';
  };

  // Obtenir la période de l'année
  const getAnneePeriode = (anneeId: string) => {
    // if (typeof anneeId === 'object') {
    //   return `${anneeId.debut}-${anneeId.fin}`;
    // }
    const annee = annees.find(a => a._id === anneeId);
    return annee ? `${annee.debut}-${annee.fin}` : 'N/A';
  };

  // Obtenir toutes les catégories uniques
  const getAllCategories = (): string[] => {
    const categories = new Set<string>();
    produits.forEach(produit => {
      produit.categorie.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  };

  // Fonctions pour gérer les commandes d'un produit
  const handleViewCommandes = (produit: ProduitWithDetails) => {
    // Filtrer les commandes pour ce produit
    const productCommandes = commandes.filter(commande => commande.productId === produit._id);
    setProductCommandes(productCommandes);
    setSelectedProduct(produit);
    setShowCommandesModal(true);
  };

  // Obtenir le badge de statut pour une commande
  const getStatusBadge = (status: 'NO' | 'PENDING' | 'OK') => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approuvée
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'NO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            Inconnu
          </span>
        );
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Obtenir le nombre de commandes pour un produit
  const getCommandeCount = (productId: string) => {
    return commandes.filter(commande => commande.productId === productId).length;
  };

  const filteredProduits = getFilteredProduits();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header avec titre et actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des Produits
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion et consultation des produits disponibles
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredProduits.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Produits affichés
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {produits.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total produits
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getAllCategories().length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Catégories
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {filteredProduits.length > 0 
              ? Math.round(filteredProduits.reduce((sum, p) => sum + p.montant, 0) / filteredProduits.length)
              : 0
            } FC
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Prix moyen
          </div>
        </div>
      </div>

      {/* Panel de filtres */}
      {showFiltersPanel && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recherche
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                value={filters.categorie}
                onChange={(e) => handleFilterChange('categorie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                {getAllCategories().map((categorie) => (
                  <option key={categorie} value={categorie}>
                    {categorie}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section
              </label>
              <select
                value={filters.sectionId}
                onChange={(e) => handleFilterChange('sectionId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes les sections</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.description?.sigle} - {section.description?.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Année */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année
              </label>
              <select
                value={filters.anneeId}
                onChange={(e) => handleFilterChange('anneeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Toutes les années</option>
                {annees
                  .sort((a, b) => b.fin - a.fin)
                  .map((annee) => (
                    <option key={annee._id} value={annee._id}>
                      {annee.debut}-{annee.fin}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Filtre de prix */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fourchette de prix (FC)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={filters.montantMin}
                onChange={(e) => handleFilterChange('montantMin', parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <span className="text-gray-500">à</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.montantMax}
                onChange={(e) => handleFilterChange('montantMax', parseInt(e.target.value) || 100000)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Actions du panel de filtres */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des produits...</p>
        </div>
      )}

      {/* Table des produits */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Année
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredProduits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun produit trouvé pour les critères sélectionnés
                  </td>
                </tr>
              ) : (
                filteredProduits.map((produit) => (
                  <tr key={produit._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {produit.image && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={produit.image}
                            alt={produit.designation}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {produit.designation}
                          </div>
                          {produit.caracteristiques.length > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {produit.caracteristiques.slice(0, 2).join(', ')}
                              {produit.caracteristiques.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {produit.categorie.slice(0, 2).map((cat, index) => (
                          <Badge
                            key={index}
                            variant="light"
                            // className={CATEGORY_COLORS[cat] || CATEGORY_COLORS.default}
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {cat}
                          </Badge>
                        ))}
                        {produit.categorie.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{produit.categorie.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getSectionName(produit.sectionId)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getAnneePeriode(typeof produit.anneeId === 'object' ? produit.anneeId._id : produit.anneeId)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1 text-green-500" />
                        {produit.montant.toLocaleString()} FC
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(produit);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewCommandes(produit)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title={`Voir les commandes (${getCommandeCount(produit._id!)})`}
                        >
                          <ShoppingCartIcon className="w-4 h-4" />
                          <span className="ml-1 text-xs">
                            {getCommandeCount(produit._id!)}
                          </span>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-800">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="flex items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Détails du produit
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      {selectedProduct.image && (
                        <div>
                          <img
                            className="w-full h-32 object-cover rounded-lg"
                            src={selectedProduct.image}
                            alt={selectedProduct.designation}
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Désignation
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedProduct.designation}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Prix
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {selectedProduct.montant.toLocaleString()} FC
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Catégories
                        </label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedProduct.categorie.map((cat, index) => (
                            <Badge
                              key={index}
                              variant="light"
                            //   className={CATEGORY_COLORS[cat] || CATEGORY_COLORS.default}
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {selectedProduct.caracteristiques.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Caractéristiques
                          </label>
                          <ul className="mt-1 text-sm text-gray-900 dark:text-white list-disc list-inside">
                            {selectedProduct.caracteristiques.map((carac, index) => (
                              <li key={index}>{carac}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedProduct.avantages.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Avantages
                          </label>
                          <ul className="mt-1 text-sm text-gray-900 dark:text-white list-disc list-inside">
                            {selectedProduct.avantages.map((avantage, index) => (
                              <li key={index}>{avantage}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedProduct.benefice.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bénéfices
                          </label>
                          <ul className="mt-1 text-sm text-gray-900 dark:text-white list-disc list-inside">
                            {selectedProduct.benefice.map((benefice, index) => (
                              <li key={index}>{benefice}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProduct(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des commandes */}
      {showCommandesModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full dark:bg-gray-800">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="flex items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Commandes pour "{selectedProduct.designation}"
                    </h3>

                    {/* Statistiques des commandes */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {productCommandes.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total commandes
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {productCommandes.filter(c => c.statu === 'OK').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Approuvées
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {productCommandes.filter(c => c.statu === 'PENDING').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          En attente
                        </div>
                      </div>
                      
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {productCommandes.filter(c => c.statu === 'NO').length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Rejetées
                        </div>
                      </div>
                    </div>

                    {/* Liste des commandes */}
                    {isLoadingCommandes ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Chargement des commandes...</p>
                      </div>
                    ) : productCommandes.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Aucune commande trouvée pour ce produit
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Référence
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Année
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date création
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dernière mise à jour
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                            {productCommandes.map((commande) => (
                              <tr key={commande._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {commande.reference}
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(commande.statu)}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {getAnneePeriode(commande.anneeId)}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {commande.createdAt ? formatDate(commande.createdAt) : 'N/A'}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {commande.updatedAt ? formatDate(commande.updatedAt) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-gray-700">
                <button
                  onClick={() => {
                    setShowCommandesModal(false);
                    setSelectedProduct(null);
                    setProductCommandes([]);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}