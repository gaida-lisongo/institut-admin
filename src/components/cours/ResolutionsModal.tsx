"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  ExternalLink, 
  Trash2, 
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import TravailService, { Resolution } from '@/services/TravailService';

interface ResolutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  travailId: string;
  travailTitle: string;
}

const ResolutionsModal: React.FC<ResolutionsModalProps> = ({
  isOpen,
  onClose,
  travailId,
  travailTitle
}) => {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [filteredResolutions, setFilteredResolutions] = useState<Resolution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<{ [key: string]: number | string }>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [deletingResolution, setDeletingResolution] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && travailId) {
      fetchResolutions();
    }
  }, [isOpen, travailId]);

  useEffect(() => {
    // Filtrer les résolutions selon le terme de recherche
    if (searchTerm.trim() === '') {
      setFilteredResolutions(resolutions);
    } else {
      const filtered = resolutions.filter(resolution => {
        const etudiant = resolution.etudiantId;
        const searchLower = searchTerm.toLowerCase();
        
        return (
          etudiant.nom?.toLowerCase().includes(searchLower) ||
          etudiant.prenom?.toLowerCase().includes(searchLower) ||
          etudiant.post_nom?.toLowerCase().includes(searchLower) ||
          etudiant.matricule?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredResolutions(filtered);
    }
  }, [searchTerm, resolutions]);

  const fetchResolutions = async () => {
    setLoading(true);
    try {
      const data = await TravailService.fetchAllResolutions(travailId);
      setResolutions(data);
      setFilteredResolutions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des résolutions:', error);
      alert('Erreur lors du chargement des résolutions');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (resolutionId: string, value: string) => {
    // Permettre les valeurs vides ou les nombres entre 0 et 20
    if (value === '' || (Number(value) >= 0 && Number(value) <= 20)) {
      setEditingNote(prev => ({
        ...prev,
        [resolutionId]: value
      }));
    }
  };

  const handleSaveNote = async (resolution: Resolution) => {
    const noteValue = editingNote[resolution._id];
    
    if (noteValue === undefined || noteValue === '') {
      alert('Veuillez entrer une note valide');
      return;
    }

    const note = Number(noteValue);
    
    if (isNaN(note) || note < 0 || note > 20) {
      alert('La note doit être entre 0 et 20');
      return;
    }

    setSavingNote(resolution._id);
    
    try {
      // Déterminer le statut en fonction de la note
      const status = note >= 10 ? 'OK' : 'NO';
      
      // Mettre à jour la résolution avec la note et le statut
      const updatedResolution = await TravailService.updateResolution(resolution._id, {
        note,
        status
      });

      // Mettre à jour l'état local
      setResolutions(prev => 
        prev.map(r => r._id === resolution._id ? updatedResolution : r)
      );

      // Réinitialiser l'édition
      setEditingNote(prev => {
        const newState = { ...prev };
        delete newState[resolution._id];
        return newState;
      });

      alert('Note enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      alert('Erreur lors de l\'enregistrement de la note');
    } finally {
      setSavingNote(null);
    }
  };

  const handleDeleteResolution = async (resolutionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette résolution ?')) {
      return;
    }

    setDeletingResolution(resolutionId);
    
    try {
      await TravailService.deleteResolution(resolutionId);
      
      // Retirer la résolution de l'état local
      setResolutions(prev => prev.filter(r => r._id !== resolutionId));
      
      alert('Résolution supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la résolution:', error);
      alert('Erreur lors de la suppression de la résolution');
    } finally {
      setDeletingResolution(null);
    }
  };

  const getStatusBadge = (status: 'PENDING' | 'OK' | 'NO') => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'NO':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Échoué
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-blacksection rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-strokedark">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Résolutions des étudiants
              </h3>
              <p className="text-sm text-gray-500 mt-1">{travailTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-strokedark">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-strokedark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-blacksection dark:text-white"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredResolutions.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'Aucun étudiant trouvé' : 'Aucune résolution soumise'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-strokedark">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Résolution
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-blacksection divide-y divide-gray-200 dark:divide-strokedark">
                    {filteredResolutions.map((resolution) => {
                      const etudiant = resolution.etudiantId;
                      const isEditing = editingNote[resolution._id] !== undefined;
                      const currentNote = isEditing 
                        ? editingNote[resolution._id] 
                        : resolution.note ?? '';

                      return (
                        <tr key={resolution._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {etudiant.matricule}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => window.open(resolution.url, '_blank')}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-strokedark rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Consulter
                            </button>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={currentNote}
                                onChange={(e) => handleNoteChange(resolution._id, e.target.value)}
                                placeholder="0-20"
                                className="w-20 px-2 py-1 border border-gray-300 dark:border-strokedark rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                              />
                              <span className="text-sm text-gray-500">/20</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(resolution.status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSaveNote(resolution)}
                                disabled={savingNote === resolution._id || !isEditing}
                                className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {savingNote === resolution._id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-1" />
                                )}
                                Enregistrer
                              </button>
                              <button
                                onClick={() => handleDeleteResolution(resolution._id)}
                                disabled={deletingResolution === resolution._id}
                                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingResolution === resolution._id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-1" />
                                )}
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {filteredResolutions.length} résolution(s) {searchTerm && `trouvée(s) sur ${resolutions.length}`}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-strokedark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-blacksection hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionsModal;
