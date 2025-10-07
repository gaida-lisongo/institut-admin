'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, FileText, Loader2, Image, Edit } from 'lucide-react';
import { useProvinceStore } from '@/stores/provinceStore';

export default function ProvinceDetailPage() {
  const params = useParams();
  const provinceId = params.slug as string;

  // Utilisation du store Zustand
  const { 
    currentProvince, 
    loading, 
    error, 
    getProvinceById, 
    clearError 
  } = useProvinceStore();

  // Charger la province spécifique au montage du composant
  useEffect(() => {
    if (provinceId) {
      getProvinceById(provinceId);
    }
  }, [provinceId, getProvinceById]);

  const province = currentProvince;

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
          <div className="space-x-4">
            <button
              onClick={() => {
                clearError();
                getProvinceById(provinceId);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
            <Link
              href="/provinces"
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux provinces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Gestion du chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chargement de la province...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Veuillez patienter pendant le chargement des données.
          </p>
        </div>
      </div>
    );
  }

  // Gestion de la province introuvable
  if (!province) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Province introuvable
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La province demandée n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/provinces"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux provinces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/provinces"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux provinces
          </Link>
          
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {province.designation}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Code: {province.code}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de la province */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {province.description}
            </p>
          </div>

          {/* Informations techniques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations techniques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date de création
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(province.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dernière modification
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(province.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code province
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {province.code}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID système
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {province._id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo et actions */}
        <div className="space-y-6">
          {/* Photo de la province */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Image className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Photo
              </h2>
            </div>
            
            {province.photo ? (
              <div className="space-y-4">
                <img
                  src={province.photo}
                  alt={province.designation}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Erreur de chargement de l'image
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <a 
                    href={province.photo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    Voir l'image originale ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune photo disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                <Edit className="w-4 h-4 mr-2" />
                Modifier la province
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                <FileText className="w-4 h-4 mr-2" />
                Exporter les données
              </button>
              
              <Link
                href="/provinces"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}