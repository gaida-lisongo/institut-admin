"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import BlobManager from "../../services/BlobManager";

// Interface pour les items
interface DataItem {
  id?: string;
  sigle: string;
  designation: string;
  devise: string;
  objectif: string;
  images: string[]; // URLs des images
}

// Interface pour les images uploadées
interface UploadedImage {
  file: File;
  url: string;
  isUploaded: boolean;
}

export default function DataTable() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState<Omit<DataItem, 'id' | 'images'>>({
    sigle: '',
    designation: '',
    devise: '',
    objectif: ''
  });

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
            type: 'data-table-image',
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
    
    // Upload des images
    const imageUrls = await uploadImages();
    
    const newItem: DataItem = {
      ...formData,
      images: imageUrls,
      id: editingItem?.id || Date.now().toString()
    };

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setItems(prev => [...prev, newItem]);
    }

    closeModal();
  };

  // Fermeture du modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ sigle: '', designation: '', devise: '', objectif: '' });
    setSelectedImages([]);
  };

  // Ouverture du modal pour édition
  const handleEdit = (item: DataItem) => {
    setEditingItem(item);
    setFormData({
      sigle: item.sigle,
      designation: item.designation,
      devise: item.devise,
      objectif: item.objectif
    });
    // Convertir les URLs existantes en UploadedImage
    setSelectedImages(item.images.map(url => ({
      file: new File([], ''), // Fichier vide pour les images existantes
      url,
      isUploaded: true
    })));
    setIsModalOpen(true);
  };

  // Suppression d'un item
  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Suppression d'une image sélectionnée
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestion des données
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Sigle
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Designation
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Devise
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Objectif
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Images
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {item.sigle}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {item.designation}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {item.devise}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">
                  {item.objectif}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-1">
                    {item.images.slice(0, 3).map((imageUrl, index) => (
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
                    {item.images.length > 3 && (
                      <span className="text-theme-xs text-gray-400">+{item.images.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-theme-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-600 hover:text-red-800 text-theme-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Message quand aucune donnée */}
        {items.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Aucune donnée disponible
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {editingItem ? 'Modifier l\'item' : 'Ajouter un item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sigle *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sigle}
                  onChange={(e) => setFormData(prev => ({ ...prev, sigle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Devise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.devise}
                  onChange={(e) => setFormData(prev => ({ ...prev, devise: e.target.value }))}
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
                  value={formData.objectif}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectif: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

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
                
                {/* Preview des images sélectionnées */}
                {selectedImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
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
                  {isUploading ? 'Upload...' : editingItem ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}