'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Eye, Plus, Search, Filter, Users, Building, Loader2, Edit, Trash2, Image } from 'lucide-react';
import { Province } from '@/types/province';
import { useProvinceStore } from '@/stores/provinceStore';
import ProvinceModal from '@/components/province/ProvinceModal';
import DeleteProvinceModal from '@/components/province/DeleteProvinceModal';

export default function ProvincePage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // États pour le modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [provinceToDelete, setProvinceToDelete] = useState<Province | null>(null);

  // Utilisation du store Zustand
  const { 
    provinces, 
    loading, 
    error, 
    fetchProvinces, 
    deleteProvince,
    clearError 
  } = useProvinceStore();

  // Charger les provinces au montage du composant
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const filteredProvinces = useMemo(() => {
    return provinces.filter(province => {
      const matchesSearch = province.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           province.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           province.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [provinces, searchTerm]);

  const getStats = () => {
    const total = provinces.length;
    const withPhoto = provinces.filter(p => p.photo && p.photo.trim() !== '').length;
    const withoutPhoto = total - withPhoto;

    return { total, withPhoto, withoutPhoto };
  };

  const stats = getStats();

  // Fonctions pour gérer le modal
  const openModal = (mode: 'create' | 'edit' | 'view', province?: Province) => {
    setModalMode(mode);
    setSelectedProvince(province || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProvince(null);
  };

  // Fonctions pour gérer le modal de suppression
  const openDeleteModal = (province: Province) => {
    setProvinceToDelete(province);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProvinceToDelete(null);
  };

  const confirmDeleteProvince = async () => {
    if (provinceToDelete) {
      const success = await deleteProvince(provinceToDelete._id);
      if (success) {
        closeDeleteModal();
        // La liste sera automatiquement mise à jour via le store
      }
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => {
              clearError();
              fetchProvinces();
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Provinces
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestion des provinces et territoires
            </p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Province
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <Image className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Avec Photo</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.withPhoto}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sans Photo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">{stats.withoutPhoto}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par désignation, code ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des provinces */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Province
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Chargement des provinces...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProvinces.map((province) => (
                <tr key={province._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {province.designation}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Créé le {new Date(province.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {province.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                      {province.description.length > 100 
                        ? `${province.description.substring(0, 100)}...`
                        : province.description
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {province.photo ? (
                      <img
                        src={province.photo}
                        alt={province.designation}
                        className="w-10 h-10 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center ${province.photo ? 'hidden' : 'flex'}`}
                    >
                      <Image className="w-5 h-5 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view', province)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </button>
                      
                      <button
                        onClick={() => openModal('edit', province)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(province)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredProvinces.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucune province trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez par créer une nouvelle province.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal pour créer/modifier une province */}
      <ProvinceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        province={selectedProvince}
        mode={modalMode}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteProvinceModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProvince}
        province={provinceToDelete}
        loading={loading}
      />
    </div>
  );
}