"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useProduitStore } from "@/stores/produitStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { useSectionStore } from "@/stores/sectionStore";
import DataTable, { Column } from "@/components/common/DataTable";
import { ProduitWithDetails, ProduitFormData } from "@/services/ProduitService";
import BlobManager from "@/services/BlobManager";

// Modal pour le CRUD des stages
interface StageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage?: ProduitWithDetails | null;
  anneeId: string;
}

const StageModal: React.FC<StageModalProps> = ({ isOpen, onClose, stage, anneeId }) => {
  const { createProduit, updateProduit } = useProduitStore();
  const { sections } = useSectionStore();
  
  const [formData, setFormData] = useState<ProduitFormData>({
    designation: "",
    montant: 0,
    benefice: [],
    caracteristiques: [],
    avantages: [],
    sectionId: "",
    anneeId: anneeId,
    categorie: ["stage"],
    image: "",
  });

  const [newBenefice, setNewBenefice] = useState("");
  const [newCaracteristique, setNewCaracteristique] = useState("");
  const [newAvantage, setNewAvantage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (stage) {
      setFormData({
        designation: stage.designation,
        montant: stage.montant,
        benefice: stage.benefice || [],
        caracteristiques: stage.caracteristiques || [],
        avantages: stage.avantages || [],
        sectionId: typeof stage.sectionId === 'object' ? stage.sectionId._id : stage.sectionId,
        anneeId: typeof stage.anneeId === 'object' ? stage.anneeId._id : stage.anneeId,
        categorie: stage.categorie || ["stage"],
        image: stage.image || "",
      });
    } else {
      setFormData({
        designation: "",
        montant: 0,
        benefice: [],
        caracteristiques: [],
        avantages: [],
        sectionId: "",
        anneeId: anneeId,
        categorie: ["stage"],
        image: "",
      });
    }
  }, [stage, anneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (stage?._id) {
        await updateProduit(stage._id, formData);
      } else {
        await createProduit(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await BlobManager.createBlob(file, {
        type: 'stage-image',
        designation: formData.designation || 'stage'
      });
      
      setFormData({
        ...formData,
        image: result.url
      });
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setImageUploading(false);
    }
  };

  const addItem = (type: 'benefice' | 'caracteristiques' | 'avantages') => {
    const newValue = type === 'benefice' ? newBenefice : 
                     type === 'caracteristiques' ? newCaracteristique : newAvantage;
    
    if (newValue.trim()) {
      setFormData({
        ...formData,
        [type]: [...formData[type], newValue.trim()]
      });
      
      if (type === 'benefice') setNewBenefice("");
      else if (type === 'caracteristiques') setNewCaracteristique("");
      else setNewAvantage("");
    }
  };

  const removeItem = (type: 'benefice' | 'caracteristiques' | 'avantages', index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {stage ? "Modifier" : "Créer"} un stage de recherche
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Titre du stage de recherche"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Montant (CDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                required
                min="0"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="0"
              />
            </div>
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              required
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Sélectionner une section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.description.sigle} - {section.description.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Upload d'image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image du stage
            </label>
            <div className="space-y-3">
              {/* Bouton d'upload */}
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2">
                  <span>📷</span>
                  <span>{imageUploading ? "Upload en cours..." : "Choisir une image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="hidden"
                  />
                </label>
                {imageUploading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
              </div>

              {/* Prévisualisation de l'image */}
              {formData.image && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={formData.image} 
                    alt="Prévisualisation"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ❌ Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bénéfices */}
          <div>
            <label className="block text-sm font-medium mb-2">Bénéfices du stage</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={newBenefice}
                  onChange={(e) => setNewBenefice(e.target.value)}
                  placeholder="Ajouter un bénéfice du stage (support du JSX et retours à la ligne)"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[80px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      addItem('benefice');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addItem('benefice')}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 self-start"
                >
                  ➕
                </button>
              </div>
              <p className="text-xs text-gray-500">Ctrl+Entrée pour ajouter rapidement</p>
            </div>
            <div className="space-y-2 mt-3">
              {formData.benefice.map((item, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 text-sm whitespace-pre-wrap text-green-800 dark:text-green-200">
                      {item}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem('benefice', index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caractéristiques */}
          <div>
            <label className="block text-sm font-medium mb-2">Caractéristiques du stage</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={newCaracteristique}
                  onChange={(e) => setNewCaracteristique(e.target.value)}
                  placeholder="Ajouter une caractéristique du stage (support du JSX et retours à la ligne)"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[80px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      addItem('caracteristiques');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addItem('caracteristiques')}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 self-start"
                >
                  ➕
                </button>
              </div>
              <p className="text-xs text-gray-500">Ctrl+Entrée pour ajouter rapidement</p>
            </div>
            <div className="space-y-2 mt-3">
              {formData.caracteristiques.map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 text-sm whitespace-pre-wrap text-blue-800 dark:text-blue-200">
                      {item}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem('caracteristiques', index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avantages */}
          <div>
            <label className="block text-sm font-medium mb-2">Avantages du stage</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={newAvantage}
                  onChange={(e) => setNewAvantage(e.target.value)}
                  placeholder="Ajouter un avantage du stage (support du JSX et retours à la ligne)"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[80px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      addItem('avantages');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addItem('avantages')}
                  className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 self-start"
                >
                  ➕
                </button>
              </div>
              <p className="text-xs text-gray-500">Ctrl+Entrée pour ajouter rapidement</p>
            </div>
            <div className="space-y-2 mt-3">
              {formData.avantages.map((item, index) => (
                <div
                  key={index}
                  className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 text-sm whitespace-pre-wrap text-purple-800 dark:text-purple-200">
                      {item}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem('avantages', index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={imageUploading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {stage ? "💾 Modifier" : "➕ Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function StagesPage() {
  const params = useParams();
  const anneeId = params.slug as string;

  const { produits: stages, loading, fetchProduitsByCategorie, deleteProduit } = useProduitStore();
  const { selectedAnnee: currentAnnee, fetchAnnee } = useAnneeStore();
  const { sections, fetchSections } = useSectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProduitWithDetails | null>(null);

  useEffect(() => {
    if (anneeId) {
      fetchProduitsByCategorie("stage");
      fetchAnnee(anneeId);
      fetchSections();
    }
  }, [anneeId, fetchProduitsByCategorie, fetchAnnee, fetchSections]);

  // Filtrer les stages par année
  const stagesFiltered = useMemo(() => {
    return stages.filter(stage => {
      const stageAnneeId = typeof stage.anneeId === 'object' ? stage.anneeId._id : stage.anneeId;
      return stageAnneeId === anneeId;
    });
  }, [stages, anneeId]);

  const columns: Column<ProduitWithDetails>[] = [
    {
      key: "designation",
      header: "Stage de recherche",
      render: (stage) => (
        <div className="flex items-center space-x-3">
          {stage.image && (
            <img 
              src={stage.image} 
              alt={stage.designation}
              className="w-12 h-12 rounded-lg object-cover border"
            />
          )}
          <div>
            <div className="font-medium">{stage.designation}</div>
            <div className="text-sm text-gray-500">
              {typeof stage.sectionId === 'object' ? stage.sectionId.description.sigle : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "montant",
      header: "Budget",
      render: (stage) => (
        <div className="text-right">
          <span className="font-medium">{stage.montant.toLocaleString()} CDF</span>
        </div>
      ),
    },
    {
      key: "benefice",
      header: "Bénéfices",
      render: (stage) => (
        <div className="max-w-xs">
          <div className="space-y-1">
            {stage.benefice.slice(0, 2).map((benefice, index) => (
              <div
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs whitespace-pre-wrap"
              >
                {benefice.length > 50 ? `${benefice.substring(0, 50)}...` : benefice}
              </div>
            ))}
            {stage.benefice.length > 2 && ( 
              <span className="text-xs text-gray-500">
                +{stage.benefice.length - 2} autres
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "caracteristiques",
      header: "Caractéristiques",
      render: (stage) => (
        <div className="max-w-xs">
          <div className="space-y-1">
            {stage.caracteristiques.slice(0, 2).map((carac, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs whitespace-pre-wrap"
              >
                {carac.length > 50 ? `${carac.substring(0, 50)}...` : carac}
              </div>
            ))}
            {stage.caracteristiques.length > 2 && (
              <span className="text-xs text-gray-500">
                +{stage.caracteristiques.length - 2} autres
              </span>
            )}
          </div>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedStage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (stage: ProduitWithDetails) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  const handleDelete = async (stage: ProduitWithDetails) => {
    if (!stage._id) return;
    
    if (confirm(`Supprimer le stage "${stage.designation}" ?`)) {
      try {
        await deleteProduit(stage._id);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  if (loading && stagesFiltered.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <span className="mr-2">←</span>
              Retour
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stages de Recherche - {currentAnnee?.debut}-{currentAnnee?.fin}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestion des stages de recherche pour l'année académique {currentAnnee?.debut}-{currentAnnee?.fin}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Stages
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stagesFiltered.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Budget Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stagesFiltered.reduce((total, stage) => total + stage.montant, 0).toLocaleString()} CDF
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sections
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Set(stagesFiltered.map(s => typeof s.sectionId === 'object' ? s.sectionId._id : s.sectionId)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            data={stagesFiltered}
            columns={columns}
            searchPlaceholder="Rechercher un stage de recherche..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            addButtonText="🎓 Nouveau stage"
          />
        </div>

        {/* Modal */}
        <StageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          stage={selectedStage}
          anneeId={anneeId}
        />
      </div>
    </div>
  );
}