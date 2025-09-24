"use client";
import React, { useState, useEffect } from "react";
import { Travail } from "@/services/CoursService";
import { Produit, ProduitWithDetails } from "@/services/ProduitService";
import { Section } from "@/types/section";
import ProduitService from "@/services/ProduitService";
import SectionService from "@/services/SectionService";
import BlobManager from "@/services/BlobManager";
import ProduitModal from "./ProduitModal";

interface TravailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (travail: Omit<Travail, '_id'> | Partial<Travail>) => void;
  travail?: Travail;
  anneeId: string;
  sectionId?: string; // Optionnel maintenant car on va le sélectionner
}

export default function TravailModal({
  isOpen,
  onClose,
  onSave,
  travail,
  anneeId,
  sectionId,
}: TravailModalProps) {
  const [formData, setFormData] = useState<{
    anneeId: string;
    questionnaire: string;
    produitId: string;
    status: 'NO' | 'PENDING' | 'OK';
  }>({
    anneeId: anneeId,
    questionnaire: "",
    produitId: "",
    status: "PENDING",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProduitModalOpen, setIsProduitModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<ProduitWithDetails | null>(null);
  const [availableProduits, setAvailableProduits] = useState<ProduitWithDetails[]>([]);
  const [isLoadingProduits, setIsLoadingProduits] = useState(false);
  const [step, setStep] = useState<'questionnaire' | 'produit'>('questionnaire');
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  useEffect(() => {
    if (travail) {
      setFormData({
        anneeId: travail.anneeId,
        questionnaire: travail.questionnaire,
        produitId: travail.produitId,
        status: travail.status,
      });
      setUploadedFile(travail.questionnaire);
      setStep('produit'); // Si on édite, on va directement à l'étape produit
      if (travail.produitId) {
        loadProduitDetails(travail.produitId);
      }
    } else {
      setFormData({
        anneeId: anneeId,
        questionnaire: "",
        produitId: "",
        status: "PENDING",
      });
      setUploadedFile(null);
      setStep('questionnaire');
    }
    
    // Charger les sections et produits disponibles
    if (isOpen) {
      loadAvailableSections();
      if (selectedSectionId) {
        loadAvailableProduits();
      }
    }
  }, [travail, anneeId, isOpen, selectedSectionId]);

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
      console.log("Last products: ", response);
      const produits = Array.isArray(response) ? response : (response || []);
      setAvailableProduits(produits);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setAvailableProduits([]); // Définir un tableau vide en cas d'erreur
    } finally {
      setIsLoadingProduits(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF");
      return;
    }

    setIsUploading(true);
    try {
      const result = await BlobManager.createBlob(file, {
        type: "questionnaire",
        originalName: file.name,
      });
      
      setUploadedFile(result.url);
      setFormData(prev => ({
        ...prev,
        questionnaire: result.url,
      }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionnaire) {
      alert("Veuillez uploader un questionnaire PDF");
      return;
    }
    if (!formData.produitId) {
      alert("Veuillez sélectionner ou créer un produit");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleNextStep = () => {
    if (step === 'questionnaire' && formData.questionnaire && selectedSectionId) {
      setStep('produit');
      // Charger les produits pour la section sélectionnée
      loadAvailableProduits();
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    // Réinitialiser la sélection de produit si on change de section
    setFormData(prev => ({ ...prev, produitId: "" }));
    setSelectedProduit(null);
    setAvailableProduits([]);
  };

  const handlePreviousStep = () => {
    if (step === 'produit') {
      setStep('questionnaire');
    }
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {travail ? "Modifier le travail" : "Nouveau travail"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                step === 'questionnaire' ? 'text-blue-600' : 'text-green-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'questionnaire' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {step === 'questionnaire' ? '1' : '✓'}
                </div>
                <span className="font-medium">Questionnaire</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${
                step === 'produit' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'produit' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="font-medium">Produit</span>
              </div>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Questionnaire */}
          {step === 'questionnaire' && (
            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Questionnaire PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>
                )}
                {uploadedFile && (
                  <div className="mt-2">
                    <a
                      href={uploadedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Voir le questionnaire</span>
                    </a>
                  </div>
                )}
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
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.questionnaire || !selectedSectionId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Produit */}
          {step === 'produit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Produit associé *
                </label>
                
                {/* Sélection de produit existant */}
                <div className="space-y-3">
                  <select
                    value={formData.produitId}
                    onChange={(e) => handleProduitSelected(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isLoadingProduits}
                  >
                    <option value="">Sélectionner un produit existant</option>
                    {Array.isArray(availableProduits) && availableProduits.map((produit) => (
                      <option key={produit._id} value={produit._id}>
                        {produit.designation} - {produit.montant}€
                      </option>
                    ))}
                  </select>

                  <div className="text-center">
                    <span className="text-gray-500">ou</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsProduitModalOpen(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                  >
                    Créer un nouveau produit
                  </button>
                </div>

                {/* Aperçu du produit sélectionné */}
                {selectedProduit && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Produit sélectionné:
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p><strong>Nom:</strong> {selectedProduit.designation}</p>
                      <p><strong>Montant:</strong> {selectedProduit.montant}€</p>
                      {selectedProduit.caracteristiques && selectedProduit.caracteristiques.length > 0 && (
                        <p><strong>Caractéristiques:</strong> {selectedProduit.caracteristiques.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

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

              <div className="flex justify-between space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Précédent
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !formData.questionnaire || !formData.produitId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  >
                    {travail ? "Modifier" : "Créer"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>

      {/* Modal de création de produit */}
      <ProduitModal
        isOpen={isProduitModalOpen}
        onClose={() => setIsProduitModalOpen(false)}
        onSave={handleProduitCreated}
        sectionId={selectedSectionId}
        anneeId={anneeId}
        mode="create"
      />
    </>
  );
}
