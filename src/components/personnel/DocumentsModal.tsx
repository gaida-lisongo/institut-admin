"use client";

import { useState } from "react";
import { X, FileText, Download, Eye, Calendar, User } from "lucide-react";
import { Personnel, PersonnelDocument } from "@/types/personnel";
import Badge from "../ui/badge/Badge";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel;
}

export default function DocumentsModal({ isOpen, onClose, personnel }: DocumentsModalProps) {
  const [selectedDocument, setSelectedDocument] = useState<PersonnelDocument | null>(null);

  if (!isOpen) return null;

  const handleDocumentView = (document: PersonnelDocument) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleDocumentDownload = (document: PersonnelDocument) => {
    if (document.url) {
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.designation || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Documents de {personnel.nomComplet}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Matricule: {personnel.matricule}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!personnel.documents || personnel.documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun document
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Cet agent n'a aucun document enregistré dans le système.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Documents ({personnel.documents.length})
                </h3>
                <Badge color="primary" size="sm">
                  {personnel.documents.length} document{personnel.documents.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid gap-4">
                {personnel.documents.map((document, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {document.designation || `Document ${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {document.type && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {document.type}
                              </span>
                            )}
                            {document.taille && (
                              <span>
                                {formatFileSize(document.taille)}
                              </span>
                            )}
                            {document.dateAjout && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(document.dateAjout)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {document.url && (
                          <>
                            <button
                              onClick={() => handleDocumentView(document)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Visualiser"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDocumentDownload(document)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
