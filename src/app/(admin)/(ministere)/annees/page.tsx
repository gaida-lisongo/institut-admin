'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, Plus, Search, Filter, Users, BookOpen, Clock, CheckCircle, XCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { Annee } from '@/types/annee';
import { useAnneeStore } from '@/stores/anneeStore';
import AnneeModal from '@/components/annee/AnneeModal';
import DeleteConfirmModal from '@/components/annee/DeleteConfirmModal';

export default function AnneesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'terminee' | 'planifiee'>('all');
  
  // États pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // États pour le modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [anneeToDelete, setAnneeToDelete] = useState<Annee | null>(null);

  // Utilisation du store Zustand
  const { 
    annees, 
    loading, 
    error, 
    fetchAnnees, 
    deleteAnnee,
    clearError 
  } = useAnneeStore();

  // Charger les années au montage du composant
  useEffect(() => {
    fetchAnnees();
  }, [fetchAnnees]);

  const filteredAnnees = useMemo(() => {
    return annees.filter(annee => {
      const matchesSearch = annee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           `${annee.debut}-${annee.fin}`.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || annee.statut === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [annees, searchTerm, statusFilter]);

  const getStatusBadge = (statut: Annee['statut']) => {
    const configs = {
      active: { 
        bg: 'bg-green-100 dark:bg-green-900/20', 
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
        label: 'Active'
      },
      terminee: { 
        bg: 'bg-gray-100 dark:bg-gray-900/20', 
        text: 'text-gray-800 dark:text-gray-300',
        icon: XCircle,
        label: 'Terminée'
      },
      planifiee: { 
        bg: 'bg-blue-100 dark:bg-blue-900/20', 
        text: 'text-blue-800 dark:text-blue-300',
        icon: Clock,
        label: 'Planifiée'
      }
    };

    const config = configs[statut];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStats = () => {
    const total = annees.length;
    const active = annees.filter(a => a.statut === 'active').length;
    const terminee = annees.filter(a => a.statut === 'terminee').length;
    const planifiee = annees.filter(a => a.statut === 'planifiee').length;

    return { total, active, terminee, planifiee };
  };

  const stats = getStats();

  // Fonctions pour gérer le modal
  const openModal = (mode: 'create' | 'edit' | 'view', annee?: Annee) => {
    setModalMode(mode);
    setSelectedAnnee(annee || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnnee(null);
  };

  // Fonctions pour gérer le modal de suppression
  const openDeleteModal = (annee: Annee) => {
    setAnneeToDelete(annee);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAnneeToDelete(null);
  };

  const confirmDeleteAnnee = async () => {
    if (anneeToDelete) {
      const success = await deleteAnnee(anneeToDelete._id);
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
              fetchAnnees();
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
              Années Académiques
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestion des périodes académiques et calendriers
            </p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Année
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.terminee}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Planifiées</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.planifiee}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une année académique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="terminee">Terminée</option>
              <option value="planifiee">Planifiée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des années */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Année Académique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Événements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Frais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Chargement des années académiques...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAnnees.map((annee) => (
                <tr key={annee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {annee.debut} - {annee.fin}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {annee.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(annee.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {annee.calendrier?.length || 0} événements
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {annee.fraisAcademiques?.length || 0} frais
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>Créé: {formatDate(annee.dateCreation)}</div>
                    <div>Modifié: {formatDate(annee.dateModification)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/annees/${annee._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Link>
                      
                      <button
                        onClick={() => openModal('edit', annee)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(annee)}
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

        {!loading && filteredAnnees.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucune année académique trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez par créer une nouvelle année académique.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal pour créer/modifier une année */}
      <AnneeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        annee={selectedAnnee}
        mode={modalMode}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteAnnee}
        annee={anneeToDelete}
        loading={loading}
      />
    </div>
  );
}