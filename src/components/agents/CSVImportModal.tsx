"use client";
import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { AgentFormData } from "@/types/agent";
import { AgentService } from "@/services/AgentService";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (agents: AgentFormData[]) => Promise<void>;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onImport,
}: CSVImportModalProps) {
  const [csvData, setCsvData] = useState("");
  const [parsedAgents, setParsedAgents] = useState<AgentFormData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      setCsvData(csvText);
      try {
        const agents = AgentService.parseCSV(csvText);
        setParsedAgents(agents);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du CSV");
        setParsedAgents([]);
      }
    };
    reader.readAsText(file);
  };

  const handleManualInput = (value: string) => {
    setCsvData(value);
    try {
      if (value.trim()) {
        const agents = AgentService.parseCSV(value);
        setParsedAgents(agents);
        setError("");
      } else {
        setParsedAgents([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du CSV");
      setParsedAgents([]);
    }
  };

  const handleImport = async () => {
    if (parsedAgents.length === 0) {
      setError("Aucun agent valide à importer");
      return;
    }

    setIsProcessing(true);
    try {
      await onImport(parsedAgents);
      onClose();
      setCsvData("");
      setParsedAgents([]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    AgentService.downloadCSVTemplate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-4xl w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Importer des agents via CSV
        </h2>

        {/* Template download */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            📄 Template CSV
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            Téléchargez le template CSV pour voir le format requis. Remplissez-le avec vos données puis importez-le ici.
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            📥 Télécharger le template
          </button>
        </div>

        {/* File upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Importer un fichier CSV
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Manual input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ou coller le contenu CSV directement
          </label>
          <textarea
            value={csvData}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder="Collez votre CSV ici...&#10;nom,post_nom,prenom,sexe,nationalite,lieu_naissance,date_naissance,matricule,secure,solde,grade,titre&#10;Dupont,Martin,Jean,M,Française,Paris,1990-01-15,MAT001,motdepasse123,2500,Adjoint,Monsieur"
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Preview */}
        {parsedAgents.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Aperçu ({parsedAgents.length} agents détectés)
            </h3>
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Nom</th>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Prénom</th>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Matricule</th>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Grade</th>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedAgents.map((agent, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{agent.nom}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{agent.prenom}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{agent.matricule}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{agent.grade}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{agent.solde} CDF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={parsedAgents.length === 0 || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isProcessing ? "Import en cours..." : `Importer ${parsedAgents.length} agents`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
