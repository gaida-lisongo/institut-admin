import ExcelJS from 'exceljs';

// Type fix for ExcelJS alignment and border properties
type CellAlignment = {
  horizontal?: 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
  vertical?: 'top' | 'middle' | 'bottom' | 'distributed' | 'justify';
  wrapText?: boolean;
  shrinkToFit?: boolean;
  indent?: number;
  readingOrder?: 'rtl' | 'ltr';
  textRotation?: number;
};

// Interfaces pour les types de données
interface UniteEnseignement {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  evaluations?: {
    code: string;
    designation: string;
    ponderation: number;
  }[];
  cours?: {
    titre: string;
    coursId: string;
    credit: number;
  }[];
}

interface Etudiant {
  _id: string;
  nom: string;
  postnom: string;
  prenom: string;
  matricule: string;
  notes?: {
    [uniteId: string]: {
      [evaluationCode: string]: number | string;
    };
  };
}

interface SemestreData {
  _id: string;
  designation: string;
  unites: UniteEnseignement[];
  etudiants: Etudiant[];
}

interface ClasseData {
  _id: string;
  designation: string;
  semestre1?: SemestreData;
  semestre2?: SemestreData;
}

interface GrilleDocumentData {
  classe: ClasseData;
  semestre?: SemestreData;
  anneeAcademique: string;
}

class GrilleDocument {
  private workbook: ExcelJS.Workbook;
  public semestre: SemestreData | {} = {};

  constructor() {
    this.semestre = {};
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Institut Admin System';
    this.workbook.created = new Date();
  }

  /**
   * Génère une grille de délibération complète avec 3 feuilles
   * @param data Données de la classe et des semestres
   * @returns Buffer du fichier Excel
   */
  async generateGrilleDeliberation(data: GrilleDocumentData): Promise<Buffer> {
    // Réinitialiser le workbook
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Institut Admin System';
    this.workbook.created = new Date();

    // Créer les feuilles selon les semestres disponibles
    if (data.classe.semestre1) {
      await this.createSemestreSheet(data.classe.semestre1, data.classe, data.anneeAcademique, 1);
    }

    if (data.classe.semestre2) {
      await this.createSemestreSheet(data.classe.semestre2, data.classe, data.anneeAcademique, 2);
    }

    // Créer la feuille combinée si les deux semestres existent
    if (data.classe.semestre1 && data.classe.semestre2) {
      await this.createCombinedSheet(data.classe, data.anneeAcademique);
    }

    // Retourner le buffer du fichier Excel
    const buffer = await this.workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  /**
   * Crée une feuille pour un semestre spécifique
   */
  private async createSemestreSheet(
    semestre: SemestreData, 
    classe: ClasseData, 
    anneeAcademique: string, 
    semestreNum: number
  ): Promise<void> {
    const worksheet = this.workbook.addWorksheet(`Semestre ${semestreNum}`);

    // Configuration de base de la feuille
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    let currentRow = 1;

    // En-tête du document
    currentRow = this.addDocumentHeader(worksheet, classe, semestre, anneeAcademique, currentRow);

    // Espacement
    currentRow += 2;

    // Créer l'en-tête du tableau avec les unités d'enseignement
    currentRow = this.createTableHeader(worksheet, semestre.unites, currentRow);

    // Ajouter les lignes d'étudiants
    currentRow = this.addStudentRows(worksheet, semestre.etudiants, semestre.unites, currentRow);

    // Appliquer le formatage final
    this.applyFinalFormatting(worksheet, semestre.unites.length, currentRow);
  }

  /**
   * Crée la feuille combinée pour les deux semestres
   */
  private async createCombinedSheet(classe: ClasseData, anneeAcademique: string): Promise<void> {
    const worksheet = this.workbook.addWorksheet('Année Complète');

    // Configuration de base
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    let currentRow = 1;

    // En-tête pour l'année complète
    worksheet.mergeCells(`A${currentRow}:P${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `GRILLE DE DÉLIBÉRATION - ANNÉE COMPLÈTE`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:P${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Classe: ${classe.designation} | Année Académique: ${anneeAcademique}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow += 3;

    // Combiner les unités des deux semestres
    const allUnites = [
      ...(classe.semestre1?.unites || []),
      ...(classe.semestre2?.unites || [])
    ];

    // Créer l'en-tête combiné
    currentRow = this.createTableHeader(worksheet, allUnites, currentRow);

    // Combiner les étudiants (en supposant qu'ils sont les mêmes dans les deux semestres)
    const etudiants = classe.semestre1?.etudiants || classe.semestre2?.etudiants || [];
    
    // Ajouter les lignes d'étudiants avec les notes des deux semestres
    currentRow = this.addCombinedStudentRows(worksheet, etudiants, allUnites, classe, currentRow);

    // Appliquer le formatage final
    this.applyFinalFormatting(worksheet, allUnites.length, currentRow);
  }

  /**
   * Ajoute l'en-tête du document
   */
  private addDocumentHeader(
    worksheet: ExcelJS.Worksheet, 
    classe: ClasseData, 
    semestre: SemestreData, 
    anneeAcademique: string, 
    startRow: number
  ): number {
    let currentRow = startRow;

    // Titre principal
    worksheet.mergeCells(`A${currentRow}:P${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'GRILLE DE DÉLIBÉRATION';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    // Informations de la classe et du semestre
    worksheet.mergeCells(`A${currentRow}:P${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Classe: ${classe.designation} | Semestre: ${semestre.designation} | Année: ${anneeAcademique}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    return currentRow;
  }

  /**
   * Crée l'en-tête du tableau avec les codes des unités d'enseignement
   */
  private createTableHeader(
    worksheet: ExcelJS.Worksheet, 
    unites: UniteEnseignement[], 
    startRow: number
  ): number {
    let currentRow = startRow;
    let currentCol = 3; // Commencer à la colonne B (après "Étudiant")

    // Première ligne : Codes des UE
    worksheet.getCell(currentRow, 1).value = '';
    
    unites.forEach((unite) => {
      const evaluations = unite.cours || [
        { coursId: 'EC1', titre: 'Évaluation Continue 1', credit: 30 },
        { coursId: 'EC2', titre: 'Évaluation Continue 2', credit: 30 },
        { coursId: 'Moy', titre: 'Moyenne', credit: 40 }
      ];

      // Fusionner les cellules pour le code de l'UE
      const startCol = currentCol;
      const endCol = currentCol + evaluations.length + 1;
      
      worksheet.mergeCells(currentRow, startCol, currentRow, endCol);
      worksheet.getCell(currentRow, startCol).value = unite.code;
      worksheet.getCell(currentRow, startCol).font = { bold: true };
      worksheet.getCell(currentRow, startCol).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      worksheet.getCell(currentRow, startCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      currentCol = endCol + 1;
    });

    // Colonnes finales
    const finalCols = ['Total Obtenu', 'Pourcentage', 'NCV', 'NCNV', 'Appréciation', 'Decision du Jury'];
    const totalCredit = unites.reduce((total, unite) => total + unite.credit, 0);
    const totalPond = totalCredit * 20;
    finalCols.forEach((col, index) => {
      worksheet.mergeCells(currentRow, currentCol, currentRow + (index >= 4 ? 2 : 1), currentCol);
      worksheet.getCell(currentRow, currentCol).value = col;
      worksheet.getCell(currentRow, currentCol).font = { bold: true };
      if (index === 0) {
        worksheet.getCell(currentRow+2, currentCol).value = totalPond;
        worksheet.getCell(currentRow+2, currentCol).font = { bold: true };
        worksheet.getCell(currentRow+2, currentCol).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
        worksheet.getCell(currentRow+2, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      } else if (index === 1) {
        worksheet.getCell(currentRow+2, currentCol).value = "100%";
        worksheet.getCell(currentRow+2, currentCol).font = { bold: true };
        worksheet.getCell(currentRow+2, currentCol).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
        worksheet.getCell(currentRow+2, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      } else if(index === 2) {
        worksheet.mergeCells(currentRow+2, currentCol, currentRow + 2, currentCol+1);
        worksheet.getCell(currentRow+2, currentCol).font = { bold: true };
        worksheet.getCell(currentRow+2, currentCol).value = totalCredit;
        worksheet.getCell(currentRow+2, currentCol).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
        worksheet.getCell(currentRow+2, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      worksheet.getCell(currentRow, currentCol).alignment = { 
        horizontal: 'center', 
        vertical: 'middle', 
        textRotation: 90 
      } as CellAlignment;
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;
    });

    currentRow++;

    // Deuxième ligne : Sous-colonnes (EC1, EC2, Moy, Dec)
    currentCol = 3;
    worksheet.getCell(currentRow, 1).value = '';

    unites.forEach((unite) => {
      console.log("Current Unite Document", unite);
      const evaluations = unite.cours || [
        { coursId: 'EC1', titre: 'Évaluation Continue 1', credit: 30 },
        { coursId: 'EC2', titre: 'Évaluation Continue 2', credit: 30 },
        { coursId: 'Moy', titre: 'Moyenne', credit: 40 }
      ];

      evaluations.forEach((evaluation) => {
        worksheet.getCell(currentRow, currentCol).value = evaluation.titre;
        worksheet.getCell(currentRow, currentCol).font = { bold: true, size: 10 };
        worksheet.getCell(currentRow, currentCol).alignment = { 
            horizontal: 'center', 
            vertical: 'middle',
            textRotation: 90 
        } as CellAlignment;
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        worksheet.getCell(currentRow+1, currentCol).value = evaluation.credit;
        worksheet.getCell(currentRow+1, currentCol).font = { bold: true };
        worksheet.getCell(currentRow+1, currentCol).alignment = { 
            horizontal: 'center', 
            vertical: 'middle'
        } as CellAlignment;
        worksheet.getCell(currentRow+1, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
      });

      worksheet.getCell(currentRow, currentCol).value = 'Moyenne UE';
      worksheet.getCell(currentRow+1, currentCol).value = unite.credit;
      worksheet.getCell(currentRow+1, currentCol).font = { bold: true };
      worksheet.getCell(currentRow+1, currentCol).alignment = { 
        horizontal: 'center', 
        vertical: 'middle'
      } as CellAlignment;
      worksheet.getCell(currentRow+1, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      worksheet.getCell(currentRow, currentCol).font = { bold: true };
      worksheet.getCell(currentRow, currentCol).alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        textRotation: 90
      };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      // Colonne Décision
      worksheet.mergeCells(currentRow, currentCol, currentRow+1, currentCol);
      worksheet.getCell(currentRow, currentCol).value = 'Decision UE';
      worksheet.getCell(currentRow, currentCol).font = { bold: true };
      worksheet.getCell(currentRow, currentCol).alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        textRotation: 90
      };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;
    });

    // // Colonnes finales (vides pour cette ligne)
    // for (let i = 0; i < 4; i++) {
    //   worksheet.getCell(currentRow, currentCol).value = '';
    //   worksheet.getCell(currentRow, currentCol).border = {
    //     top: { style: 'thin' },
    //     left: { style: 'thin' },
    //     bottom: { style: 'thin' },
    //     right: { style: 'thin' }
    //   };
    //   currentCol++;
    // }

    currentRow++;

    // Troisième ligne : En-tête "Étudiant"
    worksheet.getCell(currentRow, 1).value = 'N°';
    worksheet.getCell(currentRow, 2).value = 'Étudiant';
    [1,2].forEach((col) => {
      worksheet.getCell(currentRow, col).font = { bold: true };
      worksheet.getCell(currentRow, col).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Ligne de séparation
    for (let col = 3; col < currentCol; col++) {
      worksheet.getCell(currentRow, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }

    currentRow++;
    return currentRow;
  }

  /**
   * Ajoute les lignes des étudiants avec leurs notes
   */
  private addStudentRows(
    worksheet: ExcelJS.Worksheet, 
    etudiants: Etudiant[], 
    unites: UniteEnseignement[], 
    startRow: number
  ): number {
    let currentRow = startRow;

    etudiants.forEach((etudiant, n) => {
      let currentCol = 1;

      // Nom de l'étudiant
      worksheet.getCell(currentRow, currentCol).value = n + 1;
      worksheet.getCell(currentRow, currentCol+1).value = `${etudiant.nom} ${etudiant.postnom} ${etudiant.prenom}`;
      [currentCol, currentCol+1].forEach((col) => {
        worksheet.getCell(currentRow, col).alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getCell(currentRow, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentCol += 2;

      // Notes pour chaque unité
      unites.forEach((unite) => {
        const evaluations = unite.cours || [
          { coursId: 'EC1', titre: 'Évaluation Continue 1', credit: 30 },
          { coursId: 'EC2', titre: 'Évaluation Continue 2', credit: 30 },
        ];

        evaluations.forEach((evaluation) => {
          const note = etudiant.notes?.[unite._id]?.[evaluation.coursId] || '';
          worksheet.getCell(currentRow, currentCol).value = note;
          worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
          worksheet.getCell(currentRow, currentCol).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          currentCol++;
        });

        // Colonne Décision
        worksheet.getCell(currentRow, currentCol).value = '';
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
      });

      // Colonnes finales (Total, NCV, NCNV, Capitalisation)
      for (let i = 0; i < 4; i++) {
        worksheet.getCell(currentRow, currentCol).value = '';
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
      }

      currentRow++;
    });

    return currentRow;
  }

  /**
   * Ajoute les lignes des étudiants pour la feuille combinée
   */
  private addCombinedStudentRows(
    worksheet: ExcelJS.Worksheet, 
    etudiants: Etudiant[], 
    allUnites: UniteEnseignement[], 
    classe: ClasseData,
    startRow: number
  ): number {
    let currentRow = startRow;

    etudiants.forEach((etudiant) => {
      let currentCol = 1;

      // Nom de l'étudiant
      worksheet.getCell(currentRow, currentCol).value = `${etudiant.nom} ${etudiant.postnom} ${etudiant.prenom}`;
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      // Notes pour toutes les unités (semestre 1 + semestre 2)
      allUnites.forEach((unite) => {
        const evaluations = unite.evaluations || [
          { code: 'EC1', designation: 'Évaluation Continue 1', ponderation: 30 },
          { code: 'EC2', designation: 'Évaluation Continue 2', ponderation: 30 },
          { code: 'Moy', designation: 'Moyenne', ponderation: 40 }
        ];

        evaluations.forEach((evaluation) => {
          // Chercher la note dans les deux semestres
          let note: string | number = '';
          
          // Chercher d'abord dans semestre 1
          const etudiantS1 = classe.semestre1?.etudiants.find(e => e._id === etudiant._id);
          if (etudiantS1?.notes?.[unite._id]?.[evaluation.code]) {
            note = etudiantS1.notes[unite._id][evaluation.code];
          } else {
            // Chercher dans semestre 2
            const etudiantS2 = classe.semestre2?.etudiants.find(e => e._id === etudiant._id);
            if (etudiantS2?.notes?.[unite._id]?.[evaluation.code]) {
              note = etudiantS2.notes[unite._id][evaluation.code];
            }
          }

          worksheet.getCell(currentRow, currentCol).value = note;
          worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
          worksheet.getCell(currentRow, currentCol).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          currentCol++;
        });

        // Colonne Décision
        worksheet.getCell(currentRow, currentCol).value = '';
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
      });

      // Colonnes finales
      for (let i = 0; i < 4; i++) {
        worksheet.getCell(currentRow, currentCol).value = '';
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
      }

      currentRow++;
    });

    return currentRow;
  }

  /**
   * Applique le formatage final à la feuille
   */
  private applyFinalFormatting(worksheet: ExcelJS.Worksheet, unitesCount: number, lastRow: number): void {
    // Ajuster la largeur des colonnes
    worksheet.getColumn(1).width = 5; // Colonne numéro étudiant
    worksheet.getColumn(2).width = 12*3; // Colonne étudiant plus large

    // Colonnes des notes plus étroites
    for (let col = 3; col <= (unitesCount * 4) + 5; col++) {
      worksheet.getColumn(col).width = 8;
    }

    // Figer les volets (première colonne et les 3 premières lignes)
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 2,
        ySplit: 3
      }
    ];

    // Ajuster la hauteur des lignes d'en-tête
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 25;
    worksheet.getRow(3).height = 20;
    worksheet.getRow(6).height = 12*9;
    //La ligne 6 (Elments constitutifs des UE) doit admettre des retours à la ligne
    worksheet.getRow(6).eachCell((cell) => {
      
      cell.alignment = { 
        ...cell.alignment, 
        wrapText: true 
      };
    });
  }

  /**
   * Génère et télécharge le fichier Excel
   */
  async downloadGrille(data: GrilleDocumentData, filename?: string): Promise<void> {
    const buffer = await this.generateGrilleDeliberation(data);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `grille_deliberation_${data.classe.designation}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new GrilleDocument();
