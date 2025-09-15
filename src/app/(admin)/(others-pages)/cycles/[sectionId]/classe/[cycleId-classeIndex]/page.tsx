"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useCycleStore } from "@/stores/cycleStore";
import { useSectionStore } from "@/stores/sectionStore";
import ClasseBanner from "@/components/cycles/ClasseBanner";
import SemestreList from "@/components/cycles/SemestreList";
import SemestreModal from "@/components/cycles/SemestreModal";
import UnitesSemestreModal from "@/components/cycles/UnitesSemestreModal";
import { ArrowLeft, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{
    sectionId: string;
    "cycleId-classeIndex": string;
  }>;
}

export default function ClasseSemestresPage({ params }: PageProps) {
  const { sectionId, "cycleId-classeIndex": cycleClasseParam } = use(params);
  const router = useRouter();
  
  // Parser le paramètre cycleId-classeIndex
  const [cycleId, classeIndex] = cycleClasseParam.split('-');
  
  const { 
    cycles, 
    currentCycle, 
    loading, 
    error, 
    fetchCycle,
    clearError 
  } = useCycleStore();
  
  const { sections } = useSectionStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemestre, setEditingSemestre] = useState(null);
  const [selectedSemestreForUnites, setSelectedSemestreForUnites] = useState(null);

  // Trouver la section et le cycle
  const currentSection = sections.find(section => section._id === sectionId);
  const cycle = currentCycle || cycles.find(c => c._id === cycleId);
  const classe = cycle?.classes[parseInt(classeIndex)];
  
  useEffect(() => {
    if (cycleId) {
      fetchCycle(cycleId);
    }
  }, [cycleId, fetchCycle]);

  const handleCreateSemestre = () => {
    setEditingSemestre(null);
    setIsModalOpen(true);
  };

  const handleEditSemestre = (semestre: any) => {
    setEditingSemestre(semestre);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSemestre(null);
  };

  const handleManageUnites = (semestre: any) => {
    setSelectedSemestreForUnites(semestre);
  };

  const handleGoBack = () => {
    router.push(`/cycles/${sectionId}`);
  };

  // Validation des paramètres
  if (!cycleId || !classeIndex || isNaN(parseInt(classeIndex))) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Paramètres de route invalides</p>
        <p className="text-sm text-gray-500 mt-2">
          Format attendu: cycleId-classeIndex (ex: 123abc-0)
        </p>
        <button 
          onClick={handleGoBack}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Retour aux cycles
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cycle || !classe) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Classe non trouvée</p>
        <p className="text-sm text-gray-500 mt-2">
          Cycle ID: {cycleId}, Classe Index: {classeIndex}
        </p>
        <button 
          onClick={handleGoBack}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Retour aux cycles
        </button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Cycles", href: `/cycles/${sectionId}` },
    { label: cycle.designation, href: `/cycles/${sectionId}` },
    { label: classe.designation, href: "#" }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        {/* <PageBreadcrumb items={breadcrumbItems} /> */}
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
      </div>

      {/* Bannière de la classe */}
      <ClasseBanner 
        classe={classe}
        cycle={cycle}
        section={currentSection}
      />

      {/* Messages d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <span className="text-red-700">{error}</span>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions principales */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestion des Semestres
        </h2>
        <button
          onClick={handleCreateSemestre}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Semestre</span>
        </button>
      </div>

      {/* Liste des semestres */}
      <SemestreList
        classe={classe}
        cycleId={cycleId}
        classeIndex={parseInt(classeIndex)}
        onEdit={handleEditSemestre}
        onManageUnites={handleManageUnites}
      />

      {/* Modal de création/édition de semestre */}
      <SemestreModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        semestre={editingSemestre}
        cycleId={cycleId}
        classeIndex={parseInt(classeIndex)}
      />

      {/* Modal de gestion des unités */}
      {selectedSemestreForUnites && (
        <UnitesSemestreModal
          isOpen={!!selectedSemestreForUnites}
          onClose={() => setSelectedSemestreForUnites(null)}
          semestre={selectedSemestreForUnites}
        />
      )}
    </div>
  );
}