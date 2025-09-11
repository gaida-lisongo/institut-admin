"use client";
import React, { useState, useEffect } from "react";
import { Event } from "@/stores/sectionStore";
import BlobManager from "@/services/BlobManager";
import { 
  PlusIcon, 
  TrashIcon, 
  PhotoIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (events: Event[]) => Promise<void>;
  events?: Event[];
  title: string;
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  events = [],
  title,
}: EventModalProps) {
  const [formData, setFormData] = useState<Event[]>([]);
  const [isEditingEvent, setIsEditingEvent] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    photo: "",
    titre: "",
    description: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData([...events]);
      setIsEditingEvent(null);
      setNewEvent({ photo: "", titre: "", description: "" });
      setSelectedFile(null);
    }
  }, [isOpen, events]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const result = await BlobManager.createBlob(selectedFile);
      setSelectedFile(null);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.titre.trim() || !newEvent.description.trim()) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    let photoUrl = newEvent.photo;
    if (selectedFile) {
      const uploadedUrl = await uploadFile();
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      } else {
        return; // Upload failed
      }
    }

    if (!photoUrl) {
      alert("Veuillez sélectionner une image");
      return;
    }

    const eventToAdd: Event = {
      ...newEvent,
      photo: photoUrl
    };

    setFormData(prev => [...prev, eventToAdd]);
    setNewEvent({ photo: "", titre: "", description: "" });
    setSelectedFile(null);
  };

  const handleEditEvent = async (index: number) => {
    const currentEvent = formData[index];
    let photoUrl = currentEvent.photo;

    if (selectedFile) {
      const uploadedUrl = await uploadFile();
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      } else {
        return; // Upload failed
      }
    }

    const updatedEvent: Event = {
      ...newEvent,
      photo: photoUrl
    };

    setFormData(prev => prev.map((event, i) => i === index ? updatedEvent : event));
    setIsEditingEvent(null);
    setNewEvent({ photo: "", titre: "", description: "" });
    setSelectedFile(null);
  };

  const startEditEvent = (index: number) => {
    const event = formData[index];
    setNewEvent({ ...event });
    setIsEditingEvent(index);
  };

  const cancelEdit = () => {
    setIsEditingEvent(null);
    setNewEvent({ photo: "", titre: "", description: "" });
    setSelectedFile(null);
  };

  const removeEvent = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Contenu scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ajouter/Modifier un événement */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {isEditingEvent !== null ? 'Modifier l\'événement' : 'Ajouter un nouvel événement'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image *
                  </label>
                  
                  {newEvent.photo || selectedFile ? (
                    <div className="relative">
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : newEvent.photo}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (isEditingEvent === null) {
                            setNewEvent(prev => ({ ...prev, photo: "" }));
                          }
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <div className="text-center">
                        <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <label htmlFor="event-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Sélectionner une image
                          </span>
                          <input
                            id="event-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={newEvent.titre}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, titre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                      placeholder="Titre de l'événement"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                      placeholder="Description de l'événement"
                      required
                    />
                  </div>

                  {/* Boutons d'action pour l'événement */}
                  <div className="flex space-x-2">
                    {isEditingEvent !== null ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditEvent(isEditingEvent)}
                          disabled={isUploading}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {isUploading ? 'Upload...' : 'Modifier'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddEvent}
                        disabled={isUploading}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUploading ? 'Upload...' : 'Ajouter'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des événements */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Événements dans la galerie ({formData.length})
              </h4>

              {formData.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Aucun événement dans cette galerie
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.map((event, index) => (
                    <div key={index} className="bg-white dark:bg-gray-600 rounded-lg shadow overflow-hidden">
                      <div className="relative">
                        <img
                          src={event.photo}
                          alt={event.titre}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(event.photo)}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="Voir l'image"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditEvent(index)}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEvent(index)}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                          {event.titre}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>

        {/* Modal de prévisualisation d'image */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={previewImage}
                alt="Image agrandie"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}