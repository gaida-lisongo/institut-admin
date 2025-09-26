"use client";
import JuryService from "@/services/JuryService";
import React, { useState } from "react";
import GrilleDocument from "@/utils/GrilleDocument";
import { toGrilleDocumentData } from "@/utils/mappers/grilleMapper";
import { SessionType } from "@/types/juryClasseDetail";
import { useCycleStore } from "@/stores/cycleStore";

interface JuryClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jury: any;
  onDeliberationClick: (jury: any, semestre: any) => void;
  onJuryUpdated?: () => void; // Callback pour recharger les données
}

export default function JuryClassesModal({ isOpen, onClose, jury, onDeliberationClick, onJuryUpdated }: JuryClassesModalProps) {
  const [selectedClasse, setSelectedClasse] = useState<string>("");
  const [sessionType, setSessionType] = useState<SessionType>('principale');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [updatingVision, setUpdatingVision] = useState<Record<string, boolean>>({});
  const [localJuryData, setLocalJuryData] = useState<any>(null);
  
  // Utiliser le store pour la gestion de la vision des classes
  const { updateClasseVision } = useCycleStore();
  
  // Initialiser les données locales du jury
  React.useEffect(() => {
    if (jury) {
      setLocalJuryData({ ...jury });
    }
  }, [jury]);

  if (!isOpen || !localJuryData) return null;
  console.log("Jury:", localJuryData);
  const handlePrintGrille =async (classe: any) => {
    console.log("Impression grille:", {
      jury: localJuryData.juryId,
      classe: classe.classeId,
      session: sessionType
    });

    try {
      setIsPrinting(true);
      const response = await JuryService.getClasseDetail(`${classe.classeId}/${localJuryData.annee._id}`);
      console.log("Classe details:", response);

      // Construire les données pour le document Excel
      const anneeAcademique = `${localJuryData.annee.debut}-${localJuryData.annee.fin}`;
      const data = toGrilleDocumentData(response, anneeAcademique, sessionType);
      console.log("Data pour le document Excel:", data);
      // Télécharger la grille
      await GrilleDocument.downloadGrille(
        localJuryData,
        data,
        `grille_${classe.designation.replace(/\s+/g, '_')}_${anneeAcademique}_${sessionType}.xlsx`
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la classe:", error);
      alert("Une erreur est survenue lors de la génération de la grille. Veuillez réessayer.");
    } finally {
      setIsPrinting(false);
    }
    
  };

  const handlePrintPalmaresse = async (classe: any) => {
    console.log("Impression palmarès:", {
      jury: localJuryData.juryId,
      classe: classe.classeId,
      session: sessionType
    });

    try {
      setIsPrinting(true);
      const response = await JuryService.getClasseDetail(`${classe.classeId}/${localJuryData.annee._id}`);
      console.log("Classe details:", response);

      // Construire les données pour le document Excel
      const anneeAcademique = `${localJuryData.annee.debut}-${localJuryData.annee.fin}`;
      const data = toGrilleDocumentData(response, anneeAcademique, sessionType);
      console.log("Data pour le palmarès:", data);
      
      // Télécharger le palmarès
      await GrilleDocument.downloadPalmaresse(
        localJuryData,
        data,
        `palmaresse_${classe.designation.replace(/\s+/g, '_')}_${anneeAcademique}_${sessionType}.xlsx`
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la classe:", error);
      alert("Une erreur est survenue lors de la génération du palmarès. Veuillez réessayer.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDeliberationForSemestre = (semestre: any, classe: any) => {
    onDeliberationClick(localJuryData, { ...semestre, classe });
    onClose();
  };

  // Fonction pour toggle la vision d'une classe en utilisant le store
  const handleToggleVision = async (classeId: string, currentVision: string) => {
    const newVision = currentVision === 'active' ? 'inactive' : 'active';
    
    setUpdatingVision(prev => ({ ...prev, [classeId]: true }));
    
    try {
      // Utiliser le store qui gère la persistance backend et locale
      await updateClasseVision(classeId, newVision);
      
      // Mettre à jour les données locales du jury pour un re-render immédiat
      setLocalJuryData((prevJury: any) => {
        if (prevJury && prevJury.classes) {
          return {
            ...prevJury,
            classes: prevJury.classes.map((classe: any) => 
              classe.classeId === classeId ? { ...classe, vision: newVision } : classe
            )
          };
        }
        return prevJury;
      });
      
      console.log(`Vision de la classe ${classeId} mise à jour: ${newVision}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vision:', error);
      alert('Une erreur est survenue lors de la mise à jour de la vision');
    } finally {
      setUpdatingVision(prev => ({ ...prev, [classeId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Classes du Jury
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {jury.designation} - {jury.code}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Informations du jury */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Section</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {jury.section.description.sigle} - {jury.section.description.designation}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Année Académique</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {jury.annee.debut}-{jury.annee.fin}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Votre Rôle</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  jury.role.toLowerCase() === 'président' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : jury.role.toLowerCase() === 'secrétaire'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {jury.role}
                </span>
              </div>
            </div>
          </div>

          {/* Options d'impression globales */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Options d'Impression
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de grille de délibération
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="principale">Session Principale (CMI + Examen)</option>
                <option value="rattrapage">Session de Rattrapage</option>
                <option value="annuelle">Grille Annuelle (Consolidée)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {sessionType === 'principale' && 'Notes basées sur (CMI + Examen) / 2'}
                {sessionType === 'rattrapage' && 'Notes de la session de rattrapage uniquement'}
                {sessionType === 'annuelle' && 'Meilleure note entre session principale et rattrapage'}
              </p>
            </div>
          </div>

          {/* Liste des classes avec actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Classes Associées ({localJuryData.classes.length})
            </h3>
            
            <div className="space-y-4">
              {localJuryData.classes.map((classe: any, index: number) => (
                <div key={classe.classeId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {classe.designation}
                        </h4>
                        
                        {/* Toggle Vision de la classe */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Vision:</span>
                          <button
                            onClick={() => handleToggleVision(classe.classeId, classe.vision || 'inactive')}
                            disabled={updatingVision[classe.classeId]}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              (classe.vision || 'inactive') === 'active' 
                                ? 'bg-green-600' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            } ${updatingVision[classe.classeId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                (classe.vision || 'inactive') === 'active' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${
                            (classe.vision || 'inactive') === 'active' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {updatingVision[classe.classeId] ? 'Mise à jour...' : 
                             (classe.vision || 'inactive') === 'active' ? 'Activée' : 'Désactivée'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {classe.description}
                      </p>
                    </div>
                    
                    {/* Boutons Grille et Palmarès pour la classe */}
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handlePrintGrille(classe)}
                        disabled={isPrinting}
                        className={`px-3 py-1 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${isPrinting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        {isPrinting ? 'Génération...' : 'Grille'}
                      </button>
                      
                      <button
                        onClick={() => handlePrintPalmaresse(classe)}
                        disabled={isPrinting}
                        className={`px-3 py-1 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center ${isPrinting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {isPrinting ? 'Génération...' : 'Palmarès'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Semestres ({classe.semestres.length})
                    </h5>
                    {classe.semestres.map((semestre: any) => (
                      <div key={semestre.semestreId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{semestre.designation}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {semestre.unites.length} unité{semestre.unites.length > 1 ? 's' : ''}
                            {semestre.description && ` • ${semestre.description}`}
                          </div>
                        </div>
                        
                        {/* Bouton Délibérer pour le semestre */}
                        <button
                          onClick={() => handleDeliberationForSemestre(semestre, classe)}
                          className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Délibérer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
