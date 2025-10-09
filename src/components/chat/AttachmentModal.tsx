'use client';
import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import BlobManager from '@/services/BlobManager';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachmentsSelected: (attachments: string[]) => void;
  userId?: string;
}

interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'document';
  name: string;
  size: string;
}

export default function AttachmentModal({ 
  isOpen, 
  onClose, 
  onAttachmentsSelected,
  userId 
}: AttachmentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): 'image' | 'document' => {
    return file.type.startsWith('image/') ? 'image' : 'document';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newPreviews: FilePreview[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: getFileType(file),
      name: file.name,
      size: formatFileSize(file.size)
    }));

    setSelectedFiles(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const filePreview = selectedFiles[i];
        const progressKey = `file-${i}`;
        
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));

        try {
          const uploadedUrl = await BlobManager.createBlob(filePreview.file);

          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl.url);
            setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
          }
        } catch (error) {
          console.error(`Erreur upload ${filePreview.name}:`, error);
          // Continuer avec les autres fichiers
        }
      }

      // Appeler le callback avec les URLs uploadées
      onAttachmentsSelected(uploadedUrls);
      
      // Nettoyer et fermer
      handleClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload des fichiers');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleClose = () => {
    // Nettoyer les URLs d'objets
    selectedFiles.forEach(file => URL.revokeObjectURL(file.url));
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);
    onClose();
  };

  const getFileIcon = (type: 'image' | 'document') => {
    if (type === 'image') {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Ajouter des pièces jointes
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zone de sélection de fichiers */}
        <div className="mb-6">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cliquez pour sélectionner des fichiers ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Images (JPG, PNG, GIF) ou Documents (PDF, DOC, DOCX, etc.)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Aperçu des fichiers sélectionnés */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Fichiers sélectionnés ({selectedFiles.length})
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.size}
                    </p>
                    
                    {/* Barre de progression */}
                    {isUploading && uploadProgress[`file-${index}`] !== undefined && (
                      <div className="mt-2">
                        <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[`file-${index}`]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isUploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Upload en cours...</span>
              </div>
            ) : (
              `Envoyer ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
