"use client";
import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useSectionStore } from "@/stores/sectionStore";
import AgendaModal from "@/components/agenda/AgendaModal";
import { Agenda, Section, AgendaEvent } from "@/stores/sectionStore";

const AgendaPage = () => {
  const {
    sections,
    fetchSections,
    addAgendaToSection,
    updateAgendaInSection,
    removeAgendaFromSection,
  } = useSectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedAgendaIndex, setSelectedAgendaIndex] = useState<number>(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleAddAgenda = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedAgenda(null);
    setSelectedAgendaIndex(-1);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditAgenda = (sectionId: string, agenda: Agenda, index: number) => {
    setSelectedSectionId(sectionId);
    setSelectedAgenda(agenda);
    setSelectedAgendaIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmitAgenda = async (agendaData: Agenda) => {
    try {
      if (isEditing && selectedAgendaIndex >= 0) {
        await updateAgendaInSection(selectedSectionId, selectedAgendaIndex, agendaData);
      } else {
        await addAgendaToSection(selectedSectionId, agendaData);
      }
      setIsModalOpen(false);
      setSelectedAgenda(null);
      setSelectedSectionId("");
      setSelectedAgendaIndex(-1);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      throw error;
    }
  };

  const handleDeleteAgenda = async (sectionId: string, index: number) => {
    try {
      await removeAgendaFromSection(sectionId, index);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const confirmDelete = (sectionId: string, agendaAnnee: string, index: number) => {
    setDeleteConfirm(`${sectionId}-${agendaAnnee}-${index}`);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Calcul des statistiques globales
  const totalAgendas = sections.reduce((sum: number, section: Section) => sum + (section.agenda?.length || 0), 0);
  const totalEvents = sections.reduce((sum: number, section: Section) => {
    return sum + (section.agenda?.reduce((eventSum: number, agenda: Agenda) => eventSum + (agenda.events?.length || 0), 0) || 0);
  }, 0);
  const currentAgendas = sections.reduce((sum: number, section: Section) => {
    return sum + (section.agenda?.filter((a: Agenda) => a.current).length || 0);
  }, 0);

  // Événements à venir (dans les 30 prochains jours)
  const upcomingEvents = sections.reduce((events: Array<{event: AgendaEvent, sectionName: string}>, section: Section) => {
    const sectionEvents = section.agenda?.flatMap(agenda => 
      agenda.events?.filter(event => {
        const eventDate = event.date_event instanceof Date ? event.date_event : new Date(event.date_event);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= thirtyDaysFromNow;
      }).map(event => ({
        event,
        sectionName: section.description.designation
      })) || []
    ) || [];
    return [...events, ...sectionEvents];
  }, []).sort((a, b) => {
    const dateA = a.event.date_event instanceof Date ? a.event.date_event : new Date(a.event.date_event);
    const dateB = b.event.date_event instanceof Date ? b.event.date_event : new Date(b.event.date_event);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Agendas
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez tous les agendas et événements des sections
            </p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total agendas
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalAgendas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-8 h-8 text-green-600" />
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
              <ClockIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Agendas actuels
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentAgendas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Événements à venir
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {upcomingEvents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Événements à venir */}
        {upcomingEvents.length > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">
              📅 Événements à venir (30 prochains jours)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingEvents.slice(0, 6).map((item, index) => {
                const eventDate = item.event.date_event instanceof Date ? item.event.date_event : new Date(item.event.date_event);
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.event.titre}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {item.sectionName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {eventDate.toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                );
              })}
              {upcomingEvents.length > 6 && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{upcomingEvents.length - 6} autres
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Liste des sections et leurs agendas */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Aucune section trouvée
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Créez d'abord des sections pour pouvoir gérer leurs agendas.
              </p>
            </div>
          </div>
        ) : (
          sections.map((section: Section) => {
            const agendas = section.agenda || [];
            const currentAgenda = agendas.find((a: Agenda) => a.current);
            const sectionTotalEvents = agendas.reduce((sum: number, a: Agenda) => sum + (a.events?.length || 0), 0);

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
                        {agendas.length} agenda{agendas.length > 1 ? 's' : ''} • {sectionTotalEvents} événement{sectionTotalEvents > 1 ? 's' : ''}
                        {currentAgenda && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Agenda actuel: {currentAgenda.annee}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddAgenda(section._id!)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Nouvel agenda
                    </button>
                  </div>
                </div>

                {/* Liste des agendas de la section */}
                {agendas.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Aucun agenda
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Créez le premier agenda pour cette section.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleAddAgenda(section._id!)}
                        className="flex items-center mx-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Créer le premier agenda
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {agendas.map((agenda: Agenda, index: number) => (
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
                                  Année {agenda.annee}
                                </p>
                                {agenda.current && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Actuel
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {agenda.events?.length || 0} événement{(agenda.events?.length || 0) > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {deleteConfirm === `${section._id}-${agenda.annee}-${index}` ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Confirmer ?
                                </span>
                                <button
                                  onClick={() => handleDeleteAgenda(section._id!, index)}
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
                                  onClick={() => handleEditAgenda(section._id!, agenda, index)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                  title="Modifier"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(section._id!, agenda.annee, index)}
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
                        {agenda.events && agenda.events.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Événements récents :
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {agenda.events.slice(0, 3).map((event: AgendaEvent, eventIndex: number) => {
                                const eventDate = event.date_event instanceof Date ? event.date_event : new Date(event.date_event);
                                return (
                                  <div key={eventIndex} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {event.titre || 'Sans titre'}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {event.description || 'Aucune description'}
                                      </p>
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {eventDate.toLocaleDateString('fr-FR', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {agenda.events.length > 3 && (
                                <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    +{agenda.events.length - 3} autres
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
      <AgendaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgenda(null);
          setSelectedSectionId("");
          setSelectedAgendaIndex(-1);
        }}
        onSubmit={handleSubmitAgenda}
        agenda={selectedAgenda}
        title={isEditing ? "Modifier l'agenda" : "Nouvel agenda"}
        sectionId={selectedSectionId}
      />
    </div>
  );
};

export default AgendaPage;