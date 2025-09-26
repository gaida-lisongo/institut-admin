"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChargeWithDetails, Fiche } from '@/services/ChargeService';
import { Etudiant } from '@/types/etudiant';
import ChargeService from '@/services/ChargeService';
import * as ExcelJS from 'exceljs';

interface FicheCotationProps {
  charge: ChargeWithDetails;
  onBack: () => void;
}

export default function FicheCotation({ charge, onBack }: FicheCotationProps) {
  const [fiches, setFiches] = useState<Fiche[]>(charge.fiches);
  const [filteredFiches, setFilteredFiches] = useState<Fiche[]>(charge.fiches);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'PENDING' | 'NO'>('ALL');
  const [importing, setImporting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour la modal d'import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<{
    fileName: string;
    totalRows: number;
    validRows: any[];
    invalidRows: any[];
    corrections: any[];
  } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'importing' | 'completed' | 'error'>('idle');

  // Filtrage des fiches
  useEffect(() => {
    let filtered = fiches;
    
    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(fiche => {
        if (!fiche.etudiantId) return false;
        const etudiant = fiche.etudiantId as Etudiant;
        const fullName = `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`.toLowerCase();
        const matricule = etudiant.matricule?.toLowerCase() || '';
        const reference = fiche.reference?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || matricule.includes(search) || reference.includes(search);
      });
    }
    
    // Filtrage par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(fiche => fiche.status === statusFilter);
    }
    
    setFilteredFiches(filtered);
  }, [fiches, searchTerm, statusFilter]);

  // Sauvegarde automatique avec calcul du status
  const autoSaveFiche = async (ficheId: string, field: 'cmi' | 'examen' | 'rattrapage', value: number) => {
    const fiche = fiches.find(f => f._id === ficheId);
    if (!fiche) return;
    
    const updatedData = { ...fiche, [field]: value };
    const total = calculateTotal(updatedData.cmi || 0, updatedData.examen || 0, updatedData.rattrapage || 0);
    
    // Calcul automatique du status
    const newStatus = total >= 10 ? 'OK' : 'PENDING';
    
    setLoading(true);
    try {
      await ChargeService.updateFiche(ficheId, {
        [field]: value,
        status: newStatus
      });
      
      // Mettre à jour la liste locale
      setFiches(prev => prev.map(f => 
        f._id === ficheId ? { ...f, [field]: value, status: newStatus } : f
      ));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation des valeurs saisies - Version ultra-simple
  const validateAndParseValue = (value: string, field: 'cmi' | 'examen' | 'rattrapage') => {
    // Si vide, considérer comme 0 (valide)
    if (!value || value.trim() === '') {
      return { isValid: true, value: 0, error: null };
    }
    
    // Remplacer virgule par point pour gérer les deux séparateurs décimaux
    const normalizedValue = value.replace(',', '.');
    
    // Essayer de parser directement
    const numValue = parseFloat(normalizedValue);
    
    // Si ce n'est pas un nombre valide, rejeter
    if (isNaN(numValue) || !isFinite(numValue)) {
      return { isValid: false, value: 0, error: 'Format invalide' };
    }
    
    // Définir les limites selon le champ
    const limits = {
      cmi: { min: 0, max: 10 },
      examen: { min: 0, max: 10 },
      rattrapage: { min: 0, max: 20 }
    };
    
    const { min, max } = limits[field];
    
    if (numValue < min) {
      return { isValid: false, value: numValue, error: `Minimum: ${min}` };
    }
    
    if (numValue > max) {
      return { isValid: false, value: numValue, error: `Maximum: ${max}` };
    }
    
    return { isValid: true, value: numValue, error: null };
  };

  // Gestion des changements de notes avec validation et sauvegarde automatique
  const handleNoteChange = (ficheId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => {
    const validation = validateAndParseValue(value, field);
    const errorKey = `${ficheId}_${field}`;
    
    // Mise à jour des erreurs dans un état séparé
    setFieldErrors(prev => ({
      ...prev,
      [errorKey]: validation.error
    }));
    
    // Mise à jour immédiate de l'affichage (même si invalide pour le feedback)
    setFiches(prev => prev.map(f => 
      f._id === ficheId ? { 
        ...f, 
        [field]: validation.value
      } : f
    ));
    
    // Sauvegarde automatique seulement si valide
    if (validation.isValid) {
      setTimeout(() => {
        autoSaveFiche(ficheId, field, validation.value);
        // Nettoyer l'erreur après sauvegarde réussie
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }, 1000); // 1 seconde de délai
    }
  };

  const getEtudiantInfo = (etudiant: Etudiant | string) => {
    if (typeof etudiant === 'string') {
      return { fullName: etudiant, matricule: 'N/A' };
    }
    const fullName = `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`;
    return { fullName, matricule: etudiant.matricule || 'N/A' };
  };

  const calculateTotal = (cmi: number = 0, examen: number = 0, rattrapage: number = 0) => {
    // Nouveau système: CMI=10pts, Examen=10pts, Rattrapage=20pts
    // Rattrapage remplace CMI+Examen seulement si supérieur
    const totalNormal = cmi + examen;
    if (rattrapage > 0 && rattrapage > totalNormal) {
      return Math.round(rattrapage * 100) / 100;
    }
    // Sinon: CMI + Examen
    return Math.round(totalNormal * 100) / 100;
  };

  const getGradeColor = (total: number) => {
    if (total >= 16) return 'text-green-600 dark:text-green-400';
    if (total >= 14) return 'text-blue-600 dark:text-blue-400';
    if (total >= 12) return 'text-yellow-600 dark:text-yellow-400';
    if (total >= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Export Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Résultats');

    // En-têtes
    worksheet.columns = [
      { header: 'ID Fiche', key: 'ficheId', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Post-nom', key: 'postNom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Référence', key: 'reference', width: 15 },
      { header: 'CMI (/10)', key: 'cmi', width: 10 },
      { header: 'Examen (/10)', key: 'examen', width: 12 },
      { header: 'Rattrapage (/20)', key: 'rattrapage', width: 15 },
      { header: 'Total (/20)', key: 'total', width: 12 },
      { header: 'Statut', key: 'status', width: 10 }
    ];

    // Données
    fiches.forEach(fiche => {
      const etudiant = fiche.etudiantId as Etudiant;
      const total = calculateTotal(fiche.cmi || 0, fiche.examen || 0, fiche.rattrapage || 0);
      
      worksheet.addRow({
        ficheId: fiche._id,
        nom: etudiant.nom,
        postNom: etudiant.post_nom,
        prenom: etudiant.prenom,
        matricule: etudiant.matricule,
        reference: fiche.reference,
        cmi: fiche.cmi || 0,
        examen: fiche.examen || 0,
        rattrapage: fiche.rattrapage || 0,
        total: total,
        status: fiche.status
      });
    });

    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' }
    };

    // Générer et télécharger
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats_${charge.cours.titre}_${charge.annee.debut}-${charge.annee.fin}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export template CSV
  const exportTemplateCSV = () => {
    const headers = ['ficheId', 'nom', 'postNom', 'prenom', 'matricule', 'cmi', 'examen', 'rattrapage'];
    const csvContent = [
      headers.join(','),
      ...fiches.map(fiche => {
        const etudiant = fiche.etudiantId as Etudiant;
        return [
          fiche._id,
          `"${etudiant.nom}"`,
          `"${etudiant.post_nom}"`,
          `"${etudiant.prenom}"`,
          etudiant.matricule,
          fiche.cmi || '',
          fiche.examen || '',
          fiche.rattrapage || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${charge.cours.titre}_${charge.annee.debut}-${charge.annee.fin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Détection et correction d'encodage
  const detectAndFixEncoding = (text: string): string => {
    // Détecter les caractères mal encodés courants
    const fixes: [RegExp, string][] = [
      [/Ã©/g, 'é'], [/Ã¨/g, 'è'], [/Ã /g, 'à'], [/Ã§/g, 'ç'],
      [/Ã´/g, 'ô'], [/Ã¢/g, 'â'], [/Ãª/g, 'ê'], [/Ã®/g, 'î'],
      [/Ã¹/g, 'ù'], [/Ã»/g, 'û'], [/Ã¯/g, 'ï'], [/Ã«/g, 'ë'],
      [/â€™/g, "'"], [/â€œ/g, '"'], [/â€/g, '"'], [/â€"/g, '–']
    ];
    
    let fixedText = text;
    fixes.forEach(([pattern, replacement]) => {
      fixedText = fixedText.replace(pattern, replacement);
    });
    
    return fixedText;
  };

  // Détection automatique des colonnes dans le CSV
  const detectCSVColumns = (headers: string[]) => {
    const columnMap: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim().replace(/['"]/g, '');
      
      // Détection des colonnes par nom ou synonymes
      if (cleanHeader.includes('fiche') || cleanHeader.includes('id')) {
        columnMap.ficheId = index;
      } else if (cleanHeader.includes('nom') && !cleanHeader.includes('post') && !cleanHeader.includes('pre')) {
        columnMap.nom = index;
      } else if (cleanHeader.includes('postnom') || cleanHeader.includes('post_nom') || cleanHeader.includes('post-nom')) {
        columnMap.postNom = index;
      } else if (cleanHeader.includes('prenom') || cleanHeader.includes('prénom') || cleanHeader.includes('pre_nom')) {
        columnMap.prenom = index;
      } else if (cleanHeader.includes('matricule') || cleanHeader.includes('numero')) {
        columnMap.matricule = index;
      } else if (cleanHeader.includes('cmi') || cleanHeader.includes('cours magistral')) {
        columnMap.cmi = index;
      } else if (cleanHeader.includes('examen') || cleanHeader.includes('exam')) {
        columnMap.examen = index;
      } else if (cleanHeader.includes('rattrapage') || cleanHeader.includes('rattrap')) {
        columnMap.rattrapage = index;
      }
    });
    
    return columnMap;
  };

  // Préprocessing du fichier CSV avec prévisualisation
  const preprocessCSVFile = (file: File) => {
    setImportStatus('processing');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let csv = e.target?.result as string;
        
        // Correction d'encodage
        csv = detectAndFixEncoding(csv);
        
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        // Détection automatique des colonnes
        const columnMap = detectCSVColumns(headers);
        
        console.log('Colonnes détectées:', columnMap);
        console.log('En-têtes du fichier:', headers);
        
        const validRows: any[] = [];
        const invalidRows: any[] = [];
        const corrections: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
          
          // Extraction des valeurs selon la structure détectée
          const ficheId = columnMap.ficheId !== undefined ? values[columnMap.ficheId] : values[0];
          
          if (!ficheId) {
            invalidRows.push({
              lineNumber: i + 1,
              data: values,
              errors: ['ID fiche manquant']
            });
            continue;
          }
          
          // Trouver la fiche correspondante
          const existingFiche = fiches.find(f => f._id === ficheId);
          if (!existingFiche) {
            invalidRows.push({
              lineNumber: i + 1,
              data: values,
              errors: ['Fiche introuvable']
            });
            continue;
          }
          
          // Extraction des notes avec fallback sur les positions par défaut
          const cmiValue = columnMap.cmi !== undefined ? values[columnMap.cmi] : values[5];
          const examenValue = columnMap.examen !== undefined ? values[columnMap.examen] : values[6];
          const rattrapageValue = columnMap.rattrapage !== undefined ? values[columnMap.rattrapage] : values[7];
          
          // Validation des valeurs
          const cmiValidation = validateAndParseValue(cmiValue || '0', 'cmi');
          const examenValidation = validateAndParseValue(examenValue || '0', 'examen');
          const rattrapageValidation = validateAndParseValue(rattrapageValue || '0', 'rattrapage');
          
          const errors: string[] = [];
          if (!cmiValidation.isValid) errors.push(`CMI: ${cmiValidation.error}`);
          if (!examenValidation.isValid) errors.push(`Examen: ${examenValidation.error}`);
          if (!rattrapageValidation.isValid) errors.push(`Rattrapage: ${rattrapageValidation.error}`);
          
          const rowData = {
            lineNumber: i + 1,
            ficheId,
            etudiant: existingFiche.etudiantId as Etudiant,
            currentValues: {
              cmi: existingFiche.cmi || 0,
              examen: existingFiche.examen || 0,
              rattrapage: existingFiche.rattrapage || 0
            },
            newValues: {
              cmi: cmiValidation.value,
              examen: examenValidation.value,
              rattrapage: rattrapageValidation.value
            },
            total: calculateTotal(cmiValidation.value, examenValidation.value, rattrapageValidation.value),
            errors,
            rawData: values // Garder les données brutes pour debug
          };
          
          if (errors.length > 0) {
            invalidRows.push(rowData);
          } else {
            validRows.push(rowData);
            
            // Détecter les corrections automatiques
            if (cmiValue !== cmiValidation.value.toString() || 
                examenValue !== examenValidation.value.toString() || 
                rattrapageValue !== rattrapageValidation.value.toString()) {
              corrections.push({
                lineNumber: i + 1,
                field: 'format',
                original: `${cmiValue}, ${examenValue}, ${rattrapageValue}`,
                corrected: `${cmiValidation.value}, ${examenValidation.value}, ${rattrapageValidation.value}`
              });
            }
          }
        }
        
        setImportData({
          fileName: file.name,
          totalRows: lines.length - 1,
          validRows,
          invalidRows,
          corrections
        });
        
        setShowImportModal(true);
        setImportStatus('idle');
        
      } catch (error) {
        console.error('Erreur lors du preprocessing:', error);
        setImportStatus('error');
        alert('Erreur lors de l\'analyse du fichier CSV');
      }
    };
    
    // Essayer différents encodages
    reader.readAsText(file, 'UTF-8');
  };

  // Import CSV avec modal de prévisualisation
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    preprocessCSVFile(file);
  };

  // Exécution de l'import avec barre de progression
  const executeImport = async () => {
    if (!importData) return;
    
    setImportStatus('importing');
    setImportProgress(0);
    
    const validRows = importData.validRows;
    const totalRows = validRows.length;
    let processedRows = 0;
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const row of validRows) {
        try {
          const newStatus = row.total >= 10 ? 'OK' : 'PENDING';
          
          await ChargeService.updateFiche(row.ficheId, {
            cmi: row.newValues.cmi,
            examen: row.newValues.examen,
            rattrapage: row.newValues.rattrapage,
            status: newStatus
          });
          
          // Mise à jour locale
          setFiches(prev => prev.map(f => 
            f._id === row.ficheId ? { 
              ...f, 
              cmi: row.newValues.cmi,
              examen: row.newValues.examen,
              rattrapage: row.newValues.rattrapage,
              status: newStatus
            } : f
          ));
          
          successCount++;
        } catch (error) {
          console.error(`Erreur pour la fiche ${row.ficheId}:`, error);
          errorCount++;
        }
        
        processedRows++;
        setImportProgress(Math.round((processedRows / totalRows) * 100));
        
        // Petite pause pour éviter de surcharger le serveur
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setImportStatus('completed');
      
      setTimeout(() => {
        setShowImportModal(false);
        setImportData(null);
        setImportProgress(0);
        setImportStatus('idle');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setImportStatus('error');
    }
  };

  return (
    <div className="p-6">
      {/* Header avec bouton retour */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux charges
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {charge.cours.titre}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {charge.cours.description} • {charge.annee.debut} - {charge.annee.fin}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {fiches.filter(f => f.status === 'OK').length} / {fiches.length} étudiants cotés
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {fiches.length > 0 ? Math.round((fiches.filter(f => f.status === 'OK').length / fiches.length) * 100) : 0}% terminé
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Affichage: {filteredFiches.length} / {fiches.length}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un étudiant
            </label>
            <input
              type="text"
              placeholder="Nom, prénom, matricule ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrer par statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'OK' | 'PENDING' | 'NO')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En cours</option>
              <option value="OK">Terminé</option>
              <option value="NO">Non évalué</option>
            </select>
          </div>
        </div>
        
        {/* Boutons Export/Import */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📊 Exporter Excel
            </button>
            
            <button
              onClick={exportTemplateCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📋 Template CSV
            </button>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    📤 Importer CSV
                  </>
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 <strong>Astuce :</strong> Téléchargez le template CSV, remplissez les notes dans Excel/Calc, puis importez pour une saisie rapide !
          </p>
        </div>
      </div>

      {/* Légende des notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Système de notation - Sauvegarde automatique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">CMI (0-10 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Cours Magistral Interactif</p>
            <p className="text-xs text-blue-500 dark:text-blue-300">✓ Ex: 0, 8,5, 8.5, 10</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Examen (0-10 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Note d'examen final</p>
            <p className="text-xs text-blue-500 dark:text-blue-300">✓ Ex: 0, 7,25, 9.75, 10</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Rattrapage (0-20 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Remplace CMI+Examen si supérieur</p>
            <p className="text-xs text-blue-500 dark:text-blue-300">✓ Ex: 0, 15,5, 18.25, 20 - Status auto: OK si ≥10</p>
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des étudiants ({filteredFiches.length})
            </h3>
            {loading && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Sauvegarde...
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CMI (/10)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Examen (/10)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rattrapage (/20)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total (/20)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiches.map((fiche) => {
                if (!fiche.etudiantId) {
                  return null;
                }
                const total = calculateTotal(
                  fiche.cmi || 0,
                  fiche.examen || 0,
                  fiche.rattrapage || 0
                );
                const etudiantInfo = getEtudiantInfo(fiche.etudiantId);

                return (
                  <tr key={fiche._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {etudiantInfo.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Matricule: {etudiantInfo.matricule}
                      </div>
                      <div className="text-xs text-gray-400">
                        Réf: {fiche.reference || 'N/A'}
                      </div>
                    </td>
                    
                    {/* CMI */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0-10"
                            value={fiche.cmi || ''}
                            onChange={(e) => handleNoteChange(fiche._id!, 'cmi', e.target.value)}
                            className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                              fieldErrors[`${fiche._id}_cmi`] 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {fieldErrors[`${fiche._id}_cmi`] && (
                            <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                              {fieldErrors[`${fiche._id}_cmi`]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.cmi || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Examen */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0-10"
                            value={fiche.examen || ''}
                            onChange={(e) => handleNoteChange(fiche._id!, 'examen', e.target.value)}
                            className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                              fieldErrors[`${fiche._id}_examen`] 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {fieldErrors[`${fiche._id}_examen`] && (
                            <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                              {fieldErrors[`${fiche._id}_examen`]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.examen || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Rattrapage */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0-20"
                            value={fiche.rattrapage || ''}
                            onChange={(e) => handleNoteChange(fiche._id!, 'rattrapage', e.target.value)}
                            className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                              fieldErrors[`${fiche._id}_rattrapage`] 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {fieldErrors[`${fiche._id}_rattrapage`] && (
                            <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                              {fieldErrors[`${fiche._id}_rattrapage`]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.rattrapage || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getGradeColor(total)}`}>
                        {total > 0 ? total.toFixed(2) : '-'}
                      </span>
                    </td>
                    
                    {/* Statut */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        fiche.status === 'OK' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : fiche.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {fiche.status}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {fiche.status === 'PENDING' ? (
                        <span className="text-green-600 dark:text-green-400 text-xs flex items-center">
                          ✏️ Éditable
                          {loading && <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">
                          🔒 Lecture seule
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de prévisualisation d'import */}
      {showImportModal && importData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Prévisualisation d'import - {importData.fileName}
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData(null);
                    setImportStatus('idle');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {importStatus === 'processing' && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600 dark:text-gray-400">Analyse du fichier en cours...</span>
                </div>
              )}

              {importStatus === 'importing' && (
                <div className="py-8">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Import en cours...
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {importProgress}% - Traitement des notes
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {importStatus === 'completed' && (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Import terminé avec succès !
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {importData.validRows.length} fiches ont été mises à jour
                  </p>
                </div>
              )}

              {importStatus === 'idle' && (
                <>
                  {/* Résumé */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {importData.totalRows}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total lignes</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {importData.validRows.length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Valides</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {importData.invalidRows.length}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Erreurs</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {importData.corrections.length}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Corrections</div>
                    </div>
                  </div>

                  {/* Corrections automatiques */}
                  {importData.corrections.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        🔧 Corrections automatiques appliquées
                      </h4>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 max-h-32 overflow-y-auto">
                        {importData.corrections.map((correction, index) => (
                          <div key={index} className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                            Ligne {correction.lineNumber}: {correction.original} → {correction.corrected}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Erreurs */}
                  {importData.invalidRows.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        ❌ Lignes avec erreurs (ne seront pas importées)
                      </h4>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 max-h-32 overflow-y-auto">
                        {importData.invalidRows.map((row, index) => (
                          <div key={index} className="text-sm text-red-800 dark:text-red-200 mb-1">
                            Ligne {row.lineNumber}: {row.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aperçu des données valides */}
                  {importData.validRows.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        ✅ Aperçu des modifications (premières 5 lignes)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Étudiant
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                CMI
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Examen
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Rattrapage
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {importData.validRows.slice(0, 5).map((row, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                  {row.etudiant.nom} {row.etudiant.prenom}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">{row.currentValues.cmi}</span>
                                  <span className="mx-1">→</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">{row.newValues.cmi}</span>
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">{row.currentValues.examen}</span>
                                  <span className="mx-1">→</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">{row.newValues.examen}</span>
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">{row.currentValues.rattrapage}</span>
                                  <span className="mx-1">→</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">{row.newValues.rattrapage}</span>
                                </td>
                                <td className="px-3 py-2 text-sm font-medium">
                                  <span className={row.total >= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {row.total}/20
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {importData.validRows.length > 5 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            ... et {importData.validRows.length - 5} autres lignes
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {importStatus === 'idle' && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={executeImport}
                  disabled={importData.validRows.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
                >
                  Importer {importData.validRows.length} fiches
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
