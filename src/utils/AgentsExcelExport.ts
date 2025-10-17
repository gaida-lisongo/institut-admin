import * as ExcelJS from 'exceljs';
import { Personnel } from '@/types/personnel';

interface AgentsExportData {
  agents: Personnel[];
  categorie: string;
  personnel: string;
  dateExport?: string;
}

interface AgentsStats {
  total: number;
  parSexe: {
    masculin: number;
    feminin: number;
  };
  parGrade: { [key: string]: number };
  parNationalite: { [key: string]: number };
  moyenneAge: number;
  avecPhoto: number;
  sansPhoto: number;
  avecAutorisations: number;
  sansAutorisations: number;
}

class AgentsExcelExport {
  private workbook: ExcelJS.Workbook;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  /**
   * Calcule les statistiques des agents
   */
  private calculateStats(agents: Personnel[]): AgentsStats {
    const stats: AgentsStats = {
      total: agents.length,
      parSexe: { masculin: 0, feminin: 0 },
      parGrade: {},
      parNationalite: {},
      moyenneAge: 0,
      avecPhoto: 0,
      sansPhoto: 0,
      avecAutorisations: 0,
      sansAutorisations: 0
    };

    let totalAge = 0;
    let agentsAvecAge = 0;

    agents.forEach(agent => {
      // Statistiques par sexe
      if (agent.sexe === 'M') {
        stats.parSexe.masculin++;
      } else {
        stats.parSexe.feminin++;
      }

      // Statistiques par grade
      const grade = agent.grade || 'Non défini';
      stats.parGrade[grade] = (stats.parGrade[grade] || 0) + 1;

      // Statistiques par nationalité
      const nationalite = agent.nationalite || 'Non définie';
      stats.parNationalite[nationalite] = (stats.parNationalite[nationalite] || 0) + 1;

      // Calcul de l'âge
      if (agent.date_naissance) {
        const birthDate = new Date(agent.date_naissance);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        totalAge += age;
        agentsAvecAge++;
      }

      // Photo
      if (agent.photo) {
        stats.avecPhoto++;
      } else {
        stats.sansPhoto++;
      }

      // Autorisations
      if (agent.autorisations && agent.autorisations.length > 0) {
        stats.avecAutorisations++;
      } else {
        stats.sansAutorisations++;
      }
    });

    stats.moyenneAge = agentsAvecAge > 0 ? Math.round(totalAge / agentsAvecAge) : 0;

    return stats;
  }

  /**
   * Obtient le label complet d'un grade
   */
  private getGradeLabel(grade?: string): string {
    const gradeLabels: { [key: string]: string } = {
      // Grades Administratif/Ouvrier
      'AGA1': 'Agent d\'Administration de 1ère classe',
      'AGA2': 'Agent d\'Administration de 2ème classe',
      'ATA1': 'Attaché d\'Administration de 1ère classe',
      'ATA2': 'Attaché d\'Administration de 2ème classe',
      'AA1': 'Agent Auxiliaire de 1ère classe',
      'AA2': 'Agent Auxiliaire de 2ème classe',
      'CB': 'Chef de Bureau',
      'Directeur': 'Directeur',
      'CDS': 'Chef de Service',
      // Grades Scientifique
      'CPP': 'Chef des Pratiques Professionnelles',
      'ASS': 'Assistant',
      'CT': 'Chef de Travaux',
      // Grades Académique
      'P': 'Professeur',
      'PO': 'Professeur Ordinaire',
      'PA': 'Professeur Associé',
      'PE': 'Professeur Émérite'
    };

    return grade ? gradeLabels[grade] || grade : 'Non défini';
  }

  /**
   * Crée la feuille de résumé
   */
  private createSummarySheet(data: AgentsExportData, stats: AgentsStats): void {
    const worksheet = this.workbook.addWorksheet('Résumé');

    // Configuration de la page
    worksheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
    };

    // En-tête principal
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'RAPPORT D\'EXPORT DES AGENTS';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7F3FF' } };

    // Informations générales
    let row = 3;
    worksheet.getCell(`A${row}`).value = 'Catégorie:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`B${row}`).value = data.categorie;
    row++;

    worksheet.getCell(`A${row}`).value = 'Personnel:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`B${row}`).value = data.personnel;
    row++;

    worksheet.getCell(`A${row}`).value = 'Date d\'export:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`B${row}`).value = data.dateExport || new Date().toLocaleDateString('fr-FR');
    row++;

    worksheet.getCell(`A${row}`).value = 'Total agents:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`B${row}`).value = stats.total;
    worksheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FF0066CC' } };

    // Statistiques par sexe
    row += 2;
    worksheet.mergeCells(`A${row}:F${row}`);
    const sexeHeader = worksheet.getCell(`A${row}`);
    sexeHeader.value = 'RÉPARTITION PAR SEXE';
    sexeHeader.font = { bold: true, size: 12, color: { argb: 'FF1F4E79' } };
    sexeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Masculin:';
    worksheet.getCell(`B${row}`).value = stats.parSexe.masculin;
    worksheet.getCell(`C${row}`).value = `${((stats.parSexe.masculin / stats.total) * 100).toFixed(1)}%`;
    row++;

    worksheet.getCell(`A${row}`).value = 'Féminin:';
    worksheet.getCell(`B${row}`).value = stats.parSexe.feminin;
    worksheet.getCell(`C${row}`).value = `${((stats.parSexe.feminin / stats.total) * 100).toFixed(1)}%`;

    // Statistiques par grade
    row += 2;
    worksheet.mergeCells(`A${row}:F${row}`);
    const gradeHeader = worksheet.getCell(`A${row}`);
    gradeHeader.value = 'RÉPARTITION PAR GRADE';
    gradeHeader.font = { bold: true, size: 12, color: { argb: 'FF1F4E79' } };
    gradeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
    row++;

    Object.entries(stats.parGrade).forEach(([grade, count]) => {
      worksheet.getCell(`A${row}`).value = this.getGradeLabel(grade);
      worksheet.getCell(`B${row}`).value = count;
      worksheet.getCell(`C${row}`).value = `${((count / stats.total) * 100).toFixed(1)}%`;
      row++;
    });

    // Autres statistiques
    row += 1;
    worksheet.mergeCells(`A${row}:F${row}`);
    const otherHeader = worksheet.getCell(`A${row}`);
    otherHeader.value = 'AUTRES STATISTIQUES';
    otherHeader.font = { bold: true, size: 12, color: { argb: 'FF1F4E79' } };
    otherHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
    row++;

    worksheet.getCell(`A${row}`).value = 'Âge moyen:';
    worksheet.getCell(`B${row}`).value = `${stats.moyenneAge} ans`;
    row++;

    worksheet.getCell(`A${row}`).value = 'Avec photo:';
    worksheet.getCell(`B${row}`).value = stats.avecPhoto;
    worksheet.getCell(`C${row}`).value = `${((stats.avecPhoto / stats.total) * 100).toFixed(1)}%`;
    row++;

    worksheet.getCell(`A${row}`).value = 'Sans photo:';
    worksheet.getCell(`B${row}`).value = stats.sansPhoto;
    worksheet.getCell(`C${row}`).value = `${((stats.sansPhoto / stats.total) * 100).toFixed(1)}%`;
    row++;

    worksheet.getCell(`A${row}`).value = 'Avec autorisations:';
    worksheet.getCell(`B${row}`).value = stats.avecAutorisations;
    worksheet.getCell(`C${row}`).value = `${((stats.avecAutorisations / stats.total) * 100).toFixed(1)}%`;

    // Ajuster les largeurs des colonnes
    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('B').width = 15;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 15;
  }

  /**
   * Crée la feuille avec la liste détaillée des agents
   */
  private createAgentsListSheet(data: AgentsExportData): void {
    const worksheet = this.workbook.addWorksheet('Liste des Agents');

    // Configuration de la page
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
    };

    // En-tête
    const headers = [
      'Matricule',
      'Nom complet',
      'Email',
      'Téléphone',
      'Sexe',
      'Grade',
      'Niveau',
      'Nationalité',
      'Date naissance',
      'Âge',
      'Province',
      'Autorisations',
      'Photo'
    ];

    // Ajouter les en-têtes
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(1, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Ajouter les données des agents
    data.agents.forEach((agent, index) => {
      const row = index + 2;

      // Calcul de l'âge
      let age = '';
      if (agent.date_naissance) {
        const birthDate = new Date(agent.date_naissance);
        const today = new Date();
        age = (today.getFullYear() - birthDate.getFullYear()).toString();
      }

      // Province (gérer le cas où c'est un objet ou une string)
      const province = typeof agent.province === 'string' 
        ? agent.province 
        : agent.province?.designation || 'Non définie';

      // Autorisations
      const autorisations = agent.autorisations && agent.autorisations.length > 0
        ? agent.autorisations.map(auth => auth.type).join(', ')
        : 'Aucune';

      const rowData = [
        agent.matricule,
        `${agent.nom} ${agent.post_nom} ${agent.prenom}`,
        agent.email,
        agent.telephone,
        agent.sexe === 'M' ? 'Masculin' : 'Féminin',
        this.getGradeLabel(agent.grade),
        agent.niveau || 'Non défini',
        agent.nationalite,
        agent.date_naissance ? new Date(agent.date_naissance).toLocaleDateString('fr-FR') : '',
        age,
        province,
        autorisations,
        agent.photo ? 'Oui' : 'Non'
      ];

      rowData.forEach((value, colIndex) => {
        const cell = worksheet.getCell(row, colIndex + 1);
        cell.value = value;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Alternance de couleurs pour les lignes
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
      });
    });

    // Ajuster les largeurs des colonnes
    const columnWidths = [12, 25, 25, 15, 10, 30, 15, 15, 12, 8, 15, 20, 8];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Figer la première ligne
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  /**
   * Génère le fichier Excel complet
   */
  public async generateAgentsExport(data: AgentsExportData): Promise<Buffer> {
    // Réinitialiser le workbook
    this.workbook = new ExcelJS.Workbook();

    // Métadonnées du workbook
    this.workbook.creator = 'Institut Admin';
    this.workbook.lastModifiedBy = 'Institut Admin';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();

    // Calculer les statistiques
    const stats = this.calculateStats(data.agents);

    // Créer les feuilles
    this.createSummarySheet(data, stats);
    this.createAgentsListSheet(data);

    // Générer le buffer
    const buffer = await this.workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  /**
   * Télécharge directement le fichier Excel
   */
  public static async downloadAgentsExport(
    agents: Personnel[],
    categorie: string,
    personnel: string,
    filename?: string
  ): Promise<void> {
    try {
      const exporter = new AgentsExcelExport();
      
      const data: AgentsExportData = {
        agents,
        categorie,
        personnel,
        dateExport: new Date().toLocaleDateString('fr-FR')
      };

      const buffer = await exporter.generateAgentsExport(data);

      // Créer le nom de fichier
      const defaultFilename = `Agents_${categorie}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const finalFilename = filename || defaultFilename;

      // Créer et télécharger le fichier
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Export Excel généré: ${finalFilename}`);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      throw error;
    }
  }
}

export default AgentsExcelExport;
