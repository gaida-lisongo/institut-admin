"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import BlobManager from "../../services/BlobManager";
import { useSectionStore } from "../../stores/sectionStore";
import type { Section, Description, Contact } from "../../types/section";

// Interface pour les images uploadées
interface UploadedImage {
  file: File;
  url: string;
  isUploaded: boolean;
}

// Interface pour le formulaire simplifié (description + contact + valeurs seulement)
interface SectionFormData {
  description: {
    sigle: string;
    designation: string;
    devise: string;
    objectif: string;
    images: string[];
  };
  contact: {
    addresse: string;
    telephone: string;
    email: string;
    www: string;
  };
  valeurs: string[];
}

export default function SectionDataTable() {
  const {
    sections,
    isLoading,
    error,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    clearError
  } = useSectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // État pour l'input des valeurs
  const [newValeurInput, setNewValeurInput] = useState('');

  // État du formulaire simplifié
  const [formData, setFormData] = useState<SectionFormData>({
    description: {
      sigle: '',
      designation: '',
      devise: '',
      objectif: '',
      images: []
    },
    contact: {
      addresse: '',
      telephone: '',
      email: '',
      www: ''
    },
    valeurs: []
  });

  // Chargement initial des sections
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Gestion de l'upload d'images
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      isUploaded: false
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  // Upload des images vers Vercel Blob
  const uploadImages = async (): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of selectedImages) {
        if (!image.isUploaded) {
          const result = await BlobManager.createBlob(image.file, {
            type: 'section-image',
            originalName: image.file.name
          });
          uploadedUrls.push(result.url);
          
          // Marquer comme uploadé
          setSelectedImages(prev =>
            prev.map(img =>
              img.file === image.file ? { ...img, isUploaded: true, url: result.url } : img
            )
          );
        } else {
          uploadedUrls.push(image.url);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }

    return uploadedUrls;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      // Upload des images
      const imageUrls = await uploadImages();
      
      const sectionData = {
        description: {
          ...formData.description,
          images: imageUrls
        },
        contact: formData.contact,
        valeurs: formData.valeurs,
        // Initialiser les autres propriétés avec des valeurs par défaut
        offres: [],
        calendrier: [],
        alumni: [],
        galery: [],
        agenda: [],
        missions: [],
        history: [],
        team: []
      };

      console.log('Données à envoyer:', sectionData); // Debug

      let success = false;
      if (editingSection && editingSection._id) {
        success = await updateSection(editingSection._id, sectionData);
      } else {
        success = await createSection(sectionData);
      }

      if (success) {
        closeModal();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Fermeture du modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormData({
      description: { sigle: '', designation: '', devise: '', objectif: '', images: [] },
      contact: { addresse: '', telephone: '', email: '', www: '' },
      valeurs: []
    });
    setSelectedImages([]);
    setNewValeurInput(''); // Reset l'input des valeurs
    clearError();
  };

  // Ouverture du modal pour édition
  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      description: { ...section.description },
      contact: { 
      ...section.contact,
      www: section.contact.www || ''
      },
      valeurs: [...section.valeurs]
    });
    
    // Convertir les URLs existantes en UploadedImage
    setSelectedImages(section.description.images.map(url => ({
      file: new File([], ''),
      url,
      isUploaded: true
    })));
    setIsModalOpen(true);
  };

  // Suppression d'une section
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;
    await deleteSection(id);
  };

  // Suppression d'une image sélectionnée
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Gestion des valeurs (CORRIGÉ)
  const addValeur = () => {
    if (newValeurInput.trim()) {
      setFormData(prev => ({
        ...prev,
        valeurs: [...prev.valeurs, newValeurInput.trim()]
      }));
      setNewValeurInput(''); // Reset l'input
    }
  };

  const removeValeur = (index: number) => {
    setFormData(prev => ({
      ...prev,
      valeurs: prev.valeurs.filter((_, i) => i !== index)
    }));
  };

  const handleValeurKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValeur();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Chargement des sections...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestion des Sections - Informations de base
          </h3>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + Ajouter une section
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Sigle
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Désignation
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Devise
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Contact
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Images
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Valeurs
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sections.map((section) => (
              <TableRow key={section._id}>
                <TableCell className="py-3 font-medium text-gray-800 text-sm dark:text-white/90">
                  {section.description.sigle}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {section.description.designation}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {section.description.devise}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  <div className="text-xs">
                    <div>{section.contact.email}</div>
                    <div>{section.contact.telephone}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-1">
                    {section.description.images.slice(0, 3).map((imageUrl, index) => (
                      <div key={index} className="h-8 w-8 overflow-hidden rounded">
                        <Image
                          width={32}
                          height={32}
                          src={imageUrl}
                          className="h-8 w-8 object-cover"
                          alt={`Image ${index + 1}`}
                        />
                      </div>
                    ))}
                    {section.description.images.length > 3 && (
                      <span className="text-xs text-gray-400">+{section.description.images.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  <div className="flex flex-wrap gap-1">
                    {section.valeurs.slice(0, 3).map((valeur, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {valeur}
                      </span>
                    ))}
                    {section.valeurs.length > 3 && (
                      <span className="text-xs text-gray-400">+{section.valeurs.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit({
                        ...section,
                        contact: {
                          ...section.contact,
                          www: section.contact.www || ''
                        }
                      } as Section)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => section._id && handleDelete(section._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sections.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Aucune section disponible
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {editingSection ? 'Modifier la section' : 'Ajouter une section'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sigle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description.sigle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, sigle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description.designation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, designation: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Devise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description.devise}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, devise: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objectif *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description.objectif}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, objectif: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contact.telephone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, telephone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact.addresse}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, addresse: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site Web
                  </label>
                  <input
                    type="url"
                    value={formData.contact.www}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, www: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Valeurs (SECTION CORRIGÉE) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valeurs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ajouter une valeur"
                    value={newValeurInput}
                    onChange={(e) => setNewValeurInput(e.target.value)}
                    onKeyPress={handleValeurKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addValeur}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.valeurs.map((valeur, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      {valeur}
                      <button
                        type="button"
                        onClick={() => removeValeur(index)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.valeurs.length === 0 && (
                  <p className="text-sm text-gray-500 italic mt-1">Aucune valeur ajoutée</p>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                
                {selectedImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          width={80}
                          height={80}
                          src={image.url}
                          className="h-20 w-20 object-cover rounded border"
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        {image.isUploaded && (
                          <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Upload...' : editingSection ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}