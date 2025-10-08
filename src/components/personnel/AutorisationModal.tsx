"use client";

import React, { useState, useEffect } from 'react';
import { Personnel, Autorisation } from '@/types/personnel';
import PersonnelService from '@/services/PersonnelService';

interface AutorisationModalProps {
  user: Personnel;
  onClose: () => void;
  onUpdate: (updatedUser: Personnel) => void;
}

const AutorisationModal: React.FC<AutorisationModalProps> = ({
  user,
  onClose,
  onUpdate
}) => {
  const [autorisations, setAutorisations] = useState<Autorisation[]>(user.autorisations || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Formulaire pour nouvelle autorisation
  const [newAutorisation, setNewAutorisation] = useState<Partial<Autorisation>>({
    type: 'DRH',
    password: '',
    action: true,
    dateExpiration: ''
  });

  const typeLabels = {
    DG: 'Directeur Général',
    SGACAD: 'Secrétaire Général Académique',
    SGAD: 'Secrétaire Général Administratif',
    SGR: 'Secrétaire Général à la Recherche',
    AB: 'Administrateur du Budget',
    DRH: 'Personnels',
    ADMIN: 'Gestion Etablissement',
    FIN: 'Gestion Finance'
  };

  const typeColors = {
    DG: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    SGACAD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    SGAD: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    SGR: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    AB: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    DRH: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    ADMIN: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
    FIN: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
  };

  const handleAddAutorisation = async () => {
    if (!newAutorisation.type || !newAutorisation.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const autorisationData = {
        ...newAutorisation,
        dateCreation: new Date().toISOString(),
        dateExpiration: newAutorisation.dateExpiration || undefined
      };

      const result = await PersonnelService.addAutorisation(user._id, autorisationData);

      // Mettre à jour l'état local
      const updatedAutorisations = [...autorisations, result.data];
      setAutorisations(updatedAutorisations);
      
      // Notifier le parent
      const updatedUser = { ...user, autorisations: updatedAutorisations };
      onUpdate(updatedUser);

      setSuccess('Autorisation ajoutée avec succès !');
      setShowAddForm(false);
      setNewAutorisation({
        type: 'DRH',
        password: '',
        action: true,
        dateExpiration: ''
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'autorisation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAutorisation = async (autorisationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette autorisation ?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await PersonnelService.deleteAutorisation(user._id, autorisationId);

      // Mettre à jour l'état local
      const updatedAutorisations = autorisations.filter(auth => auth._id !== autorisationId);
      setAutorisations(updatedAutorisations);
      
      // Notifier le parent
      const updatedUser = { ...user, autorisations: updatedAutorisations };
      onUpdate(updatedUser);

      setSuccess('Autorisation supprimée avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'autorisation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutorisation = async (autorisation: Autorisation) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await PersonnelService.updateAutorisation(user._id, autorisation._id!, {
        ...autorisation,
        action: !autorisation.action
      });

      // Mettre à jour l'état local
      const updatedAutorisations = autorisations.map(auth => 
        auth._id === autorisation._id ? { ...auth, action: !auth.action } : auth
      );
      setAutorisations(updatedAutorisations);
      
      // Notifier le parent
      const updatedUser = { ...user, autorisations: updatedAutorisations };
      onUpdate(updatedUser);

      setSuccess('Autorisation mise à jour avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'autorisation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Aucune';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const isExpired = (dateString: string | Date | undefined) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestion des Autorisations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user.nomComplet || `${user.nom} ${user.prenom}`} • {user.matricule}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="p-6">
          {/* Actions Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Autorisations Actuelles ({autorisations.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Ajouter une autorisation</span>
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Nouvelle Autorisation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'autorisation *
                  </label>
                  <select
                    value={newAutorisation.type}
                    onChange={(e) => setNewAutorisation(prev => ({ ...prev, type: e.target.value as Autorisation['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newAutorisation.password}
                    onChange={(e) => setNewAutorisation(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Mot de passe pour cette autorisation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date d'expiration (optionnel)
                  </label>
                  <input
                    type="date"
                    value={typeof newAutorisation.dateExpiration === 'string' ? newAutorisation.dateExpiration : ''}
                    onChange={(e) => setNewAutorisation(prev => ({ ...prev, dateExpiration: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAutorisation.action}
                      onChange={(e) => setNewAutorisation(prev => ({ ...prev, action: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Autorisation active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddAutorisation}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          )}

          {/* Liste des autorisations */}
          {autorisations.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune autorisation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cet utilisateur n'a aucune autorisation définie.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {autorisations.map((autorisation, index) => (
                <div
                  key={autorisation._id || index}
                  className={`border rounded-lg p-4 ${
                    autorisation.action 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700'
                  } ${
                    isExpired(autorisation.dateExpiration) 
                      ? 'opacity-60' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[autorisation.type]}`}>
                        {typeLabels[autorisation.type]}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          autorisation.action ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {autorisation.action ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {isExpired(autorisation.dateExpiration) && (
                        <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/20 dark:text-red-400">
                          Expirée
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleAutorisation(autorisation)}
                        disabled={isLoading}
                        className={`px-3 py-1 text-sm rounded-md ${
                          autorisation.action
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                        }`}
                      >
                        {autorisation.action ? 'Désactiver' : 'Activer'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAutorisation(autorisation._id!)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Créée le:</span> {formatDate(autorisation.dateCreation)}
                    </div>
                    <div>
                      <span className="font-medium">Expire le:</span> {formatDate(autorisation.dateExpiration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutorisationModal;
