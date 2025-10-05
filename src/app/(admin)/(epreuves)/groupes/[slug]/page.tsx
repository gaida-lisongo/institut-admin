'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGroupes, useGroupeActions, useGroupeStats, type Groupe, type GroupeDetail, type CreateGroupeData } from '@/stores/groupeStore';
import { useEtudiants, useEtudiantActions, type Etudiant, parseCSV, generateCSVTemplate } from '@/stores/etudiantStore';
import { useSeries } from '@/stores/serieStore';
import React, { useState, useEffect, useRef } from 'react';
// import { useStore } from 'zustand';
import { useUserStore } from '@/stores/userStore';

const GroupeSeriesPage = () => {
  const params = useParams();
  const router = useRouter();
  const serieId = params.slug as string;
  const { currentUser } = useUserStore()
  const { groupes, isLoading: groupesLoading, error: groupesError } = useGroupes();
  const { fetchGroupesBySerie, createGroupe, updateGroupe, deleteGroupe, clearError } = useGroupeActions();
  const { totalGroupes, totalEtudiants, averageEtudiantsPerGroupe } = useGroupeStats();
  
  const { etudiants } = useEtudiants();
  const { importFromCSV } = useEtudiantActions();
  const { series } = useSeries();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<GroupeDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Trouver la série courante
  const currentSerie = series.find(s => s._id === serieId);

  // Charger les groupes pour cette série
  useEffect(() => {
    if (serieId) {
      fetchGroupesBySerie(serieId);
    }
  }, [serieId, fetchGroupesBySerie]);

  // Filtrer les groupes selon le terme de recherche
  const filteredGroupes = groupes.filter(groupe => 
    searchTerm === '' || 
    groupe.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupe.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroupe = async (newGroupe: CreateGroupeData) => {
    // Ajouter l'ID de l'utilisateur courant
    const groupeWithUser = {
      ...newGroupe,
      userId: currentUser?._id
    };
    
    const success = await createGroupe(groupeWithUser);
    if (!success && groupesError) {
      alert(groupesError);
      clearError();
      throw new Error(groupesError); // Lancer une erreur pour empêcher la fermeture du modal
    }
  };

  const handleUpdateGroupe = async (updatedData: CreateGroupeData) => {
    if (!editingGroupe) return;
    console.log("Updated data:", updatedData);
    console.log("Editing groupe:", editingGroupe);
    // Créer un objet Groupe pour l'API (avec les IDs simples)
    const groupeToUpdate: Groupe = {
      _id: editingGroupe._id,
      serieId: editingGroupe.serieId._id,
      etudiantIds: updatedData.etudiantIds,
      userId: currentUser?._id,
      designation: updatedData.designation,
      statut: updatedData.statut
    };
    
    const success = await updateGroupe(groupeToUpdate);
    if (!success && groupesError) {
      alert(groupesError);
      clearError();
      throw new Error(groupesError); // Lancer une erreur pour empêcher la fermeture du modal
    }
  };

  const handleDeleteGroupe = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      const success = await deleteGroupe(id, serieId);
      if (!success && groupesError) {
        alert(groupesError);
        clearError();
      }
    }
  };


  if (!currentSerie) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Série introuvable</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            La série demandée n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push('/groupes')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
          >
            Retour aux groupes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/groupes')}
            className="inline-flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Groupes - Série #{currentSerie._id.slice(-6)}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {typeof currentSerie.coursId === 'object' ? currentSerie.coursId.designation : 'Cours inconnu'} • {currentSerie.questions.length} questions
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau Groupe
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Groupes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalGroupes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Étudiants
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalEtudiants}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Moyenne Étudiants/Groupe
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {averageEtudiantsPerGroupe}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      {groupes.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {groupesLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des groupes...</span>
        </div>
      )}

      {/* Liste des groupes */}
      {!groupesLoading && filteredGroupes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroupes.map((groupe) => (
            <GroupeCard
              key={groupe._id}
              groupe={groupe}
              onEdit={setEditingGroupe}
              onDelete={handleDeleteGroupe}
            />
          ))}
        </div>
      )}

      {/* Message si aucun groupe */}
      {!groupesLoading && filteredGroupes.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Aucun groupe disponible</h3>
          <p className="text-sm">
            {searchTerm 
              ? 'Aucun groupe ne correspond à votre recherche.' 
              : 'Commencez par créer un nouveau groupe pour cette série.'
            }
          </p>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <GroupeModal
          serieId={serieId}
          etudiants={etudiants}
          onSave={handleCreateGroupe}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal de modification */}
      {editingGroupe && (
        <GroupeModal
          groupe={editingGroupe}
          serieId={serieId}
          etudiants={etudiants}
          onSave={handleUpdateGroupe}
          onClose={() => setEditingGroupe(null)}
        />
      )}
    </div>
  );
};

// Composant GroupeCard pour afficher un groupe avec ses étudiants
const GroupeCard = ({ groupe, onEdit, onDelete }: {
  groupe: GroupeDetail;
  onEdit: (groupe: GroupeDetail) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">{groupe.designation}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {groupe.etudiantIds.length} étudiants • Statut: {groupe.statut}
      </p>
      
      {/* Affichage des étudiants */}
      {groupe.etudiantIds.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Étudiants:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {groupe.etudiantIds.slice(0, 5).map(etudiant => (
              <div key={etudiant._id} className="text-xs text-gray-600 dark:text-gray-400">
                {etudiant.prenom} {etudiant.nom} ({etudiant.matricule})
              </div>
            ))}
            {groupe.etudiantIds.length > 5 && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                ... et {groupe.etudiantIds.length - 5} autres
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(groupe)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(groupe._id)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

// Composant GroupeModal pour créer/modifier un groupe
const GroupeModal = ({ groupe, serieId, etudiants, onSave, onClose }: {
  groupe?: GroupeDetail;
  serieId: string;
  etudiants: Etudiant[];
  onSave: (data: CreateGroupeData) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    designation: groupe?.designation || '',
    statut: groupe?.statut || 'NO',
    etudiants: groupe?.etudiantIds?.map(e => e._id) || []
  });
  const [importedEtudiants, setImportedEtudiants] = useState<Etudiant[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFromCSV } = useEtudiantActions();

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const csvData = parseCSV(csvContent);
        
        if (csvData.length === 0) {
          alert('Le fichier CSV est vide ou mal formaté.');
          setIsImporting(false);
          return;
        }

        // Importer les étudiants et récupérer leurs IDs
        const createdEtudiants = await importFromCSV(csvData);
        
        if (createdEtudiants.length > 0) {
          setImportedEtudiants(createdEtudiants);
          // Mettre à jour les IDs des étudiants dans le formulaire
          setFormData(prev => ({
            ...prev,
            etudiants: createdEtudiants.map(e => e._id)
          }));
          alert(`${createdEtudiants.length} étudiants importés avec succès !`);
        } else {
          alert('Aucun étudiant n\'a pu être importé.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'import CSV:', error);
        alert('Erreur lors de l\'import du fichier CSV.');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_etudiants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRemoveEtudiant = (etudiantId: string) => {
    setFormData(prev => ({
      ...prev,
      etudiants: prev.etudiants.filter(id => id !== etudiantId)
    }));
    setImportedEtudiants(prev => prev.filter(e => e._id !== etudiantId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.designation.trim()) {
      alert('La désignation du groupe est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        serieId,
        designation: formData.designation.trim(),
        statut: formData.statut,
        etudiantIds: formData.etudiants
      });
      // Fermer le modal après succès
      onClose();
    } catch (error) {
      // En cas d'erreur, ne pas fermer le modal
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEtudiantName = (etudiantId: string) => {
    // Chercher d'abord dans les étudiants importés
    const etudiantImporte = importedEtudiants.find(e => e._id === etudiantId);
    if (etudiantImporte) {
      return `${etudiantImporte.prenom} ${etudiantImporte.nom}`;
    }
    
    // Chercher dans les étudiants du groupe existant (si modification)
    if (groupe?.etudiantIds) {
      const etudiantGroupe = groupe.etudiantIds.find(e => e._id === etudiantId);
      if (etudiantGroupe) {
        return `${etudiantGroupe.prenom} ${etudiantGroupe.nom}`;
      }
    }
    
    // Chercher dans la liste générale des étudiants
    const etudiant = etudiants.find(e => e._id === etudiantId);
    return etudiant ? `${etudiant.prenom} ${etudiant.nom}` : 'Étudiant inconnu';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {groupe ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations du groupe */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  Informations du groupe
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Groupe A, Classe L1, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="NO">Non assigné</option>
                    <option value="PENDING">En attente</option>
                    <option value="OK">Validé</option>
                  </select>
                </div>

                {/* Résumé des étudiants importés */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Étudiants importés ({formData.etudiants.length})
                  </h5>
                  {formData.etudiants.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun étudiant importé
                    </p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {formData.etudiants.map(etudiantId => (
                        <div key={etudiantId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {getEtudiantName(etudiantId)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEtudiant(etudiantId)}
                            className="text-red-500 hover:text-red-700"
                            title="Retirer cet étudiant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Import des étudiants */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  Importer les étudiants
                </h4>
                
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Comment importer vos étudiants
                      </h5>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Téléchargez le template CSV ci-dessous</li>
                          <li>Remplissez-le avec vos données étudiants</li>
                          <li>Importez le fichier pour créer automatiquement les comptes</li>
                          <li>Les étudiants seront assignés à ce groupe</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger Template CSV
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Importer Fichier CSV
                      </>
                    )}
                  </button>
                </div>

                {/* Aperçu des étudiants importés */}
                {importedEtudiants.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Aperçu des étudiants importés ({importedEtudiants.length})
                      </h5>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {importedEtudiants.map(etudiant => (
                          <div key={etudiant._id} className="p-3 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {etudiant.prenom} {etudiant.nom} {etudiant.post_nom}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Matricule: {etudiant.matricule}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEtudiant(etudiant._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Retirer cet étudiant"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.designation.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </div>
              ) : (
                groupe ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupeSeriesPage;