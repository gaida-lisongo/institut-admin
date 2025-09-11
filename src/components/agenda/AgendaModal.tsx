"use client";
import React, { useState, useEffect } from "react";
import { XMarkIcon, CalendarIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Agenda, AgendaEvent } from "@/stores/sectionStore";

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agenda: Agenda) => void;
  agenda?: Agenda | null;
  title: string;
  sectionId?: string;
}

const AgendaModal: React.FC<AgendaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  agenda,
  title,
  sectionId,
}) => {
  const [formData, setFormData] = useState<Agenda>({
    annee: "",
    current: false,
    events: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agenda) {
      setFormData({
        ...agenda,
        events: agenda.events.map(event => ({
          ...event,
          date_event: event.date_event instanceof Date ? event.date_event : new Date(event.date_event)
        }))
      });
    } else {
      const currentYear = new Date().getFullYear().toString();
      setFormData({
        annee: currentYear,
        current: false,
        events: [],
      });
    }
  }, [agenda, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEvent = () => {
    const newEvent: AgendaEvent = {
      date_event: new Date(),
      titre: "",
      description: "",
    };
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const updateEvent = (index: number, field: keyof AgendaEvent, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.map((event, i) => 
        i === index ? { ...event, [field]: value } : event
      )
    }));
  };

  const removeEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année *
              </label>
              <input
                type="text"
                value={formData.annee}
                onChange={(e) => setFormData(prev => ({ ...prev, annee: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                placeholder="2024-2025"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="current"
                checked={formData.current}
                onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="current" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Agenda actuel
              </label>
            </div>
          </div>

          {/* Événements */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                Événements ({formData.events.length})
              </h4>
              <button
                type="button"
                onClick={addEvent}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Ajouter
              </button>
            </div>

            {formData.events.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Aucun événement dans cet agenda
                </p>
                <button
                  type="button"
                  onClick={addEvent}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ajouter le premier événement
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.events.map((event, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Événement {index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date et heure */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date et heure *
                        </label>
                        <input
                          type="datetime-local"
                          value={formatDateForInput(event.date_event)}
                          onChange={(e) => updateEvent(index, "date_event", new Date(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          required
                        />
                      </div>

                      {/* Titre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Titre *
                        </label>
                        <input
                          type="text"
                          value={event.titre}
                          onChange={(e) => updateEvent(index, "titre", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Titre de l'événement"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={event.description}
                        onChange={(e) => updateEvent(index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm resize-none"
                        placeholder="Description de l'événement"
                      />
                    </div>

                    {/* Aperçu de la date */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      📅 {event.date_event.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendaModal;