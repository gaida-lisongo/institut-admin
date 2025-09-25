"use client";
import JuryService from "@/services/JuryService";
import React, { useState } from "react";

interface JuryClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jury: any;
  onDeliberationClick: (jury: any, semestre: any) => void;
}

export default function JuryClassesModal({ isOpen, onClose, jury, onDeliberationClick }: JuryClassesModalProps) {
  const [selectedClasse, setSelectedClasse] = useState<string>("");
  const [printOption, setPrintOption] = useState<'single' | 'double'>('single');

  if (!isOpen || !jury) return null;

  const handlePrintGrille =async (classe: any) => {
    // TODO: Implémenter l'impression de la grille de délibération
    console.log("Impression grille:", {
      jury: jury.juryId,
      classe: classe.classeId,
      option: printOption
    });

    try {
      const request = await JuryService.getClasseDetail(`${classe.classeId}/${jury.annee._id}`);
      console.log("Classe details:", request);
      alert(`Impression de la grille de délibération pour la classe ${classe.designation} (${printOption === 'single' ? 'un semestre' : 'deux semestres'})`);
    } catch (error) {
      console.error("Erreur lors de la récupération de la classe:", error);
    }
    
  };

  const handleDeliberationForSemestre = (semestre: any, classe: any) => {
    onDeliberationClick(jury, { ...semestre, classe });
    onClose();
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
                Nombre de semestres à inclure dans la grille
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="single"
                    checked={printOption === 'single'}
                    onChange={(e) => setPrintOption(e.target.value as 'single' | 'double')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Un semestre</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="double"
                    checked={printOption === 'double'}
                    onChange={(e) => setPrintOption(e.target.value as 'single' | 'double')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Deux semestres</span>
                </label>
              </div>
            </div>
          </div>

          {/* Liste des classes avec actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Classes Associées ({jury.classes.length})
            </h3>
            
            <div className="space-y-4">
              {jury.classes.map((classe: any, index: number) => (
                <div key={classe.classeId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {classe.designation}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {classe.description}
                      </p>
                    </div>
                    
                    {/* Bouton Imprimer Grille pour la classe */}
                    <button
                      onClick={() => handlePrintGrille(classe)}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Grille
                    </button>
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
