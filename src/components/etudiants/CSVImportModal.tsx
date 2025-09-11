"use client";
import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { EtudiantFormData, Etudiant } from "@/types/etudiant";
import { EtudiantService } from "@/services/EtudiantService";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (etudiants: Etudiant[]) => void;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onImport,
}: CSVImportModalProps) {
  const [csvData, setCsvData] = useState<string>("");
  const [previewData, setPreviewData] = useState<EtudiantFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (csvText: string): EtudiantFormData[] => {
    console.log("Parsing CSV:", csvText);
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const data: EtudiantFormData[] = [];

    // Détecter si la première ligne contient des en-têtes
    const firstLine = lines[0].split(',').map(v => v.trim().toLowerCase());
    const hasHeaders = firstLine.some(val => 
      ['nom', 'post_nom', 'prenom', 'sexe', 'matricule'].includes(val)
    );

    console.log("Has headers:", hasHeaders, "First line:", firstLine);

    const startIndex = hasHeaders ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      console.log(`Processing line ${i + 1}:`, values);

      if (values.length < 3) {
        console.warn(`Ligne ${i + 1} ignorée - pas assez de colonnes`);
        continue;
      }

      const etudiant: EtudiantFormData = {
        nom: "",
        post_nom: "",
        prenom: "",
        sexe: "",
        nationalite: "",
        lieu_naissance: "",
        date_naissance: "",
        matricule: "",
        secure: "",
        solde: 0,
        photo: "",
      };

      if (hasHeaders) {
        // Parse avec en-têtes
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'nom':
              etudiant.nom = value;
              break;
            case 'post_nom':
            case 'postnom':
              etudiant.post_nom = value;
              break;
            case 'prenom':
            case 'prénom':
              etudiant.prenom = value;
              break;
            case 'sexe':
              etudiant.sexe = value.toUpperCase() === 'M' || value.toUpperCase() === 'MASCULIN' ? 'M' : 'F';
              break;
            case 'nationalite':
            case 'nationalité':
              etudiant.nationalite = value;
              break;
            case 'lieu_naissance':
            case 'lieu de naissance':
              etudiant.lieu_naissance = value;
              break;
            case 'date_naissance':
            case 'date de naissance':
              etudiant.date_naissance = value;
              break;
            case 'matricule':
              etudiant.matricule = value;
              break;
            case 'secure':
            case 'mot_de_passe':
            case 'password':
              etudiant.secure = value;
              break;
            case 'solde':
              etudiant.solde = parseFloat(value) || 0;
              break;
            case 'photo':
              etudiant.photo = value;
              break;
          }
        });
      } else {
        // Parse sans en-têtes - ordre standard : nom,post_nom,prenom,sexe,nationalite,lieu_naissance,date_naissance,matricule,secure,solde,photo
        etudiant.nom = values[0] || '';
        etudiant.post_nom = values[1] || '';
        etudiant.prenom = values[2] || '';
        etudiant.sexe = (values[3] && values[3].toUpperCase() === 'M') ? 'M' : 'F';
        etudiant.nationalite = values[4] || '';
        etudiant.lieu_naissance = values[5] || '';
        etudiant.date_naissance = values[6] || '';
        etudiant.matricule = values[7] || '';
        etudiant.secure = values[8] || '';
        etudiant.solde = parseFloat(values[9]) || 0;
        etudiant.photo = values[10] || '';
      }

      console.log("Processing student:", etudiant);

      // Générer matricule et mot de passe si manquants
      if (!etudiant.matricule) {
        const prefix = "ETU";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        etudiant.matricule = `${prefix}${timestamp}${random}`;
      }

      if (!etudiant.secure) {
        etudiant.secure = Math.random().toString(36).slice(-8);
      }

      // S'assurer que le sexe est défini
      if (!etudiant.sexe) {
        etudiant.sexe = 'M';
      }

      // Validation assouplie - seulement les champs essentiels
      if (etudiant.nom.trim() && etudiant.post_nom.trim() && etudiant.prenom.trim()) {
        data.push(etudiant);
        console.log("Student added:", etudiant);
      } else {
        console.warn(`Ligne ${i + 1} ignorée - données essentielles manquantes:`, {
          nom: etudiant.nom,
          post_nom: etudiant.post_nom,
          prenom: etudiant.prenom
        });
      }
    }

    console.log("Parsed data:", data);
    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      setCsvData(csvText);
      
      try {
        const parsed = parseCsv(csvText);
        setPreviewData(parsed);
      } catch (error) {
        console.error("Erreur lors du parsing CSV:", error);
        alert("Erreur lors de l'analyse du fichier CSV");
      }
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const csvText = e.target.value;
    setCsvData(csvText);
    
    if (csvText.trim()) {
      try {
        console.log("Parsing CSV:", csvText);
        const parsed = parseCsv(csvText);
        console.log("Parsed data:", parsed);
        setPreviewData(parsed);
      } catch (error) {
        console.error("Erreur lors du parsing CSV:", error);
        setPreviewData([]);
      }
    } else {
      setPreviewData([]);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      alert("Aucune donnée à importer");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: previewData.length });
    
    try {
      const createdEtudiants: Etudiant[] = [];
      
      // Créer les étudiants un par un avec suivi du progrès
      for (let i = 0; i < previewData.length; i++) {
        const etudiantData = previewData[i];
        setProgress({ current: i + 1, total: previewData.length });
        
        try {
          const newEtudiant = await EtudiantService.createEtudiant(etudiantData);
          createdEtudiants.push(newEtudiant);
        } catch (error) {
          console.error(`Erreur lors de la création de l'étudiant ${etudiantData.nom} ${etudiantData.prenom}:`, error);
          // Continue avec les autres étudiants même si un échoue
        }
      }
      
      if (createdEtudiants.length === 0) {
        alert("Aucun étudiant n'a pu être créé. Vérifiez les données et réessayez.");
        return;
      }
      
      // Appeler onImport avec les étudiants créés
      onImport(createdEtudiants);
      
      alert(`${createdEtudiants.length}/${previewData.length} étudiant(s) importé(s) avec succès !`);
      onClose();
      setCsvData("");
      setPreviewData([]);
      setProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      alert(`Erreur lors de l'import des étudiants: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `nom,post_nom,prenom,sexe,nationalite,lieu_naissance,date_naissance,matricule,secure,solde,photo
Dupont,Martin,Jean,M,Française,Paris,1995-05-15,ETU123456,motdepasse,1000.00,
Smith,Johnson,Marie,F,Belge,Bruxelles,1998-08-22,ETU789012,password123,1500.50,`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-etudiants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Importer des étudiants (CSV)
        </h2>

        <div className="space-y-4">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
            >
              Télécharger le modèle CSV
            </button>
            
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Choisir un fichier CSV
              </button>
            </div>
          </div>

          {/* Zone de texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ou collez vos données CSV ici :
            </label>
            <textarea
              value={csvData}
              onChange={handleTextareaChange}
              placeholder="nom,post_nom,prenom,sexe,nationalite,lieu_naissance,date_naissance,matricule,secure,solde&#10;Dupont,Martin,Jean,M,Française,Paris,1995-05-15,ETU123456,motdepasse,1000.00"
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            />
          </div>

          {/* Format attendu */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Format CSV attendu :
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Les colonnes suivantes sont supportées :
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
              <li>• nom (requis)</li>
              <li>• post_nom (requis)</li>
              <li>• prenom (requis)</li>
              <li>• sexe (M/F)</li>
              <li>• nationalite</li>
              <li>• lieu_naissance</li>
              <li>• date_naissance (YYYY-MM-DD)</li>
              <li>• matricule (généré si vide)</li>
              <li>• secure (généré si vide)</li>
              <li>• solde (nombre)</li>
              <li>• photo (URL)</li>
            </ul>
          </div>

          {/* Aperçu des données */}
          {previewData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Aperçu des données ({previewData.length} étudiants)
                </h3>
              </div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Nom complet</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Sexe</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Matricule</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((etudiant, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 text-gray-900 dark:text-white">
                          {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                          {etudiant.sexe}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                          {etudiant.matricule}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                          {etudiant.solde} CDF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    ... et {previewData.length - 10} autres étudiants
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Barre de progression */}
          {loading && progress.total > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Importation en cours...
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={previewData.length === 0 || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading 
                ? `Import en cours... (${progress.current}/${progress.total})`
                : `Importer ${previewData.length} étudiant(s)`
              }
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
