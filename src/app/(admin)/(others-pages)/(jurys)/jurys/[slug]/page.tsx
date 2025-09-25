"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JuryTitulaire } from "@/services/JuryService";
import useAuthStore from "@/stores/authStore";
import JuryCard from "@/components/jurys/JuryCard";
import JuryClassesModal from "@/components/jurys/JuryClassesModal";
import DeliberationComponent from "@/components/jurys/DeliberationComponent";

export default function JurysByYearPage() {
  const params = useParams();
  const anneeId = params.slug as string;
  const { user, menuData } = useAuthStore();
  const [jurys, setJurys] = useState<JuryTitulaire | null>(null);
  const [filteredJurys, setFilteredJurys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJury, setSelectedJury] = useState<any>(null);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [showDeliberation, setShowDeliberation] = useState(false);
  const [selectedJuryForDeliberation, setSelectedJuryForDeliberation] = useState<any>(null);
  const [anneeInfo, setAnneeInfo] = useState<any>(null);

  useEffect(() => {
    loadJurys();
  }, [anneeId]);

  const loadJurys = async () => {
    try {
      setIsLoading(true);
      console.log("Menu data", menuData);
      const {
        juries : jurysData
      } = menuData;

      console.log( "Data jurys", jurysData);
      // Utiliser les données depuis menuData
      if (jurysData) {
        setJurys(jurysData);
        
        // Filtrer les jurys par année
        if (jurysData?.jurys) {
          const filtered = jurysData.jurys.filter((jury: any) => 
            jury.annee._id === anneeId
          );
          setFilteredJurys(filtered);
          
          // Récupérer les infos de l'année
          if (filtered.length > 0) {
            setAnneeInfo(filtered[0].annee);
          }
        }
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

  const handleDeliberationClick = (jury: any, semestre?: any) => {
    if (!semestre) {
      // Si pas de semestre spécifique, ouvrir le modal des classes pour sélectionner
      setSelectedJury(jury);
      setIsClassesModalOpen(true);
      return;
    }
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
            Jurys - Année {anneeInfo ? `${anneeInfo.debut}-${anneeInfo.fin}` : ''}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Liste des jurys pour l'année académique sélectionnée
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredJurys.length} jury{filteredJurys.length > 1 ? 's' : ''} trouvé{filteredJurys.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="/jurys" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
              <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
              </svg>
              Tous les jurys
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                Année {anneeInfo ? `${anneeInfo.debut}-${anneeInfo.fin}` : ''}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {filteredJurys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun jury pour cette année
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'êtes assigné à aucun jury pour l'année académique {anneeInfo ? `${anneeInfo.debut}-${anneeInfo.fin}` : 'sélectionnée'}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJurys.map((jury, index) => (
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
      />
    </div>
  );
}