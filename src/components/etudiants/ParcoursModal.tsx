"use client";
import React from "react";
import { X, Calendar, GraduationCap, Building2, Award, TrendingUp } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { Parcour } from "@/types/etudiant";

interface ParcoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcours: Parcour[];
  etudiantName: string;
}

export function ParcoursModal({ isOpen, onClose, parcours, etudiantName }: ParcoursModalProps) {
  if (!isOpen) return null;

  const getDecisionColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'admis':
      case 'réussi':
        return 'success';
      case 'échec':
      case 'échoué':
        return 'error';
      case 'en cours':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getAnneeLabel = (annee: any) => {
    if (annee && typeof annee === 'object') {
      return `${annee.debut}-${annee.fin}`;
    }
    return annee || "N/A";
  };

  const getCycleLabel = (cycle: any) => {
    if (cycle && typeof cycle === 'object') {
      return cycle.designation || "N/A";
    }
    return cycle || "N/A";
  };

  const getNiveauLabel = (niveau: any) => {
    if (niveau && typeof niveau === 'object') {
      return niveau.niveau || "N/A";
    }
    return niveau || "N/A";
  };

  const getEtablissementLabel = (etablissement: any) => {
    if (etablissement && typeof etablissement === 'object') {
      return `${etablissement.sigle} - ${etablissement.designation}`;
    }
    return etablissement || "N/A";
  };

  const getFaculteLabel = (parcour: Parcour) => {
    if (parcour.faculteDetails && parcour.faculteDetails.nom) {
      return parcour.faculteDetails.nom;
    }
    return parcour.faculteId || "N/A";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Parcours Académique
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {etudiantName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-6">
            {parcours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <GraduationCap className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun parcours enregistré</p>
                <p className="text-sm">Cet étudiant n'a pas encore de parcours académique.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Total Années
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      {parcours.length}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-300">
                        Réussites
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {parcours.filter(p => p.decision.toLowerCase().includes('admis') || p.decision.toLowerCase().includes('réussi')).length}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                        Cycles
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                      {new Set(parcours.map(p => getCycleLabel(p.cycleId))).size}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                        Niveau Actuel
                      </span>
                    </div>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                      {parcours.length > 0 ? getNiveauLabel(parcours[parcours.length - 1]?.niveau) : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Timeline des parcours */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Historique du Parcours
                  </h3>
                  
                  <div className="space-y-4">
                    {parcours
                      .sort((a, b) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime())
                      .map((parcour, index) => (
                      <div
                        key={parcour._id || index}
                        className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50"
                      >
                        {/* Indicateur de timeline */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                        
                        <div className="ml-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {getNiveauLabel(parcour.niveau)}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge color={getDecisionColor(parcour.decision)}>
                                {parcour.decision}
                              </Badge>
                              <Badge color="info">
                                {getAnneeLabel(parcour.anneeId)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Date d'inscription:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(parcour.dateInscription).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Cycle:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getCycleLabel(parcour.cycleId)}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Faculté:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getFaculteLabel(parcour)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Établissement:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getEtablissementLabel(parcour.etablissementId)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
