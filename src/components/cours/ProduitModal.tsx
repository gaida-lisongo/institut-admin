"use client";
import React, { useState, useEffect } from "react";
import { Produit, ProduitFormData } from "@/services/ProduitService";
import ProduitService from "@/services/ProduitService";
import BlobManager from "@/services/BlobManager";

interface ProduitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produit: Produit) => void;
  onDelete?: (produit: Produit) => void;
  produit?: Produit;
  sectionId: string;
  anneeId: string;
  mode: 'create' | 'edit' | 'view';
  typeProduit?: string;
}

export default function ProduitModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  produit,
  sectionId,
  anneeId,
  mode,
  typeProduit,
}: ProduitModalProps) {
  const [formData, setFormData] = useState<ProduitFormData>({
    designation: "",
    montant: 0,
    categorie: ["travail"], // Valeur par défaut
    caracteristiques: [""],
    avantages: [""],
    benefice: [""],
    image: "",
    sectionId: sectionId,
    anneeId: anneeId,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (produit && mode !== 'create') {
      setFormData({
        designation: produit.designation,
        montant: produit.montant,
        categorie: produit.categorie || [],
        caracteristiques: produit.caracteristiques || [""],
        avantages: produit.avantages || [""],
        benefice: produit.benefice || [""],
        image: produit.image || "",
        sectionId: sectionId,
        anneeId: anneeId,
      });
    } else {
      // Mode création - réinitialiser le formulaire avec la catégorie dynamique
      setFormData({
        designation: "",
        montant: 0,
        categorie: typeProduit ? [typeProduit] : ["travail"], // Utiliser typeProduit ici
        caracteristiques: [""],
        avantages: [""],
        benefice: [""],
        image: "",
        sectionId: sectionId,
        anneeId: anneeId,
      });
    }
  }, [produit, mode, sectionId, anneeId, typeProduit, isOpen]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner un fichier image valide");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await BlobManager.createBlob(file, {
        typeProduit: typeProduit,
        sectionId: sectionId,
        anneeId: anneeId,
        type: file.type,
        name: file.name,
        size: file.size
      });
      setFormData(prev => ({ ...prev, image: imageUrl.url }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setError("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const updateArrayField = (field: keyof ProduitFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: keyof ProduitFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""]
    }));
  };

  const removeArrayField = (field: keyof ProduitFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Nettoyer les champs vides
      const cleanedData = {
        ...formData,
        caracteristiques: formData.caracteristiques.filter(item => item.trim() !== ""),
        avantages: formData.avantages.filter(item => item.trim() !== ""),
        benefice: formData.benefice.filter(item => item.trim() !== ""),
      };

      let savedProduit: Produit;

      if (mode === 'create') {
        setSuccess("Produit créé avec succès !");
        savedProduit = await ProduitService.createProduit(cleanedData);
      } else if (mode === 'edit' && produit) {
        savedProduit = await ProduitService.updateProduit(produit._id!, cleanedData);
        setSuccess("Produit modifié avec succès !");
      } else {
        throw new Error("Mode invalide");
      }

      onSave(savedProduit);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Erreur lors de la sauvegarde du produit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!produit) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ProduitService.deleteProduit(produit._id!);
      setSuccess(`Produit "${produit.designation}" supprimé avec succès !`);
      onDelete?.(produit);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression du produit");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isCreateMode && "Nouveau produit"}
              {isEditMode && "Modifier le produit"}
              {isViewMode && "Détails du produit"}
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

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colonne 1: Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informations de base</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant *
                  </label>
                  <input
                    type="number"
                    value={formData.montant}
                    onChange={(e) => setFormData(prev => ({ ...prev, montant: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <div className="space-y-2">
                    {formData.categorie.map((cat, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={cat}
                          onChange={(e) => updateArrayField('categorie', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          disabled={isViewMode}
                        />
                        {!isViewMode && formData.categorie.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('categorie', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => addArrayField('categorie')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Ajouter une catégorie
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image
                  </label>
                  {!isViewMode && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={isUploading}
                    />
                  )}
                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>
                  )}
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne 2: Caractéristiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Caractéristiques</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caractéristiques
                  </label>
                  <div className="space-y-2">
                    {formData.caracteristiques.map((carac, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <textarea
                          value={carac}
                          onChange={(e) => updateArrayField('caracteristiques', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical"
                          placeholder="Caractéristique..."
                          disabled={isViewMode}
                          rows={2}
                        />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('caracteristiques', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => addArrayField('caracteristiques')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Ajouter une caractéristique
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne 3: Avantages et Bénéfices */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Avantages & Bénéfices</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avantages
                  </label>
                  <div className="space-y-2">
                    {formData.avantages.map((avantage, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <textarea
                          value={avantage}
                          onChange={(e) => updateArrayField('avantages', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical"
                          placeholder="Avantage..."
                          disabled={isViewMode}
                          rows={3}
                        />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('avantages', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => addArrayField('avantages')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Ajouter un avantage
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bénéfices
                  </label>
                  <div className="space-y-2">
                    {formData.benefice.map((benefice, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <textarea
                          value={benefice}
                          onChange={(e) => updateArrayField('benefice', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical"
                          placeholder="Bénéfice..."
                          disabled={isViewMode}
                          rows={3}
                        />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('benefice', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => addArrayField('benefice')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Ajouter un bénéfice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                disabled={isLoading}
              >
                {isViewMode ? "Fermer" : "Annuler"}
              </button>

              {isEditMode && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Suppression..." : "Supprimer"}
                </button>
              )}

              {!isViewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isCreateMode ? "Création..." : "Modification...") 
                    : (isCreateMode ? "Créer" : "Modifier")
                  }
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
