"use client";
import React, { useEffect, useState } from "react";
import HistoryModal from "@/components/history/HistoryModal";
import { useSectionStore, type Section, type History } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function HistoriquePage() {
  const {
    sections,
    isLoading,
    fetchSections,
    addHistoryToSection,
    updateHistoryInSection,
    removeHistoryFromSection,
  } = useSectionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{history: History, sectionId: string, index: number} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (history: History) => {
    if (selectedSectionId === "all" || !selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    
    const success = await addHistoryToSection(selectedSectionId, history);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEdit = async (history: History) => {
    if (!selectedHistory) return;
    
    const success = await updateHistoryInSection(selectedHistory.sectionId, selectedHistory.index, history);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedHistory(null);
    }
  };

  const handleDelete = async (item: {sectionId: string, sectionName: string, history: History, index: number}) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement historique ?")) {
      await removeHistoryFromSection(item.sectionId, item.index);
    }
  };

  const openEditModal = (item: {sectionId: string, sectionName: string, history: History, index: number}) => {
    setSelectedHistory({
      history: item.history,
      sectionId: item.sectionId,
      index: item.index
    });
    setIsEditModalOpen(true);
  };

  // Récupérer tout l'historique avec les informations de section
  const allHistory = sections.flatMap(section => 
    section.history.map((history, index) => ({
      sectionId: section._id || '',
      sectionName: section.description.sigle,
      history,
      index
    }))
  );

  // Filtrer l'historique par section et terme de recherche
  const filteredHistory = allHistory
    .filter(item => selectedSectionId === "all" || item.sectionId === selectedSectionId)
    .filter(item => 
      item.history.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.history.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.history.date_event).getTime() - new Date(a.history.date_event).getTime());

  // Statistiques
  const totalHistory = allHistory.length;
  const historyParSection = sections.map(section => ({
    section: section.description.sigle,
    count: section.history.length
  }));

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion de l'historique
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez l'historique par section
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nouvel événement
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtre par section */}
          <div className="w-full sm:w-64">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les sections</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.description.sigle} - {section.description.designation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total événements
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalHistory}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sections actives
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Événements filtrés
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredHistory.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Moyenne par section
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {sections.length > 0 ? Math.round(totalHistory / sections.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de l'historique */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Chronologie historique
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredHistory.length} événement(s) trouvé(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">📜</div>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucun événement historique trouvé" 
                  : "Aucun événement dans cette section"}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Ligne de timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              <div className="space-y-8">
                {filteredHistory.map((item, index) => (
                  <div key={`${item.sectionId}-${item.index}`} className="relative flex items-start">
                    {/* Point de timeline */}
                    <div className="absolute left-6 w-4 h-4 bg-blue-600 border-4 border-white dark:border-gray-800 rounded-full"></div>
                    
                    {/* Contenu */}
                    <div className="ml-16 w-full">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {new Date(item.history.date_event).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {item.sectionName}
                              </span>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {item.history.titre}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.history.description}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <HistoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer un nouvel événement"
      />

      <HistoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHistory(null);
        }}
        onSubmit={handleEdit}
        history={selectedHistory?.history}
        title="Modifier l'événement"
      />
    </div>
  );
}
