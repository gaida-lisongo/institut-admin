"use client";

import React, { useState } from 'react';
import { Personnel } from '@/types/personnel';
import AutorisationModal from './AutorisationModal';
import { getGradeLabel } from '@/utils/gradeUtils';

interface UserCardProps {
  user: Personnel;
  onClose: () => void;
  onUpdate?: (updatedUser: Personnel) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('autorisations');
  const [showAutorisationModal, setShowAutorisationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Personnel>(user);

  const handleUserUpdate = (updatedUser: Personnel) => {
    setCurrentUser(updatedUser);
    if (onUpdate) {
      onUpdate(updatedUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.prenom} {user.nom} {user.post_nom}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.matricule} • {user.email}
              </p>
            </div>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {['autorisations', 'profil'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'autorisations' && 'Autorisations'}
                {tab === 'documents' && 'Documents'}
                {tab === 'profil' && 'Profil'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'autorisations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Autorisations
                </h3>
                <button 
                  onClick={() => setShowAutorisationModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gérer les autorisations
                </button>
              </div>
              
              {currentUser.autorisations && currentUser.autorisations.length > 0 ? (
                <div className="space-y-4">
                  {currentUser.autorisations.map((auth, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{auth.type}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{auth.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Créé le {auth.dateCreation ? new Date(auth.dateCreation).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            auth.dateExpiration && new Date(auth.dateExpiration) > new Date()
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {auth.dateExpiration && new Date(auth.dateExpiration) > new Date() ? 'Active' : 'Expirée'}
                          </span>
                          <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aucune autorisation trouvée</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Documents
              </h3>
              {user.documents && user.documents.length > 0 ? (
                <div className="space-y-4">
                  {user.documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{doc.designation}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doc.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ajouté le {doc.dateAjout ? new Date(doc.dateAjout).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Voir
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aucun document trouvé</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profil' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations du profil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.prenom} {user.nom} {user.post_nom}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Matricule
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.matricule}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.telephone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.categorie}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sexe
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.sexe}</p>
                </div>
                {user.grade && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade
                    </label>
                    <p className="text-gray-900 dark:text-white">{getGradeLabel(user.grade, user.categorie)}</p>
                  </div>
                )}
                {user.adresse && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresse
                    </label>
                    <p className="text-gray-900 dark:text-white">{user.adresse}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal d'autorisations */}
        {showAutorisationModal && (
          <AutorisationModal
            user={currentUser}
            onClose={() => setShowAutorisationModal(false)}
            onUpdate={handleUserUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default UserCard;
