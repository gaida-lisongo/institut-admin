"use client";
import React, { useState, useEffect, useRef } from "react";
import { Produit, ProduitFormData, ProduitWithDetails } from "@/services/ProduitService";
import ProduitService from "@/services/ProduitService";
import BlobManager from "@/services/BlobManager";

interface ProduitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (produit: Produit) => void;
  onDelete?: (produitId: string) => void;
  produit?: ProduitWithDetails | null;
  sectionId: string;
  anneeId: string;
  mode: 'create' | 'edit' | 'view';
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
}: ProduitModalProps) {
  const [formData, setFormData] = useState<ProduitFormData>({
    designation: "",
    montant: 0,
    categorie: ["travail"],
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (produit && (mode === 'edit' || mode === 'view')) {
        // Extraction des IDs si les champs sont des objets
        const extractedSectionId = typeof produit.sectionId === 'string' 
          ? produit.sectionId 
          : produit.sectionId._id;
        const extractedAnneeId = typeof produit.anneeId === 'string' 
          ? produit.anneeId 
          : produit.anneeId._id;

        setFormData({
          designation: produit.designation || "",
          montant: produit.montant || 0,
          categorie: Array.isArray(produit.categorie) ? produit.categorie : ["travail"],
          caracteristiques: Array.isArray(produit.caracteristiques) && produit.caracteristiques.length > 0 
            ? produit.caracteristiques 
            : [""],
          avantages: Array.isArray(produit.avantages) && produit.avantages.length > 0 
            ? produit.avantages 
            : [""],
          benefice: Array.isArray(produit.benefice) && produit.benefice.length > 0 
            ? produit.benefice 
            : [""],
          image: produit.image || "",
          sectionId: extractedSectionId,
          anneeId: extractedAnneeId,
        });
      } else {
        // Mode création
        setFormData({
          designation: "",
          montant: 0,
          categorie: ["travail"],
          caracteristiques: [""],
          avantages: [""],
          benefice: [""],
          image: "",
          sectionId: sectionId,
          anneeId: anneeId,
        });
      }
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, produit, mode, sectionId, anneeId]);

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
      const result = await BlobManager.createBlob(file, {
        type: "produit-image",
        originalName: file.name,
      });
      
      setFormData(prev => ({
        ...prev,
        image: result.url || result.path || "",
      }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setError("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleArrayFieldChange = (
    field: 'caracteristiques' | 'avantages' | 'benefice',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'caracteristiques' | 'avantages' | 'benefice') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayField = (field: 'caracteristiques' | 'avantages' | 'benefice', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].length === 1 ? [""] : prev[field].filter((_, i) => i !== index)
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

      let result: Produit;
      
      if (mode === 'create') {
        result = await ProduitService.createProduit(cleanedData);
        setSuccess("Produit créé avec succès !");
      } else if (mode === 'edit' && produit?._id) {
        result = await ProduitService.updateProduit(produit._id, cleanedData);
        setSuccess("Produit modifié avec succès !");
      } else {
        throw new Error("Mode ou ID produit invalide");
      }

      onSave?.(result);
      
      // Fermer le modal après un délai pour montrer le message de succès
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError(error.message || "Erreur lors de la sauvegarde du produit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!produit?._id) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await ProduitService.deleteProduit(produit._id);
      setSuccess("Produit supprimé avec succès !");
      onDelete?.(produit._id);
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      setError(error.message || "Erreur lors de la suppression du produit");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Créer un produit' : 
                mode === 'edit' ? 'Modifier le produit' : 
                'Détails du produit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1: Informations de base */}
            <div className="space-y-4">
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
                  readOnly={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => setFormData(prev => ({ ...prev, montant: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  readOnly={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={formData.categorie.join(", ")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    categorie: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "")
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Séparez par des virgules"
                  readOnly={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image
                </label>
                {!isReadOnly && (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                      {isUploading ? 'Upload...' : 'Choisir une image'}
                    </button>
                  </div>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Aperçu"
                      className="h-20 w-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Colonne 2: Caractéristiques */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caractéristiques
                </label>
                {formData.caracteristiques.map((caracteristique, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={caracteristique}
                      onChange={(e) => handleArrayFieldChange('caracteristiques', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder={`Caractéristique ${index + 1}`}
                      readOnly={isReadOnly}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('caracteristiques', index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => addArrayField('caracteristiques')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    + Ajouter une caractéristique
                  </button>
                )}
              </div>
            </div>

            {/* Colonne 3: Avantages et Bénéfices */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avantages
                </label>
                {formData.avantages.map((avantage, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={avantage}
                      onChange={(e) => handleArrayFieldChange('avantages', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder={`Avantage ${index + 1}`}
                      readOnly={isReadOnly}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('avantages', index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => addArrayField('avantages')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    + Ajouter un avantage
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bénéfices
                </label>
                {formData.benefice.map((benefice, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={benefice}
                      onChange={(e) => handleArrayFieldChange('benefice', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      placeholder={`Bénéfice ${index + 1}`}
                      readOnly={isReadOnly}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('benefice', index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => addArrayField('benefice')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    + Ajouter un bénéfice
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </button>
            
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                Supprimer
              </button>
            )}
            
            {!isReadOnly && (
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Modifier'}
              </button>
            )}
          </div>
        </form>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-900 dark:text-white">Traitement en cours...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
