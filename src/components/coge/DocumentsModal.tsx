"use client";

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Download, Trash2, Plus, Eye } from 'lucide-react';
import { Personnel, PersonnelDocument } from '@/types/personnel';
import { API_URL } from '@/app/(admin)/(coge)/paiements/[slug]/page';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Personnel;
  onAgentUpdated: (updatedAgent: Personnel) => void;
}

interface DocumentFormData {
  designation: string;
  url: string;
  taille?: number;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'gif';
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  agent,
  onAgentUpdated
}) => {
  const [documents, setDocuments] = useState<PersonnelDocument[]>(agent.documents || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Formulaire d'ajout
  const [formData, setFormData] = useState<DocumentFormData>({
    designation: '',
    url: '',
    type: 'pdf'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Synchroniser les documents avec l'agent
  useEffect(() => {
    setDocuments(agent.documents || []);
  }, [agent.documents]);

  // Obtenir le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Obtenir l'icône selon le type de document
  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Eye className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Taille inconnue';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Upload de fichier
  const handleFileUpload = async (file: File): Promise<{ url: string; taille: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', agent._id);
    formData.append('type', 'document');

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload du fichier');
    }

    const result = await response.json();
    return {
      url: result.url,
      taille: file.size
    };
  };

  // Ajouter un document
  const handleAddDocument = async () => {
    if (!formData.designation.trim()) {
      alert('Veuillez saisir une désignation pour le document');
      return;
    }

    setIsLoading(true);
    try {
      let documentData = { ...formData };

      // Upload du fichier si sélectionné
      if (selectedFile) {
        setUploadingFile(true);
        const uploadResult = await handleFileUpload(selectedFile);
        documentData.url = uploadResult.url;
        documentData.taille = uploadResult.taille;
        documentData.type = selectedFile.type.split('/')[1] as any;
      } else if (!formData.url.trim()) {
        alert('Veuillez sélectionner un fichier ou saisir une URL');
        return;
      }

      // Ajouter le document via l'API
      const response = await fetch(`${API_URL}/users/documents/${agent._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(documentData)
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour l'agent avec les nouveaux documents
        onAgentUpdated(result.data);
        setDocuments(result.data.documents || []);
        
        // Réinitialiser le formulaire
        setFormData({ designation: '', url: '', type: 'pdf' });
        setSelectedFile(null);
        setShowAddForm(false);
        
        alert('Document ajouté avec succès');
      } else {
        throw new Error(result.message || 'Erreur lors de l\'ajout du document');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      alert('Erreur lors de l\'ajout du document');
    } finally {
      setIsLoading(false);
      setUploadingFile(false);
    }
  };

  // Supprimer un document
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    setDeletingId(documentId);
    try {
      const response = await fetch(`${API_URL}/users/documents/${agent._id}/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour l'agent avec les documents restants
        onAgentUpdated(result.data);
        setDocuments(result.data.documents || []);
        
        alert('Document supprimé avec succès');
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression du document');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      alert('Erreur lors de la suppression du document');
    } finally {
      setDeletingId(null);
    }
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Définir automatiquement la désignation si vide
      if (!formData.designation) {
        setFormData(prev => ({
          ...prev,
          designation: file.name.split('.')[0]
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Documents de {agent.nom} {agent.post_nom} {agent.prenom}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Matricule: {agent.matricule}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Bouton d'ajout */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un document
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Nouveau document
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: CV, Diplôme, Certificat..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de document
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="docx">DOCX</option>
                    <option value="jpg">JPG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fichier ou URL
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-center text-gray-500 dark:text-gray-400">OU</div>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://exemple.com/document.pdf"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Fichier sélectionné: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleAddDocument}
                  disabled={isLoading || uploadingFile}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {uploadingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Upload...
                    </>
                  ) : isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ajouter
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ designation: '', url: '', type: 'pdf' });
                    setSelectedFile(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Documents ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun document disponible
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getDocumentIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {doc.designation}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Type: {doc.type.toUpperCase()}
                          </p>
                          {doc.taille && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Taille: {formatFileSize(doc.taille)}
                            </p>
                          )}
                          {doc.dateAjout && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Ajouté le: {new Date(doc.dateAjout).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc._id!)}
                          disabled={deletingId === doc._id}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === doc._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModal;
