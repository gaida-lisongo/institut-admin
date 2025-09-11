"use client";
import React, { useState } from "react";
import { Activity, Calendrier } from "@/stores/sectionStore";
import ActivityModal from "./ActivityModal";
import { PlusIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

interface ActivitiesManagerProps {
  calendrier: Calendrier;
  onUpdateActivities: (activities: Activity[]) => void;
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
}

export default function ActivitiesManager({
  calendrier,
  onUpdateActivities,
  isOpen,
  onClose,
  sectionName,
}: ActivitiesManagerProps) {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<{activity: Activity, index: number} | null>(null);

  const handleAddActivity = (activity: Activity) => {
    const newActivities = [...calendrier.activities, activity];
    onUpdateActivities(newActivities);
    setIsActivityModalOpen(false);
  };

  const handleEditActivity = (activity: Activity) => {
    if (!selectedActivity) return;
    
    const newActivities = [...calendrier.activities];
    newActivities[selectedActivity.index] = activity;
    onUpdateActivities(newActivities);
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (index: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      const newActivities = calendrier.activities.filter((_, i) => i !== index);
      onUpdateActivities(newActivities);
    }
  };

  const openEditModal = (activity: Activity, index: number) => {
    setSelectedActivity({ activity, index });
    setIsActivityModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedActivity(null);
    setIsActivityModalOpen(true);
  };

  // Trier les activités par date
  const sortedActivities = [...calendrier.activities].sort((a, b) => 
    new Date(a.date_activity).getTime() - new Date(b.date_activity).getTime()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Activités - Année {calendrier.annee}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sectionName} {calendrier.current && "(Année courante)"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouvelle activité
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {sortedActivities.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune activité
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Commencez par ajouter des activités pour cette année académique
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Ajouter une activité
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {sortedActivities.length} activité(s) programmée(s)
                </h3>
              </div>

              <div className="grid gap-4">
                {sortedActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {activity.titre}
                          </h4>
                          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {new Date(activity.date_activity).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {activity.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => openEditModal(activity, index)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(index)}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier une activité */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(null);
        }}
        onSubmit={selectedActivity ? handleEditActivity : handleAddActivity}
        activity={selectedActivity?.activity}
        title={selectedActivity ? "Modifier l'activité" : "Nouvelle activité"}
      />
    </div>
  );
}
