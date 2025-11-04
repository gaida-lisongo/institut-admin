"use client";
import React, { useState, useEffect } from "react";
import CoursService, { Travail } from "@/services/CoursService";
import { ProduitFormData } from "@/services/ProduitService";
import { Section } from "@/types/section";
import ProduitService from "@/services/ProduitService";
import SectionService from "@/services/SectionService";
import BlobManager from "@/services/BlobManager";

interface TravailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (travail: Omit<Travail, '_id'> | Partial<Travail>) => void;
  travail?: Travail;
  anneeId: string;
  sectionId?: string; // Optionnel maintenant car on va le sélectionner
  coursId?: string;
}

export default function TravailModal({
  isOpen,
  onClose,
  onSave,
  travail,
  anneeId,
  sectionId,
  coursId,
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
  // États pour le formulaire
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Données du produit à créer
  const [produitData, setProduitData] = useState<ProduitFormData>({
    designation: "",
    montant: 0,
    categorie: ["travail"],
    caracteristiques: [""],
    avantages: [""],
    benefice: [""],
    image: "",
    sectionId: "",
    anneeId: anneeId,
  });

  useEffect(() => {
    if (isOpen) {
      loadAvailableSections();
      
      if (travail) {
        setFormData({
          anneeId: travail.anneeId,
          questionnaire: travail.questionnaire,
          produitId: travail.produitId,
          status: travail.status,
        });
        setUploadedFile(travail.questionnaire);
      } else {
        setFormData({
          anneeId: anneeId,
          questionnaire: "",
          produitId: "",
          status: "PENDING",
        });
        setUploadedFile(null);
        setProduitData({
          designation: "",
          montant: 0,
          categorie: ["travail"],
          caracteristiques: [""],
          avantages: [""],
          benefice: [""],
          image: "",
          sectionId: selectedSectionId,
          anneeId: anneeId,
        });
      }
    }
  }, [travail, anneeId, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!uploadedFile) {
      alert("Veuillez uploader un questionnaire PDF");
      return;
    }
    if (!selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    if (!produitData.designation || !produitData.montant) {
      alert("Veuillez remplir les informations du produit (désignation et montant)");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // ÉTAPE 1: Créer le produit d'abord
      console.log("🔹 Étape 1: Création du produit...");
      const produitPayload: ProduitFormData = {
        ...produitData,
        sectionId: selectedSectionId,
        anneeId: anneeId,
        caracteristiques: produitData.caracteristiques.filter(c => c.trim() !== ""),
        avantages: produitData.avantages.filter(a => a.trim() !== ""),
        benefice: produitData.benefice.filter(b => b.trim() !== ""),
      };
      
      const createdProduit = await ProduitService.createProduit(produitPayload);
      console.log("✅ Produit créé avec ID:", createdProduit._id);
      
      if (!createdProduit._id) {
        throw new Error("Le produit a été créé mais l'ID est manquant");
      }
      
      // ÉTAPE 2: Créer le travail avec l'ID du produit
      console.log("🔹 Étape 2: Création du travail...");
      const travailPayload = {
        anneeId: anneeId,
        questionnaire: uploadedFile,
        coursId: coursId || "",
        produitId: createdProduit._id,
      };
      
      console.log("Payload du travail:", travailPayload);
      const createdTravail = await CoursService.createTravail(travailPayload);
      console.log("✅ Travail créé avec succès:", createdTravail);
      
      // Notifier le parent et fermer
      onSave({
        ...formData,
        _id: createdTravail._id,
        produitId: createdProduit._id,
        questionnaire: uploadedFile,
      });
      
      alert("Travail créé avec succès !");
      onClose();
    } catch (error) {
      console.error("❌ Erreur lors de la création:", error);
      alert("Erreur: " + (error instanceof Error ? error.message : "Erreur inconnue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setProduitData(prev => ({ ...prev, sectionId }));
  };

  const updateProduitField = (field: keyof ProduitFormData, value: any) => {
    setProduitData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Veuillez sélectionner une image (JPG, PNG, GIF, WebP)");
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await BlobManager.createBlob(file, {
        type: "produit-image",
        originalName: file.name,
      });
      
      setProduitData(prev => ({ ...prev, image: result.url }));
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      // Validation étape 1 (Produit)
      if (!selectedSectionId) {
        alert("Veuillez sélectionner une section");
        return;
      }
      if (!produitData.designation || !produitData.montant) {
        alert("Veuillez remplir la désignation et le montant du produit");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validation étape 2 (Travail)
      if (!uploadedFile) {
        alert("Veuillez uploader le questionnaire PDF");
        return;
      }
      setCurrentStep(3);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const updateArrayField = (field: 'caracteristiques' | 'avantages' | 'benefice', index: number, value: string) => {
    setProduitData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'caracteristiques' | 'avantages' | 'benefice') => {
    setProduitData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""]
    }));
  };

  const removeArrayField = (field: 'caracteristiques' | 'avantages' | 'benefice', index: number) => {
    setProduitData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {travail ? "Modifier le travail" : "Nouveau travail"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Étape 1: Produit */}
              <div className={`flex items-center space-x-2 ${
                currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === 1 ? 'bg-blue-600 text-white' : currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="font-medium">Produit</span>
              </div>
              
              <div className="w-12 h-px bg-gray-300"></div>
              
              {/* Étape 2: Travail */}
              <div className={`flex items-center space-x-2 ${
                currentStep === 2 ? 'text-blue-600' : currentStep > 2 ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span className="font-medium">Travail</span>
              </div>
              
              <div className="w-12 h-px bg-gray-300"></div>
              
              {/* Étape 3: Résumé */}
              <div className={`flex items-center space-x-2 ${
                currentStep === 3 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className="font-medium">Résumé</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ÉTAPE 1: PRODUIT */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section *
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner une section</option>
                    {availableSections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.description.sigle} - {section.description.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Désignation du produit *
                    </label>
                    <input
                      type="text"
                      value={produitData.designation}
                      onChange={(e) => updateProduitField('designation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ex: Travail dirigé de mathématiques"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant *
                    </label>
                    <input
                      type="number"
                      value={produitData.montant}
                      onChange={(e) => updateProduitField('montant', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image du produit
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>}
                  {produitData.image && (
                    <div className="mt-2">
                      <img src={produitData.image} alt="Produit" className="w-32 h-32 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caractéristiques
                  </label>
                  {produitData.caracteristiques.map((carac, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={carac}
                        onChange={(e) => updateArrayField('caracteristiques', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Caractéristique..."
                      />
                      {produitData.caracteristiques.length > 1 && (
                        <button type="button" onClick={() => removeArrayField('caracteristiques', index)} className="text-red-600">×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayField('caracteristiques')} className="text-blue-600 text-sm">+ Ajouter</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avantages
                  </label>
                  {produitData.avantages.map((avantage, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={avantage}
                        onChange={(e) => updateArrayField('avantages', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Avantage..."
                      />
                      {produitData.avantages.length > 1 && (
                        <button type="button" onClick={() => removeArrayField('avantages', index)} className="text-red-600">×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayField('avantages')} className="text-blue-600 text-sm">+ Ajouter</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bénéfices
                  </label>
                  {produitData.benefice.map((benefice, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={benefice}
                        onChange={(e) => updateArrayField('benefice', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Bénéfice..."
                      />
                      {produitData.benefice.length > 1 && (
                        <button type="button" onClick={() => removeArrayField('benefice', index)} className="text-red-600">×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayField('benefice')} className="text-blue-600 text-sm">+ Ajouter</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2: TRAVAIL */}
            {currentStep === 2 && (
              <div className="space-y-6">
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
                  {isUploading && <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>}
                  {uploadedFile && (
                    <div className="mt-2">
                      <a href={uploadedFile} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        ✓ Questionnaire uploadé
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ÉTAPE 3: RÉSUMÉ */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé du produit</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Section:</strong> {availableSections.find(s => s._id === selectedSectionId)?.description.designation}</p>
                    <p><strong>Désignation:</strong> {produitData.designation}</p>
                    <p><strong>Montant:</strong> {produitData.montant} $</p>
                    {produitData.image && <img src={produitData.image} alt="Produit" className="w-24 h-24 object-cover rounded mt-2" />}
                    <p><strong>Caractéristiques:</strong> {produitData.caracteristiques.filter(c => c).join(', ')}</p>
                    <p><strong>Avantages:</strong> {produitData.avantages.filter(a => a).join(', ')}</p>
                    <p><strong>Bénéfices:</strong> {produitData.benefice.filter(b => b).join(', ')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé du travail</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Questionnaire:</strong> {uploadedFile ? '✓ Uploadé' : '✗ Non uploadé'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : goToPreviousStep}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isSubmitting}
              >
                {currentStep === 1 ? 'Annuler' : 'Précédent'}
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Création en cours..." : "Créer le travail"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
