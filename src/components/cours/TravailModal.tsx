"use client";
import React, { useState, useEffect } from "react";
import { Travail } from "@/services/CoursService";
import BlobManager from "@/services/BlobManager";

interface TravailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (travail: Omit<Travail, '_id'> | Partial<Travail>) => void;
  travail?: Travail;
  anneeId: string;
}

export default function TravailModal({
  isOpen,
  onClose,
  onSave,
  travail,
  anneeId,
}: TravailModalProps) {
  const [formData, setFormData] = useState<{
    anneeId: string;
    questionnaire: string;
    produitId: string;
    status: 'NO' | 'PENDING' | 'OK';
  }>({
    anneeId: anneeId,
    questionnaire: "",
    produitId: "",
    status: "PENDING",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  useEffect(() => {
    if (travail) {
      setFormData({
        anneeId: travail.anneeId,
        questionnaire: travail.questionnaire,
        produitId: travail.produitId,
        status: travail.status,
      });
      setUploadedFile(travail.questionnaire);
    } else {
      setFormData({
        anneeId: anneeId,
        questionnaire: "",
        produitId: "",
        status: "PENDING",
      });
      setUploadedFile(null);
    }
  }, [travail, anneeId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF");
      return;
    }

    setIsUploading(true);
    try {
      const result = await BlobManager.createBlob(file, {
        type: "questionnaire",
        originalName: file.name,
      });
      
      setUploadedFile(result.url);
      setFormData(prev => ({
        ...prev,
        questionnaire: result.url,
      }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionnaire) {
      alert("Veuillez uploader un questionnaire PDF");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleStatusChange = (status: 'NO' | 'PENDING' | 'OK') => {
    setFormData(prev => ({ ...prev, status }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {travail ? "Modifier le travail" : "Nouveau travail"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Produit
            </label>
            <input
              type="text"
              value={formData.produitId}
              onChange={(e) => setFormData(prev => ({ ...prev, produitId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Questionnaire PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>
            )}
            {uploadedFile && (
              <div className="mt-2">
                <a
                  href={uploadedFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Voir le fichier uploadé
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <div className="flex space-x-2">
              {(['NO', 'PENDING', 'OK'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    formData.status === status
                      ? status === 'OK'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  } border`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading || !formData.questionnaire}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {travail ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
