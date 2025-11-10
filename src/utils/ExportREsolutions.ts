import ExcelJS from 'exceljs';
import { Resolution } from '@/services/TravailService';

interface ExportResolutionsParams {
  resolutions: Resolution[];
  travailTitle: string;
  travailId: string;
}

export const exportResolutionsToExcel = async ({
  resolutions,
  travailTitle,
  travailId
}: ExportResolutionsParams) => {
  try {
    // Créer un nouveau workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Résultats');

    // Trier les résolutions par note décroissante
    // Les étudiants avec note d'abord, puis ceux sans note
    const sortedResolutions = [...resolutions].sort((a, b) => {
      const noteA = a.note ?? -1; // -1 pour les sans note (seront à la fin)
      const noteB = b.note ?? -1;
      return noteB - noteA;
    });

    // Configuration des colonnes
    worksheet.columns = [
      { header: 'Classement', key: 'classement', width: 12 },
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Post-nom', key: 'postNom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Note (/20)', key: 'note', width: 12 },
      { header: 'Statut', key: 'statut', width: 12 },
      { header: 'Lien Résolution', key: 'lien', width: 50 }
    ];

    // Style de l'en-tête du titre
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Résultats du Travail: ${travailTitle}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Informations supplémentaires
    worksheet.mergeCells('A2:H2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Total d'étudiants: ${sortedResolutions.length} | Date d'export: ${new Date().toLocaleDateString('fr-FR')}`;
    infoCell.font = { size: 11, italic: true };
    infoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Ligne vide
    worksheet.addRow([]);

    // En-têtes des colonnes (ligne 4)
    const headerRow = worksheet.getRow(4);
    headerRow.values = [
      'Classement',
      'Matricule',
      'Nom',
      'Post-nom',
      'Prénom',
      'Note (/20)',
      'Statut',
      'Lien Résolution'
    ];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Ajouter les données des étudiants
    sortedResolutions.forEach((resolution, index) => {
      const etudiant = resolution.etudiantId;
      const classement = index + 1;
      const note = resolution.note ?? 0;
      const statut = resolution.status === 'OK' ? 'Validé' : 
                     resolution.status === 'NO' ? 'Échoué' : 'En attente';

      const row = worksheet.addRow({
        classement: classement,
        matricule: etudiant.matricule || 'N/A',
        nom: etudiant.nom || '',
        postNom: etudiant.post_nom || '',
        prenom: etudiant.prenom || '',
        note: resolution.note !== null && resolution.note !== undefined ? note : 'Non noté',
        statut: statut,
        lien: resolution.url || 'Non disponible'
      });

      // Style de la ligne
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.height = 20;

      // Couleur de fond alternée
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }

      // Couleur du classement
      const classementCell = row.getCell(1);
      classementCell.alignment = { vertical: 'middle', horizontal: 'center' };
      classementCell.font = { bold: true };
      
      if (classement === 1) {
        classementCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFD700' } // Or
        };
      } else if (classement === 2) {
        classementCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC0C0C0' } // Argent
        };
      } else if (classement === 3) {
        classementCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCD7F32' } // Bronze
        };
      }

      // Couleur de la note
      const noteCell = row.getCell(6);
      noteCell.alignment = { vertical: 'middle', horizontal: 'center' };
      noteCell.font = { bold: true };
      
      if (resolution.note === null || resolution.note === undefined) {
        // Pas de note
        noteCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E7EB' } // Gris
        };
        noteCell.font = { ...noteCell.font, color: { argb: 'FF6B7280' } };
      } else if (note >= 16) {
        noteCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' } // Vert
        };
        noteCell.font = { ...noteCell.font, color: { argb: 'FFFFFFFF' } };
      } else if (note >= 12) {
        noteCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' } // Bleu
        };
        noteCell.font = { ...noteCell.font, color: { argb: 'FFFFFFFF' } };
      } else if (note >= 10) {
        noteCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF59E0B' } // Orange
        };
        noteCell.font = { ...noteCell.font, color: { argb: 'FFFFFFFF' } };
      } else {
        noteCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEF4444' } // Rouge
        };
        noteCell.font = { ...noteCell.font, color: { argb: 'FFFFFFFF' } };
      }

      // Couleur du statut
      const statutCell = row.getCell(7);
      statutCell.alignment = { vertical: 'middle', horizontal: 'center' };
      
      if (statut === 'Validé') {
        statutCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' }
        };
        statutCell.font = { color: { argb: 'FF065F46' }, bold: true };
      } else if (statut === 'Échoué') {
        statutCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' }
        };
        statutCell.font = { color: { argb: 'FF991B1B' }, bold: true };
      } else {
        statutCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
        statutCell.font = { color: { argb: 'FF92400E' }, bold: true };
      }

      // Lien hypertexte pour la résolution
      const lienCell = row.getCell(8);
      if (resolution.url) {
        lienCell.value = {
          text: 'Voir la résolution',
          hyperlink: resolution.url
        };
        lienCell.font = { color: { argb: 'FF2563EB' }, underline: true };
      }
    });

    // Ajouter des statistiques en bas
    const lastRow = worksheet.lastRow?.number || 4;
    worksheet.addRow([]);
    
    // Calculer les statistiques uniquement sur les résolutions notées
    const notedResolutions = sortedResolutions.filter(r => r.note !== null && r.note !== undefined);
    const moyenne = notedResolutions.length > 0 
      ? (notedResolutions.reduce((sum, r) => sum + (r.note ?? 0), 0) / notedResolutions.length).toFixed(2)
      : 'N/A';
    const tauxReussite = notedResolutions.length > 0
      ? ((notedResolutions.filter(r => (r.note ?? 0) >= 10).length / notedResolutions.length) * 100).toFixed(1)
      : 'N/A';
    const noteMax = notedResolutions.length > 0
      ? Math.max(...notedResolutions.map(r => r.note ?? 0))
      : 'N/A';
    const noteMin = notedResolutions.length > 0
      ? Math.min(...notedResolutions.map(r => r.note ?? 0))
      : 'N/A';
    
    const statsRow = worksheet.addRow([
      'Statistiques:',
      '',
      `Moyenne: ${moyenne}/20`,
      '',
      `Taux de réussite: ${tauxReussite}%`,
      `Notés: ${notedResolutions.length}/${sortedResolutions.length}`,
      `Note max: ${noteMax}/20`,
      `Note min: ${noteMin}/20`
    ]);
    
    statsRow.font = { bold: true, italic: true };
    statsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' }
    };

    // Bordures pour toutes les cellules de données
    for (let i = 4; i <= worksheet.lastRow!.number; i++) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      });
    }

    // Générer le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Télécharger le fichier
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resultats_${travailTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};