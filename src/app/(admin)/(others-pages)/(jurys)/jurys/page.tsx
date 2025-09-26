"use client";
import React, { useEffect, useState } from "react";
import { JuryTitulaire } from "@/services/JuryService";
import useAuthStore from "@/stores/authStore";
import JuryCard from "@/components/jurys/JuryCard";
import JuryClassesModal from "@/components/jurys/JuryClassesModal";
import DeliberationComponent from "@/components/jurys/DeliberationComponent";

export default function JurysPage() {
  const { user, menuData } = useAuthStore();
  const [jurys, setJurys] = useState<JuryTitulaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJury, setSelectedJury] = useState<any>(null);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [showDeliberation, setShowDeliberation] = useState(false);
  const [selectedJuryForDeliberation, setSelectedJuryForDeliberation] = useState<any>(null);

  useEffect(() => {
    loadJurys();
  }, []);

  const loadJurys = async () => {
    try {
      setIsLoading(true);
      console.log("Menu data", menuData);
      const {
        juries : jurysData
      } = menuData;

      console.log( "Data jurys", jurysData);
      // Simuler le chargement des données depuis le store auth
      // En réalité, cela viendrait de user.courses.jurys ou d'un service
      if (jurysData) {
        // Adapter selon la structure réelle de vos données
        setJurys(jurysData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des jurys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJuryClick = (jury: any) => {
    setSelectedJury(jury);
    setIsClassesModalOpen(true);
  };

  const handleDeliberationClick = (jury: any, semestre: any) => {
    setSelectedJuryForDeliberation({ jury, semestre });
    setShowDeliberation(true);
  };

  const handleBackToJurys = () => {
    setShowDeliberation(false);
    setSelectedJuryForDeliberation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDeliberation && selectedJuryForDeliberation) {
    return (
      <DeliberationComponent 
        jury={selectedJuryForDeliberation.jury}
        semestre={selectedJuryForDeliberation.semestre}
        onBack={handleBackToJurys}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Tous les Jurys
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Liste complète de tous vos jurys toutes années confondues
          </p>
        </div>
      </div>

      {!jurys?.jurys || jurys.jurys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun jury assigné
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'êtes actuellement assigné à aucun jury.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jurys.jurys.map((jury, index) => (
            <JuryCard
              key={`${jury.juryId}-${index}`}
              jury={jury}
              onJuryClick={handleJuryClick}
              onDeliberationClick={handleDeliberationClick}
            />
          ))}
        </div>
      )}

      {/* Modal des classes */}
      <JuryClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        jury={selectedJury}
        onDeliberationClick={handleDeliberationClick}
        onJuryUpdated={loadJurys}
      />
    </div>
  );
}