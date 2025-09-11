"use client";
import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Galery, Event } from "@/stores/sectionStore";
import blobManager from "@/services/BlobManager";

interface GalerieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (galery: Galery) => void;
  galery?: Galery | null;
  title: string;
  sectionId?: string;
}

const GalerieModal: React.FC<GalerieModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  galery,
  title,
  sectionId,
}) => {
  const [formData, setFormData] = useState<Galery>({
    annee: "",
    current: false,
    events: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (galery) {
      setFormData(galery);
    } else {
      const currentYear = new Date().getFullYear().toString();
      setFormData({
        annee: currentYear,
        current: false,
        events: [],
      });
    }
  }, [galery, isOpen]);

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
    const newEvent: Event = {
      photo: "",
      titre: "",
      description: "",
    };
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const updateEvent = (index: number, field: keyof Event, value: string) => {
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

  const handleImageUpload = async (eventIndex: number, file: File) => {
    try {
      const result = await blobManager.createBlob(file);
      updateEvent(eventIndex, "photo", result.url);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload de l'image");
    }
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
                Galerie actuelle
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
                <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Aucun événement dans cette galerie
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
                      {/* Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Photo
                        </label>
                        <div className="space-y-2">
                          {event.photo && (
                            <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <img
                                src={event.photo}
                                alt={event.titre || `Événement ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(index, file);
                              }
                            }}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Titre
                          </label>
                          <input
                            type="text"
                            value={event.titre}
                            onChange={(e) => updateEvent(index, "titre", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="Titre de l'événement"
                          />
                        </div>

                        <div>
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
                      </div>
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

export default GalerieModal;