"use client";

import React, { useState } from 'react';
import { Groupe, ResolutionWithEtudiant } from '@/types/groupe';
import { Session, Cours } from '@/types/session';

interface ExportPalmaresButtonProps {
  groupe: Groupe;
  resolutions: ResolutionWithEtudiant[];
  session?: Session;
  cours?: Cours;
}

const ExportPalmaresButton: React.FC<ExportPalmaresButtonProps> = ({
  groupe,
  resolutions,
  session,
  cours
}) => {
  const [loading, setLoading] = useState(false);

  const exportPalmares = async () => {
    setLoading(true);
    try {
      // Import dynamique d'ExcelJS pour éviter les erreurs SSR
      const ExcelJS = (await import('exceljs')).default;
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Palmarès');

      // Configuration des colonnes
      worksheet.columns = [
        { header: 'Rang', key: 'rang', width: 8 },
        { header: 'Nom', key: 'nom', width: 20 },
        { header: 'Prénom', key: 'prenom', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Classe', key: 'classe', width: 15 },
        { header: 'Note', key: 'note', width: 10 },
        { header: 'Note Max', key: 'noteMax', width: 10 },
        { header: 'Pourcentage', key: 'pourcentage', width: 12 },
        { header: 'Statut', key: 'statut', width: 15 },
        { header: 'Temps (min)', key: 'temps', width: 12 }
      ];

      // Style de l'en-tête
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F46E5' }
      };
      headerRow.alignment = { horizontal: 'center' };

      // Trier les résolutions par note décroissante
      const sortedResolutions = [...resolutions]
        .filter(r => r.statut === 'termine' || r.statut === 'corrige')
        .sort((a, b) => b.note - a.note);

      // Calculer les statistiques
      const notes = sortedResolutions.map(r => r.note);
      const moyenne = notes.length > 0 ? notes.reduce((sum, note) => sum + note, 0) / notes.length : 0;
      const noteMaximale = session?.maximum || 20;

      // Ajouter les données
      sortedResolutions.forEach((resolution, index) => {
        const percentage = noteMaximale > 0 ? (resolution.note / noteMaximale) * 100 : 0;
        
        const row = worksheet.addRow({
          rang: index + 1,
          nom: resolution.etudiant?.nom || 'Inconnu',
          prenom: resolution.etudiant?.prenom || 'Inconnu',
          email: resolution.etudiant?.email || 'Inconnu',
          classe: resolution.classe ? `${resolution.classe.nom} (${resolution.classe.niveau})` : 'Inconnue',
          note: resolution.note,
          noteMax: noteMaximale,
          pourcentage: `${percentage.toFixed(1)}%`,
          statut: resolution.statut.replace('_', ' '),
          temps: resolution.tempsEcoule || 0
        });

        // Coloration selon le rang
        if (index === 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD700' } }; // Or
        } else if (index === 1) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } }; // Argent
        } else if (index === 2) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CD7F32' } }; // Bronze
        }

        // Coloration selon le pourcentage
        if (percentage >= 80) {
          row.getCell('pourcentage').font = { color: { argb: '10B981' } }; // Vert
        } else if (percentage >= 60) {
          row.getCell('pourcentage').font = { color: { argb: '3B82F6' } }; // Bleu
        } else if (percentage >= 40) {
          row.getCell('pourcentage').font = { color: { argb: 'F59E0B' } }; // Orange
        } else {
          row.getCell('pourcentage').font = { color: { argb: 'EF4444' } }; // Rouge
        }
      });

      // Ajouter les statistiques en bas
      worksheet.addRow([]);
      worksheet.addRow(['STATISTIQUES']);
      worksheet.addRow(['Nombre de participants', resolutions.length]);
      worksheet.addRow(['Participants terminés', sortedResolutions.length]);
      worksheet.addRow(['Moyenne générale', `${moyenne.toFixed(2)}/${noteMaximale}`]);
      worksheet.addRow(['Meilleure note', notes.length > 0 ? `${Math.max(...notes)}/${noteMaximale}` : '-']);
      worksheet.addRow(['Plus mauvaise note', notes.length > 0 ? `${Math.min(...notes)}/${noteMaximale}` : '-']);

      // Style des statistiques
      const statsStartRow = worksheet.rowCount - 6;
      for (let i = statsStartRow; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        row.font = { bold: true };
        if (i === statsStartRow) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };
        }
      }

      // Ajouter les informations du groupe en haut
      worksheet.insertRow(1, ['PALMARÈS - ' + groupe.designation]);
      worksheet.insertRow(2, ['Session: ' + (session?.designation || 'Inconnue')]);
      worksheet.insertRow(3, ['Cours: ' + (cours?.designation || 'Inconnu')]);
      worksheet.insertRow(4, ['Date: ' + new Date().toLocaleDateString()]);
      worksheet.insertRow(5, []);

      // Style du titre
      const titleRow = worksheet.getRow(1);
      titleRow.font = { bold: true, size: 16 };
      titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F2937' } };
      titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };

      // Fusionner les cellules du titre
      worksheet.mergeCells('A1:J1');
      worksheet.mergeCells('A2:J2');
      worksheet.mergeCells('A3:J3');
      worksheet.mergeCells('A4:J4');

      // Ajuster la hauteur des lignes
      worksheet.eachRow((row: any) => {
        row.height = 20;
      });

      // Générer le fichier
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `palmares_${groupe.designation.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du palmarès');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={exportPalmares}
      disabled={loading || resolutions.length === 0}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {loading ? 'Export...' : 'Exporter Palmarès'}
    </button>
  );
};

export default ExportPalmaresButton;
