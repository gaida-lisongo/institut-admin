"use client";
import React, { useState, useEffect } from "react";
import { Seance } from "@/services/CoursService";
import { Produit, ProduitWithDetails } from "@/services/ProduitService";
import { Section } from "@/types/section";
import ProduitService from "@/services/ProduitService";
import SectionService from "@/services/SectionService";
import ProduitModal from "./ProduitModal";

interface SeanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seance: Omit<Seance, '_id'> | Partial<Seance>) => void;
  seance?: Seance;
  anneeId: string;
  sectionId?: string; // Optionnel maintenant car on va le sélectionner
}

export default function SeanceModal({
  isOpen,
  onClose,
  onSave,
  seance,
  anneeId,
  sectionId,
}: SeanceModalProps) {
  const [formData, setFormData] = useState<{
    anneeId: string;
    produitId: string;
    status: 'NO' | 'PENDING' | 'OK';
  }>({
    anneeId: anneeId,
    produitId: "",
    status: "PENDING",
  });
  
  const [isProduitModalOpen, setIsProduitModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<ProduitWithDetails | null>(null);
  const [availableProduits, setAvailableProduits] = useState<ProduitWithDetails[]>([]);
  const [isLoadingProduits, setIsLoadingProduits] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  useEffect(() => {
    if (seance) {
      setFormData({
        anneeId: seance.anneeId,
        produitId: seance.produitId,
        status: seance.status,
      });
      if (seance.produitId) {
        loadProduitDetails(seance.produitId);
      }
    } else {
      setFormData({
        anneeId: anneeId,
        produitId: "",
        status: "PENDING",
      });
    }
    
    // Charger les sections et produits disponibles
    if (isOpen) {
      loadAvailableSections();
      if (selectedSectionId) {
        loadAvailableProduits();
      }
    }
  }, [seance, anneeId, isOpen, selectedSectionId]);

  const loadAvailableSections = async () => {
    setIsLoadingSections(true);
    try {
      const response = await SectionService.getAllSections();
      if (response.data && response.data.success) {
        setAvailableSections(response.data.data);
        // Si on a un sectionId par défaut, le sélectionner
        if (sectionId && !selectedSectionId) {
          setSelectedSectionId(sectionId);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sections:", error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  const loadProduitDetails = async (produitId: string) => {
    try {
      const produit = await ProduitService.getProduit(produitId);
      setSelectedProduit(produit);
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
    }
  };

  const loadAvailableProduits = async () => {
    if (!selectedSectionId) return;
    
    setIsLoadingProduits(true);
    try {
      const response = await ProduitService.getProduitByAnneeAndSection(anneeId, selectedSectionId);
      // S'assurer que la réponse est un tableau
      const produits = Array.isArray(response) ? response : (response || []);
      setAvailableProduits(produits);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setAvailableProduits([]); // Définir un tableau vide en cas d'erreur
    } finally {
      setIsLoadingProduits(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    if (!formData.produitId) {
      alert("Veuillez sélectionner ou créer un produit");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    // Réinitialiser la sélection de produit si on change de section
    setFormData(prev => ({ ...prev, produitId: "" }));
    setSelectedProduit(null);
    setAvailableProduits([]);
  };

  const handleProduitCreated = (produit: Produit) => {
    setFormData(prev => ({ ...prev, produitId: produit._id || '' }));
    setSelectedProduit(produit as ProduitWithDetails);
    setIsProduitModalOpen(false);
    // Recharger la liste des produits
    loadAvailableProduits();
  };

  const handleProduitSelected = (produitId: string) => {
    setFormData(prev => ({ ...prev, produitId }));
    const produit = Array.isArray(availableProduits) 
      ? availableProduits.find(p => p._id === produitId)
      : null;
    setSelectedProduit(produit || null);
  };

  const handleStatusChange = (status: 'NO' | 'PENDING' | 'OK') => {
    setFormData(prev => ({ ...prev, status }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {seance ? "Modifier la séance" : "Nouvelle séance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section *
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={isLoadingSections}
            >
              <option value="">Sélectionner une section</option>
              {availableSections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.description.sigle} - {section.description.designation}
                </option>
              ))}
            </select>
            {isLoadingSections && (
              <p className="text-sm text-blue-600 mt-1">Chargement des sections...</p>
            )}
          </div>

          {/* Sélection/Création de produit */}
          {selectedSectionId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produit *
              </label>
              
              {/* Sélection de produit existant */}
              <div className="space-y-3">

                {/* Bouton pour créer un nouveau produit */}
                <button
                  type="button"
                  onClick={() => setIsProduitModalOpen(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Créer un nouveau produit
                </button>

                {isLoadingProduits && (
                  <p className="text-sm text-blue-600 mt-1">Chargement des produits...</p>
                )}
                {!isLoadingProduits && (!Array.isArray(availableProduits) || availableProduits.length === 0) && selectedSectionId && (
                  <p className="text-sm text-gray-500 mt-1">Aucun produit disponible pour cette section.</p>
                )}
              </div>

              {/* Aperçu du produit sélectionné */}
              {selectedProduit && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Produit sélectionné :</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Nom :</strong> {selectedProduit.designation}</p>
                    <p><strong>Montant :</strong> {selectedProduit.montant}€</p>
                    {selectedProduit.categorie && (
                      <p><strong>Catégorie :</strong> {selectedProduit.categorie}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <div className="flex space-x-2">
              {(['NO', 'PENDING', 'OK'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    formData.status === status
                      ? status === 'OK'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  } border`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              {seance ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de création de produit */}
      <ProduitModal
        isOpen={isProduitModalOpen}
        onClose={() => setIsProduitModalOpen(false)}
        onSave={handleProduitCreated}
        sectionId={selectedSectionId}
        anneeId={anneeId}
        mode="create"
        typeProduit="seance"
      />
    </div>
  );
}
