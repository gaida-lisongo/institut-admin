"use client";
import React, { useEffect, useState, use } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CycleList from "@/components/cycles/CycleList";
import CycleModal from "@/components/cycles/CycleModal";
import { useCycleStore } from "@/stores/cycleStore";
import { useSectionStore } from "@/stores/sectionStore";
import { PlusIcon } from "@heroicons/react/24/outline";

interface PageProps {
  params: Promise<{
    sectionId: string;
  }>;
}

export default function CyclesPage({ params }: PageProps) {
  const { sectionId } = use(params);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  
  const { 
    cycles, 
    loading, 
    error, 
    fetchCyclesBySection, 
    clearError 
  } = useCycleStore();
  
  const { sections } = useSectionStore();
  
  // Trouver la section correspondante
  const currentSection = sections.find(section => section._id === sectionId);

  useEffect(() => {
    if (sectionId) {
      fetchCyclesBySection(sectionId);
    }
  }, [sectionId, fetchCyclesBySection]);

  const handleCreateCycle = () => {
    setEditingCycle(null);
    setIsModalOpen(true);
  };

  const handleEditCycle = (cycle: any) => {
    setEditingCycle(cycle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCycle(null);
  };

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Cycles", href: "#" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {/* <PageBreadcrumb items={breadcrumbItems} /> */}

      {/* Header de la section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        {currentSection ? (
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cycles de Formation
              </h1>
              <div className="mt-1">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {currentSection.description?.designation}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentSection.description?.sigle || "Section de formation"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cycles de Formation
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chargement des informations de la section...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Cycles
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cycles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Classes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cycles.reduce((total, cycle) => total + cycle.classes.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Systèmes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(cycles.map(cycle => cycle.systeme)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gestion des Cycles
        </h2>
        <button
          onClick={handleCreateCycle}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nouveau Cycle</span>
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={clearError}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Liste des cycles */}
      <CycleList 
        cycles={cycles}
        loading={loading}
        onEdit={handleEditCycle}
        sectionId={sectionId}
      />

      {/* Modal pour créer/modifier un cycle */}
      <CycleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cycle={editingCycle}
        sectionId={sectionId}
      />
    </div>
  );
}