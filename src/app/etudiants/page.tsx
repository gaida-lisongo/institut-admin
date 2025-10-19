"use client";
import React, { useState } from "react";
import EtudiantsList from "@/components/etudiants/EtudiantsList";
import { ParcoursModal } from "@/components/etudiants/ParcoursModal";
import { EtablissementPopulated } from "@/types/etablissement";
import { Parcour } from "@/types/etudiant";
import { useEtablissementStore } from "@/stores/etablissementStore";
import { useEffect } from "react";
import { Loader, Building2 } from "lucide-react";

export default function EtudiantsPage() {
  const { etablissements, fetchEtablissements, isLoading } = useEtablissementStore();
  const [selectedEtablissement, setSelectedEtablissement] = useState<EtablissementPopulated | null>(null);
  const [isParcoursModalOpen, setIsParcoursModalOpen] = useState(false);
  const [selectedParcours, setSelectedParcours] = useState<Parcour[]>([]);
  const [selectedEtudiantName, setSelectedEtudiantName] = useState("");

  useEffect(() => {
    fetchEtablissements();
  }, []);

  useEffect(() => {
    if (etablissements.length > 0 && !selectedEtablissement) {
      setSelectedEtablissement(etablissements[0]);
    }
  }, [etablissements, selectedEtablissement]);

  const handleParcoursView = (parcours: Parcour[], etudiantName: string = "Étudiant") => {
    setSelectedParcours(parcours);
    setSelectedEtudiantName(etudiantName);
    setIsParcoursModalOpen(true);
  };

  const handleEtablissementChange = (etablissement: EtablissementPopulated) => {
    setSelectedEtablissement(etablissement);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement des établissements...</p>
        </div>
      </div>
    );
  }

  if (!selectedEtablissement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun établissement disponible
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Veuillez d'abord créer un établissement pour voir les étudiants.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header avec sélecteur d'établissement */}
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Étudiants
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Consultez et gérez les étudiants par établissement, année et classe
            </p>
          </div>

          {/* Sélecteur d'établissement */}
          {etablissements.length > 1 && (
            <div className="relative">
              <select
                value={selectedEtablissement._id}
                onChange={(e) => {
                  const etablissement = etablissements.find(etab => etab._id === e.target.value);
                  if (etablissement) {
                    handleEtablissementChange(etablissement);
                  }
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {etablissements.map((etablissement) => (
                  <option key={etablissement._id} value={etablissement._id}>
                    {etablissement.sigle} - {etablissement.designation}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Liste des étudiants */}
      <EtudiantsList
        etablissement={selectedEtablissement}
        onParcoursView={(parcours) => handleParcoursView(parcours, "Étudiant sélectionné")}
      />

      {/* Modal des parcours */}
      <ParcoursModal
        isOpen={isParcoursModalOpen}
        onClose={() => setIsParcoursModalOpen(false)}
        parcours={selectedParcours}
        etudiantName={selectedEtudiantName}
      />
    </div>
  );
}
