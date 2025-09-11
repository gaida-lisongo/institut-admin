"use client";
import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useSectionStore } from "@/stores/sectionStore";
import GalerieModal from "@/components/galerie/GalerieModal";
import { Galery, Section, Event } from "@/stores/sectionStore";

const GaleriePage = () => {
  const {
    sections,
    fetchSections,
    addGaleryToSection,
    updateGaleryInSection,
    removeGaleryFromSection,
  } = useSectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGalery, setSelectedGalery] = useState<Galery | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedGaleryIndex, setSelectedGaleryIndex] = useState<number>(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleAddGalery = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedGalery(null);
    setSelectedGaleryIndex(-1);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditGalery = (sectionId: string, galery: Galery, index: number) => {
    setSelectedSectionId(sectionId);
    setSelectedGalery(galery);
    setSelectedGaleryIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmitGalery = async (galeryData: Galery) => {
    try {
      if (isEditing && selectedGaleryIndex >= 0) {
        await updateGaleryInSection(selectedSectionId, selectedGaleryIndex, galeryData);
      } else {
        await addGaleryToSection(selectedSectionId, galeryData);
      }
      setIsModalOpen(false);
      setSelectedGalery(null);
      setSelectedSectionId("");
      setSelectedGaleryIndex(-1);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      throw error;
    }
  };

  const handleDeleteGalery = async (sectionId: string, index: number) => {
    try {
      await removeGaleryFromSection(sectionId, index);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const confirmDelete = (sectionId: string, galeryAnnee: string, index: number) => {
    setDeleteConfirm(`${sectionId}-${galeryAnnee}-${index}`);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Calcul des statistiques globales
  const totalGaleries = sections.reduce((sum: number, section: Section) => sum + (section.galery?.length || 0), 0);
  const totalEvents = sections.reduce((sum: number, section: Section) => {
    return sum + (section.galery?.reduce((eventSum: number, galery: Galery) => eventSum + (galery.events?.length || 0), 0) || 0);
  }, 0);
  const currentGaleries = sections.reduce((sum: number, section: Section) => {
    return sum + (section.galery?.filter((g: Galery) => g.current).length || 0);
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Galeries
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez toutes les galeries photos et événements des sections
            </p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <PhotoIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total galeries
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalGaleries}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <EyeIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total événements
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Galeries actuelles
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentGaleries}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <PhotoIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sections
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sections et leurs galeries */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Aucune section trouvée
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Créez d'abord des sections pour pouvoir gérer leurs galeries.
              </p>
            </div>
          </div>
        ) : (
          sections.map((section: Section) => {
            const galeries = section.galery || [];
            const currentGalery = galeries.find((g: Galery) => g.current);
            const sectionTotalEvents = galeries.reduce((sum: number, g: Galery) => sum + (g.events?.length || 0), 0);

            return (
              <div key={section._id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                {/* En-tête de section */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {section.description.designation}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {galeries.length} galerie{galeries.length > 1 ? 's' : ''} • {sectionTotalEvents} événement{sectionTotalEvents > 1 ? 's' : ''}
                        {currentGalery && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Galerie actuelle: {currentGalery.annee}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddGalery(section._id!)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Nouvelle galerie
                    </button>
                  </div>
                </div>

                {/* Liste des galeries de la section */}
                {galeries.length === 0 ? (
                  <div className="text-center py-8">
                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Aucune galerie
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Créez la première galerie pour cette section.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleAddGalery(section._id!)}
                        className="flex items-center mx-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Créer la première galerie
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {galeries.map((galery: Galery, index: number) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <CalendarIcon className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                  Année {galery.annee}
                                </p>
                                {galery.current && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Actuelle
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {galery.events?.length || 0} événement{(galery.events?.length || 0) > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {deleteConfirm === `${section._id}-${galery.annee}-${index}` ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Confirmer ?
                                </span>
                                <button
                                  onClick={() => handleDeleteGalery(section._id!, index)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                  Oui
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditGalery(section._id!, galery, index)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                  title="Modifier"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(section._id!, galery.annee, index)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Aperçu des événements */}
                        {galery.events && galery.events.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Événements récents :
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {galery.events.slice(0, 3).map((event: Event, eventIndex: number) => (
                                <div key={eventIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  {event.photo ? (
                                    <img
                                      src={event.photo}
                                      alt={event.titre}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                      <PhotoIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {event.titre || 'Sans titre'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {event.description || 'Aucune description'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {galery.events.length > 3 && (
                                <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    +{galery.events.length - 3} autres
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <GalerieModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGalery(null);
          setSelectedSectionId("");
          setSelectedGaleryIndex(-1);
        }}
        onSubmit={handleSubmitGalery}
        galery={selectedGalery}
        title={isEditing ? "Modifier la galerie" : "Nouvelle galerie"}
        sectionId={selectedSectionId}
      />
    </div>
  );
};

export default GaleriePage;