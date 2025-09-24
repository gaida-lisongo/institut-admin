"use client";
import React, { useState } from "react";
import { PlanItem } from "@/services/CoursService";
import CoursService from "@/services/CoursService";

interface ChapitreEnCours {
  titre: string;
  duree: string;
  sousTitres: { titre: string; duree: string }[];
}

interface PlansCardProps {
  plan: PlanItem[];
  titre: string;
  anneeId: string;
  onPlanUpdate?: (plan: PlanItem[]) => void;
  coursId: string;
}

const PlansCard: React.FC<PlansCardProps> = ({
  plan,
  titre,
  anneeId,
  onPlanUpdate,
  coursId,
}) => {
  const [localPlan, setLocalPlan] = useState<PlanItem[]>(plan);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour la création d'un nouveau chapitre
  const [chapitreEnCours, setChapitreEnCours] = useState<ChapitreEnCours>({
    titre: "",
    duree: "",
    sousTitres: []
  });
  const [etapeCreation, setEtapeCreation] = useState<'titre' | 'sousTitres' | 'preview'>('titre');
  const [chapitresEnPreview, setChapitresEnPreview] = useState<string[]>([]);
  const [nouveauSousTitre, setNouveauSousTitre] = useState({ titre: "", duree: "" });

  // Fonctions pour la création étape par étape
  const handleDefinirTitre = () => {
    if (!chapitreEnCours.titre.trim() || !chapitreEnCours.duree.trim()) {
      alert("Veuillez remplir le titre et la durée du chapitre");
      return;
    }
    setEtapeCreation('sousTitres');
  };

  const handleAjouterSousTitre = () => {
    if (!nouveauSousTitre.titre.trim() || !nouveauSousTitre.duree.trim()) {
      alert("Veuillez remplir le titre et la durée du sous-titre");
      return;
    }
    
    setChapitreEnCours(prev => ({
      ...prev,
      sousTitres: [...prev.sousTitres, { ...nouveauSousTitre }]
    }));
    setNouveauSousTitre({ titre: "", duree: "" });
  };

  const handleSupprimerSousTitre = (index: number) => {
    setChapitreEnCours(prev => ({
      ...prev,
      sousTitres: prev.sousTitres.filter((_, i) => i !== index)
    }));
  };

  const handleAjouterAuPlan = () => {
    // Générer la chaîne formatée du chapitre
    const numeroRomain = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const numeroChap = localPlan.length;
    
    let chapitreFormate = `Chapitre ${numeroRomain[numeroChap] || (numeroChap + 1)}. ${chapitreEnCours.titre} (${chapitreEnCours.duree})`;
    
    if (chapitreEnCours.sousTitres.length > 0) {
      chapitreEnCours.sousTitres.forEach((sousTitre, index) => {
        chapitreFormate += `\n    ${numeroRomain[numeroChap] || (numeroChap + 1)}.${index + 1}. ${sousTitre.titre} (${sousTitre.duree})`;
      });
    }
    
    setChapitresEnPreview(prev => [...prev, chapitreFormate]);
    
    // Réinitialiser pour le prochain chapitre
    setChapitreEnCours({ titre: "", duree: "", sousTitres: [] });
    setEtapeCreation('titre');
  };

  const handleEnregistrerPlan = async () => {
    if (chapitresEnPreview.length === 0) {
      alert("Aucun chapitre à enregistrer");
      return;
    }

    const nouveauPlan: PlanItem = {
      anneeId: anneeId,
      contenu: chapitresEnPreview
    };

    const updatedPlan = [...localPlan, nouveauPlan];
    setLocalPlan(updatedPlan);
    setChapitresEnPreview([]);
    savePlan(updatedPlan);
  };

  const handleAnnulerCreation = () => {
    setChapitresEnPreview([]);
    setChapitreEnCours({ titre: "", duree: "", sousTitres: [] });
    setEtapeCreation('titre');
  };

  const handleRemovePlanItem = (index: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément du plan ?")) {
      return;
    }

    const updatedPlan = localPlan.filter((_, i) => i !== index);
    setLocalPlan(updatedPlan);
    savePlan(updatedPlan);
  };

  const savePlan = async (planToSave: PlanItem[]) => {
    setIsLoading(true);
    try {
      await CoursService.updateCours(coursId, {plan: planToSave});
      onPlanUpdate?.(planToSave);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du plan:", error);
      alert("Erreur lors de la sauvegarde du plan");
    } finally {
      setIsLoading(false);
    }
  };

  const addContenuField = (planItem: PlanItem, setPlanItem: (item: PlanItem) => void) => {
    setPlanItem({
      ...planItem,
      contenu: [...planItem.contenu, ""]
    });
  };

  const removeContenuField = (planItem: PlanItem, setPlanItem: (item: PlanItem) => void, index: number) => {
    if (planItem.contenu.length > 1) {
      setPlanItem({
        ...planItem,
        contenu: planItem.contenu.filter((_, i) => i !== index)
      });
    }
  };

  const updateContenuField = (planItem: PlanItem, setPlanItem: (item: PlanItem) => void, index: number, value: string) => {
    setPlanItem({
      ...planItem,
      contenu: planItem.contenu.map((c, i) => i === index ? value : c)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {titre} - Plan de cours
        </h3>
      </div>

      {/* Liste des éléments du plan */}
      <div className="space-y-4">
        {localPlan.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Plan {index + 1} - Année: {item.anneeId}
                </div>
                <div className="space-y-3">
                  {item.contenu.map((chapitre, contentIndex) => (
                    <div key={contentIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Chapitre {contentIndex + 1}:
                      </div>
                      <pre className="text-gray-900 dark:text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {chapitre}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleRemovePlanItem(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Créateur de plan étape par étape */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Créer un nouveau plan de cours
        </h4>

        {/* Étape 1: Définir le titre du chapitre */}
        {etapeCreation === 'titre' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                📝 Étape 1: Définir le titre du chapitre
              </h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre du chapitre
                </label>
                <input
                  type="text"
                  value={chapitreEnCours.titre}
                  onChange={(e) => setChapitreEnCours(prev => ({ ...prev, titre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: Introduction aux bases de données"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={chapitreEnCours.duree}
                  onChange={(e) => setChapitreEnCours(prev => ({ ...prev, duree: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: 2h"
                />
              </div>
            </div>

            <button
              onClick={handleDefinirTitre}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Continuer vers les sous-titres →
            </button>
          </div>
        )}

        {/* Étape 2: Définir les sous-titres */}
        {etapeCreation === 'sousTitres' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                📋 Étape 2: Définir les sous-titres
              </h5>
              <p className="text-xs text-green-600 dark:text-green-400">
                Chapitre: {chapitreEnCours.titre} ({chapitreEnCours.duree})
              </p>
            </div>

            {/* Liste des sous-titres ajoutés */}
            {chapitreEnCours.sousTitres.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sous-titres ajoutés:</h6>
                {chapitreEnCours.sousTitres.map((sousTitre, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 border rounded-lg p-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {index + 1}. {sousTitre.titre} ({sousTitre.duree})
                    </span>
                    <button
                      onClick={() => handleSupprimerSousTitre(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire d'ajout de sous-titre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre du sous-chapitre
                </label>
                <input
                  type="text"
                  value={nouveauSousTitre.titre}
                  onChange={(e) => setNouveauSousTitre(prev => ({ ...prev, titre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: Définition et concepts"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={nouveauSousTitre.duree}
                  onChange={(e) => setNouveauSousTitre(prev => ({ ...prev, duree: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: 1h"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAjouterSousTitre}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
              >
                + Ajouter sous-titre
              </button>
              <button
                onClick={handleAjouterAuPlan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Ajouter au plan →
              </button>
            </div>

            <button
              onClick={() => setEtapeCreation('titre')}
              className="w-full px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              ← Retour au titre
            </button>
          </div>
        )}

        {/* Prévisualisation du plan */}
        {chapitresEnPreview.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                👁️ Prévisualisation du plan
              </h5>
            </div>

            <div className="bg-white dark:bg-gray-700 border rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans leading-relaxed">
                {chapitresEnPreview.join('\n\n')}
              </pre>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleEnregistrerPlan}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none disabled:opacity-50"
              >
                💾 Enregistrer le plan
              </button>
              <button
                onClick={handleAnnulerCreation}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Chargement...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PlansCard;
