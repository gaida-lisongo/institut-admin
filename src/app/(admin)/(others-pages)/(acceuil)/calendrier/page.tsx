"use client";
import React, { useEffect, useState } from "react";

import CalendrierModal from "@/components/calendrier/CalendrierModal";
import ActivitiesManager from "@/components/calendrier/ActivitiesManager";
import { useSectionStore, type Section, type Calendrier, type Activity } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon, CalendarIcon, PencilIcon } from "@heroicons/react/24/outline";

export default function CalendrierPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    addCalendrierToSection,
    updateCalendrierInSection,
    removeCalendrierFromSection,
    updateActivitiesInCalendrier,
  } = useSectionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCalendrier, setSelectedCalendrier] = useState<{calendrier: Calendrier, sectionId: string, index: number} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activitiesManagerOpen, setActivitiesManagerOpen] = useState(false);
  const [selectedCalendrierForActivities, setSelectedCalendrierForActivities] = useState<{calendrier: Calendrier, sectionId: string, sectionName: string, index: number} | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (calendrier: Calendrier) => {
    if (selectedSectionId === "all" || !selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    
    const success = await addCalendrierToSection(selectedSectionId, calendrier);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEdit = async (calendrier: Calendrier) => {
    if (!selectedCalendrier) return;
    
    const success = await updateCalendrierInSection(selectedCalendrier.sectionId, selectedCalendrier.index, calendrier);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedCalendrier(null);
    }
  };

  const handleDelete = async (item: {sectionId: string, sectionName: string, calendrier: Calendrier, index: number}) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce calendrier ?")) {
      await removeCalendrierFromSection(item.sectionId, item.index);
    }
  };

  const openEditModal = (item: {sectionId: string, sectionName: string, calendrier: Calendrier, index: number}) => {
    setSelectedCalendrier({
      calendrier: item.calendrier,
      sectionId: item.sectionId,
      index: item.index
    });
    setIsEditModalOpen(true);
  };

  const openActivitiesManager = (item: {sectionId: string, sectionName: string, calendrier: Calendrier, index: number}) => {
    setSelectedCalendrierForActivities(item);
    setActivitiesManagerOpen(true);
  };

  const handleUpdateActivities = async (activities: Activity[]) => {
    if (!selectedCalendrierForActivities) return;
    
    const success = await updateActivitiesInCalendrier(
      selectedCalendrierForActivities.sectionId,
      selectedCalendrierForActivities.index,
      activities
    );
    
    if (success) {
      // Mettre à jour l'état local pour refléter les changements
      setSelectedCalendrierForActivities(prev => 
        prev ? {
          ...prev,
          calendrier: {
            ...prev.calendrier,
            activities
          }
        } : null
      );
    }
  };

  // Récupérer tous les calendriers avec leurs informations de section
  const allCalendriers = sections.flatMap(section => 
    section.calendrier.map((calendrier, index) => ({
      sectionId: section._id || '',
      sectionName: section.description.sigle,
      calendrier,
      index
    }))
  );

  // Filtrer les calendriers par section et terme de recherche
  const filteredCalendriers = allCalendriers
    .filter(item => selectedSectionId === "all" || item.sectionId === selectedSectionId)
    .filter(item => 
      item.calendrier.annee.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Statistiques
  const totalCalendriers = allCalendriers.length;
  const calendriersActuels = allCalendriers.filter(item => item.calendrier.current).length;



  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des calendriers académiques
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les calendriers académiques par section
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nouveau calendrier
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une année..."
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total calendriers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCalendriers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Années courantes
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {calendriersActuels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sections actives
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Calendriers filtrés
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredCalendriers.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des calendriers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Calendriers académiques
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCalendriers.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Aucun calendrier trouvé
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucun calendrier académique n'a été créé." 
                  : "Aucun calendrier pour cette section."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCalendriers.map((item, index) => (
                <div
                  key={`${item.sectionId}-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.calendrier.annee}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Section {item.sectionName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.calendrier.current && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                          Courante
                        </span>
                      )}
                      
                      <button
                        onClick={() => openActivitiesManager(item)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg"
                        title="Gérer les activités"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.calendrier.activities.length} activité(s) planifiée(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CalendrierModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer un nouveau calendrier"
      />

      <CalendrierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCalendrier(null);
        }}
        onSubmit={handleEdit}
        calendrier={selectedCalendrier?.calendrier}
        title="Modifier le calendrier"
      />

      {/* Gestionnaire d'activités */}
      {selectedCalendrierForActivities && (
        <ActivitiesManager
          isOpen={activitiesManagerOpen}
          onClose={() => {
            setActivitiesManagerOpen(false);
            setSelectedCalendrierForActivities(null);
          }}
          calendrier={selectedCalendrierForActivities.calendrier}
          onUpdateActivities={handleUpdateActivities}
          sectionName={selectedCalendrierForActivities.sectionName}
        />
      )}
    </div>
  );
}
