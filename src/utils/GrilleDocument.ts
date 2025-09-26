import ExcelJS from 'exceljs';
import { calculerResultatsEtudiant } from './calculateurs/notesCalculateur';
import { SessionType } from '@/types/juryClasseDetail';

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
    [uniteId: string]: Array<{ ecue: string; note: number }>;
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
  sessionType?: SessionType;
}

interface EtudiantPalmaresse {
  nom: string;
  postnom: string;
  prenom: string;
  pourcentage: number;
  ncv: number;
  ncnv: number;
  appreciation: string;
  decision: string;
}

class GrilleDocument {
  private workbook: ExcelJS.Workbook;
  public semestre: SemestreData | {} = {};
  public jury: any = {};
  public sessionType: SessionType = 'principale';

  constructor() {
    this.semestre = {};
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Institut Admin System';
    this.workbook.created = new Date();
    this.jury = {};
    this.sessionType = 'principale';
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
      await this.createSemestreSheet(data.classe.semestre1, data.classe, data.anneeAcademique, 1, data.sessionType);
    }

    if (data.classe.semestre2) {
      await this.createSemestreSheet(data.classe.semestre2, data.classe, data.anneeAcademique, 2, data.sessionType);
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
    semestreNum: number,
    sessionType: SessionType = 'principale'
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

    // Calculer le nombre de colonnes pour les en-têtes
    let totalCols = 2; // Colonnes pour numéro et nom étudiant
    (semestre.unites || []).forEach((unite) => {
      const evaluations = unite.cours?.length || 0;
      totalCols += evaluations + 2; // +2 pour moyenne et validation (V/NV)
    });
    totalCols += 6; // Colonnes finales: Total, Pourcentage, NCV, NCNV, Appréciation, Décision

    // En-tête du document
    currentRow = this.addDocumentHeader(worksheet, classe, semestre, anneeAcademique, currentRow, totalCols);

    // Espacement
    currentRow += 2;

    // Debug: vérifier les données du semestre
    console.log("=== DEBUG GRILLE DOCUMENT ===");
    console.log("Semestre:", semestre);
    console.log("Semestre.unites:", semestre.unites);
    console.log("Nombre d'unités:", semestre.unites?.length || 0);
    console.log("Semestre.etudiants:", semestre.etudiants?.length || 0);

    // Créer l'en-tête du tableau avec les unités d'enseignement
    currentRow = this.createTableHeader(worksheet, semestre.unites || [], currentRow, sessionType);

    // Ajouter les lignes d'étudiants
    const { currentRow: newCurrentRow, lastCol } = this.addStudentRows(worksheet, semestre.etudiants || [], semestre.unites || [], currentRow, sessionType);

    // Appliquer le formatage final
    this.applyFinalFormatting(worksheet, semestre.unites.length, newCurrentRow, lastCol);
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

    // Combiner les unités des deux semestres pour calculer le nombre de colonnes
    const allUnites = [
      ...(classe.semestre1?.unites || []),
      ...(classe.semestre2?.unites || [])
    ];

    // Calculer le nombre total de colonnes nécessaires
    let totalCols = 2; // Colonnes pour numéro et nom étudiant
    allUnites.forEach((unite) => {
      const evaluations = unite.cours?.length || 0;
      totalCols += evaluations + 2; // +2 pour moyenne et validation (V/NV)
    });
    totalCols += 6; // Colonnes finales: Total, Pourcentage, NCV, NCNV, Appréciation, Décision

    // Convertir le nombre de colonnes en lettre Excel
    const lastColLetter = this.numberToColumnLetter(totalCols);

    // En-tête pour l'année complète
    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `GRILLE DE DÉLIBÉRATION - ANNÉE COMPLÈTE`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Classe: ${classe.designation} | Année Académique: ${anneeAcademique}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow += 3;

    // Créer l'en-tête combiné
    currentRow = this.createTableHeader(worksheet, allUnites, currentRow);

    // Combiner les étudiants (en supposant qu'ils sont les mêmes dans les deux semestres)
    const etudiants = classe.semestre1?.etudiants || classe.semestre2?.etudiants || [];
    
    // Ajouter les lignes d'étudiants avec les notes des deux semestres
    // Pour l'instant, utiliser les étudiants du premier semestre disponible
    // TODO: Implémenter la logique de fusion des notes des deux semestres
    const { currentRow: newCurrentRow, lastCol } = this.addStudentRows(worksheet, etudiants, allUnites, currentRow, 'principale');
    currentRow = newCurrentRow;

    // Appliquer le formatage final
    this.applyFinalFormatting(worksheet, allUnites.length, currentRow, lastCol);
  }

  /**
   * Convertit un numéro de colonne en lettre Excel (1=A, 2=B, ..., 26=Z, 27=AA, etc.)
   */
  private numberToColumnLetter(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  /**
   * Ajoute l'en-tête du document
   */
  private addDocumentHeader(
    worksheet: ExcelJS.Worksheet, 
    classe: ClasseData, 
    semestre: SemestreData, 
    anneeAcademique: string, 
    startRow: number,
    totalCols: number
  ): number {
    let currentRow = startRow;
    const lastColLetter = this.numberToColumnLetter(totalCols);

    // Titre principal
    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'GRILLE DE DÉLIBÉRATION';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    // Informations de la classe et du semestre
    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
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
    startRow: number,
    sessionType: SessionType = 'principale'
  ): number {
    let currentRow = startRow;
    let currentCol = 3; // Commencer à la colonne B (après "Étudiant")

    // Première ligne : Codes des UE
    worksheet.getCell(currentRow, 1).value = '';
    
    console.log("Unites dans createTableHeader:", unites);
    
    unites.forEach((unite) => {
      let evaluations: any[] = unite.cours?.map(cours => ({
        coursId: cours.coursId,
        titre: cours.titre,
        credit: cours.credit
      })) || [];
      
      // if (sessionType === 'principale') {
      //   evaluations = [
      //     { coursId: 'CMI', titre: 'CMI', credit: 50 },
      //     { coursId: 'EXAMEN', titre: 'Examen', credit: 50 },
      //     { coursId: 'MOY', titre: 'Moyenne', credit: 100 }
      //   ];
      // } else if (sessionType === 'rattrapage') {
      //   evaluations = [
      //     { coursId: 'RATT', titre: 'Rattrapage', credit: 100 }
      //   ];
      // } else if (sessionType === 'annuelle') {
      //   evaluations = [
      //     { coursId: 'BEST', titre: 'Meilleure Note', credit: 100 }
      //   ];
      // }
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

      // Colonne Décision UE
      // worksheet.getCell(currentRow, endCol + 1).value = 'Décision UE';
      // worksheet.getCell(currentRow, endCol + 1).font = { bold: true };
      // worksheet.getCell(currentRow, endCol + 1).alignment = { 
      //   horizontal: 'center', 
      //   vertical: 'middle',
      //   textRotation: 90
      // } as CellAlignment;
      // worksheet.getCell(currentRow, endCol + 1).border = {
      //   top: { style: 'thin' },
      //   left: { style: 'thin' },
      //   bottom: { style: 'thin' },
      //   right: { style: 'thin' }
      // };

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

    // Deuxième ligne : Sous-colonnes selon le type de session
    currentCol = 3;
    worksheet.getCell(currentRow, 1).value = '';

    unites.forEach((unite) => {
      console.log("Current Unite Document", unite);
      let evaluations: any[] = unite.cours?.map(cours => ({
        coursId: cours.coursId,
        titre: cours.titre,
        credit: cours.credit
      })) || [];
      
      // if (sessionType === 'principale') {
      //   evaluations = [
      //     { coursId: 'CMI', titre: 'CMI', credit: 50 },
      //     { coursId: 'EXAMEN', titre: 'Examen', credit: 50 },
      //     { coursId: 'MOY', titre: 'Moyenne', credit: 100 }
      //   ];
      // } else if (sessionType === 'rattrapage') {
      //   evaluations = [
      //     { coursId: 'RATT', titre: 'Rattrapage', credit: 100 }
      //   ];
      // } else if (sessionType === 'annuelle') {
      //   evaluations = [
      //     { coursId: 'BEST', titre: 'Meilleure Note', credit: 100 }
      //   ];
      // }

      evaluations && evaluations.forEach((evaluation) => {
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

      // Colonne Décision UE (déjà créée dans la première ligne)
      worksheet.getCell(currentRow, currentCol).value = 'Tota UE';
      worksheet.getCell(currentRow + 1, currentCol).value = unite.credit;
      worksheet.getCell(currentRow, currentCol).font = { bold: true };
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
      worksheet.getCell(currentRow, currentCol).value = 'Decision UE';
      worksheet.getCell(currentRow, currentCol).font = { bold: true };
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
   * Ajoute les lignes des étudiants avec leurs notes et calculs
   */
  private addStudentRows(
    worksheet: ExcelJS.Worksheet, 
    etudiants: Etudiant[], 
    unites: UniteEnseignement[], 
    startRow: number,
    sessionType: SessionType = 'principale'
  ): { currentRow: number, lastCol: number } {
    let currentRow = startRow;
    let lastCol = 0;
    etudiants.forEach((etudiant, n) => {
      let currentCol = 1;
      let ncv = 0;
      let ncnv = 0;
      let totalObtenue = 0;
      let maxSemestre = 0;
      let showPourcentage = true;
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
        let moy = 0;
        maxSemestre += 20 * unite.credit;
        unite.cours?.forEach((cours) => {
          const uniteNotes: Array<{ ecue: string; note: number }> = etudiant.notes?.[unite._id] || [];
          
          if (uniteNotes?.length > 0) {
            const noteValue = uniteNotes.find((note: { ecue: string; note: number }) => note.ecue === cours.coursId);
            
            if (noteValue && !isNaN(noteValue.note)) {
              moy += unite.credit ? (noteValue.note * cours.credit) / unite.credit : 0;
              worksheet.getCell(currentRow, currentCol).value = noteValue.note;
              worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
              worksheet.getCell(currentRow, currentCol).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
            currentCol++;
          } else {
            showPourcentage = false;
            worksheet.getCell(currentRow, currentCol).value = 'X';
            worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getCell(currentRow, currentCol).border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            currentCol++;
          }
        });
        worksheet.getCell(currentRow, currentCol).value = moy.toFixed(2);
        worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Colorer la moyenne selon sa valeur
        if (moy >= 16) {
          worksheet.getCell(currentRow, currentCol).font = { color: { argb: 'FF006400' }, bold: true }; // Vert foncé pour excellent
        } else if (moy >= 14) {
          worksheet.getCell(currentRow, currentCol).font = { color: { argb: 'FF228B22' } }; // Vert pour très bien
        } else if (moy >= 12) {
          worksheet.getCell(currentRow, currentCol).font = { color: { argb: 'FF32CD32' } }; // Vert lime pour bien
        } else if (moy >= 10) {
          worksheet.getCell(currentRow, currentCol).font = { color: { argb: 'FFFFA500' } }; // Orange pour passable
        } else {
          worksheet.getCell(currentRow, currentCol).font = { color: { argb: 'FFDC143C' } }; // Rouge pour échec
        }
        
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        currentCol++;
        const isValidated = moy > 10;
        worksheet.getCell(currentRow, currentCol).value = isValidated ? 'V' : 'NV';
        worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(currentRow, currentCol).font = { 
          bold: true, 
          color: { argb: isValidated ? 'FF008000' : 'FFFF0000' } // Vert pour V, Rouge pour NV
        };
        worksheet.getCell(currentRow, currentCol).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isValidated ? 'FFE8F5E8' : 'FFFFEAEA' } // Fond vert clair pour V, fond rouge clair pour NV
        };
        worksheet.getCell(currentRow, currentCol).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        ncv += moy > 10 ? unite.credit : 0;
        ncnv += moy > 10 ? 0 : unite.credit;
        totalObtenue += moy;
        currentCol++;
      });

      worksheet.getCell(currentRow, currentCol).value = showPourcentage ? totalObtenue.toFixed(2) : 'X';
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;
      const pourcentage: number = maxSemestre ? (totalObtenue / maxSemestre) * 100 : 0.0;
      worksheet.getCell(currentRow, currentCol).value = showPourcentage ? `${pourcentage.toFixed(2)} %` : 'X';
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      worksheet.getCell(currentRow, currentCol).value = ncv;
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      worksheet.getCell(currentRow, currentCol).value = ncnv;
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      let appreciation = '';
      let decision = '';

      if (pourcentage >= 90) {
        appreciation = 'A';
      } else if (pourcentage >= 80) {
        appreciation = 'B';
      } else if (pourcentage >= 70) {
        appreciation = 'C';
      } else if (pourcentage >= 60) {
        appreciation = 'D';
      } else if (pourcentage >= 50) {
        appreciation = 'E';
      } else {
        appreciation = 'G';
      }

      // Définir les couleurs selon l'appréciation
      let appreciationColor = 'FF000000'; // Noir par défaut
      let appreciationBgColor = 'FFFFFFFF'; // Blanc par défaut
      
      switch (appreciation) {
        case 'A': // Excellent (≥90%)
          appreciationColor = 'FF006400'; // Vert foncé
          appreciationBgColor = 'FFE6FFE6'; // Vert très clair
          break;
        case 'B': // Très bien (≥80%)
          appreciationColor = 'FF228B22'; // Vert
          appreciationBgColor = 'FFF0FFF0'; // Vert clair
          break;
        case 'C': // Bien (≥70%)
          appreciationColor = 'FF32CD32'; // Vert lime
          appreciationBgColor = 'FFF5FFFA'; // Vert menthe
          break;
        case 'D': // Assez bien (≥60%)
          appreciationColor = 'FFFFA500'; // Orange
          appreciationBgColor = 'FFFFF8DC'; // Orange clair
          break;
        case 'E': // Passable (≥50%)
          appreciationColor = 'FFFF8C00'; // Orange foncé
          appreciationBgColor = 'FFFFEFD5'; // Orange très clair
          break;
        case 'G': // Médiocre (<50%)
          appreciationColor = 'FFDC143C'; // Rouge
          appreciationBgColor = 'FFFFEAEA'; // Rouge clair
          break;
      }
      
      worksheet.getCell(currentRow, currentCol).value = appreciation;
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).font = { 
        bold: true, 
        color: { argb: appreciationColor }
      };
      worksheet.getCell(currentRow, currentCol).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: appreciationBgColor }
      };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      currentCol++;

      try {
        if (ncv * 100/(ncv + ncnv) >= 60) {
          decision = 'Passe';
        } else {
          decision = 'Double';
        }
      } catch (error) {
        console.error("Error calculating decision:", error);
        decision = 'Double';
      }

      const isPassed = decision === 'Passe';
      worksheet.getCell(currentRow, currentCol).value = decision;
      worksheet.getCell(currentRow, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(currentRow, currentCol).font = { 
        bold: true, 
        color: { argb: isPassed ? 'FF008000' : 'FFFF0000' } // Vert pour Passe, Rouge pour Double
      };
      worksheet.getCell(currentRow, currentCol).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isPassed ? 'FFE8F5E8' : 'FFFFEAEA' } // Fond vert clair pour Passe, fond rouge clair pour Double
      };
      worksheet.getCell(currentRow, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      lastCol = currentCol;
      currentRow++;
    });

    return {
      currentRow,
      lastCol
    };
  }

  private addLegende(worksheet: ExcelJS.Worksheet): void {
    const row = 5;
    const col = 1;
    worksheet.getCell(row, col).value = "Legende";
    worksheet.mergeCells(row, col, row, col + 1);
    worksheet.getCell(row, col).font = { bold: true };
    worksheet.getCell(row, col).alignment = { horizontal: 'center', vertical: 'middle' };

    const legendes = [
      {mention: "A", designation: "Excellent", crite: "X >= 90%"},
      {mention: "B", designation: "Très bien", crite: "X >= 80%"},
      {mention: "C", designation: "Bien", crite: "X >= 70%"},
      {mention: "D", designation: "Assez bien", crite: "X >= 60%"},
      {mention: "E", designation: "Passable", crite: "X >= 50%"},
      {mention: "G", designation: "Médiocre", crite: "X < 50%"},
    ];

    let legendeToStr = legendes.map((legende) => {
      return `${legende.mention} : ${legende.designation} (${legende.crite})`;
    }).join("\r\n");

    worksheet.getCell(row + 1, col+1).value = legendeToStr;
    worksheet.getCell(row + 1, col+1).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    //Text wrap
  }

  private addFooter(worksheet: ExcelJS.Worksheet, lastRow: number, lastCol: number): void {
    let row = lastRow + 2;
    const col = 1;
    
    const headerContresigns = [
      "N°",
      "Membre",
      "Contre-signature"
    ];

    // Calculer la position de la signature pour éviter les conflits
    const colSignature = lastCol - 7;
    
    headerContresigns.forEach((header, index) => {
      const currentCol = col + index;
      
      // Éviter de fusionner si cela entre en conflit avec la zone de signature
      if (index == 2 && currentCol + 2 < colSignature) {
        worksheet.mergeCells(row, currentCol, row, currentCol + 2);
      }
      
      worksheet.getCell(row, currentCol).value = header;
      worksheet.getCell(row, currentCol).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(row, currentCol).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Fusionner seulement si la zone n'est pas déjà occupée
    if (colSignature > col + headerContresigns.length) {
      worksheet.mergeCells(row, colSignature, row, lastCol);
    }

    worksheet.getCell(row, colSignature).value = "Fait à Kinshasa, le " + new Date().toLocaleDateString();
    worksheet.getCell(row, colSignature).alignment = { horizontal: 'center', vertical: 'middle' };

    row += 2;
    if (this.sessionType == 'annuelle') return;

    const headerSignatures = [
      'Fonction',
      'Nom',
      'Signature'
    ]

    // En-tête Fonction (2 colonnes)
    worksheet.getCell(row, colSignature).value = headerSignatures[0];
    worksheet.mergeCells(row, colSignature, row, colSignature + 1);
    worksheet.getCell(row, colSignature).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(row, colSignature).font = { bold: true };
    
    // En-tête Nom (3 colonnes)
    worksheet.getCell(row, colSignature + 2).value = headerSignatures[1];
    worksheet.mergeCells(row, colSignature + 2, row, colSignature + 4);
    worksheet.getCell(row, colSignature + 2).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(row, colSignature + 2).font = { bold: true };
    
    // En-tête Signature (3 colonnes)
    worksheet.getCell(row, colSignature + 5).value = headerSignatures[2];
    worksheet.mergeCells(row, colSignature + 5, row, colSignature + 7);
    worksheet.getCell(row, colSignature + 5).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(row, colSignature + 5).font = { bold: true };

    row++;

    const members = this.jury?.bureau.map((member: {fonction: string, agent: {nom: string, post_nom: string, prenom?: string, titre?: string}}) =>{
      return {
        fonction: member.fonction,
        nom: `${member.agent.titre} ${member.agent.nom} ${member.agent.post_nom} ${member.agent.prenom}`,
      }
    }) || [];

    members && members.forEach((member: {fonction: string, nom: string}, index: number) => {
      const currentRow = row + index;
      
      // Colonne Fonction (fusionnée sur 2 colonnes)
      worksheet.getCell(currentRow, colSignature).value = member.fonction;
      worksheet.mergeCells(currentRow, colSignature, currentRow, colSignature + 1);
      worksheet.getCell(currentRow, colSignature).alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Colonne Nom (fusionnée sur 3 colonnes)
      worksheet.getCell(currentRow, colSignature + 2).value = member.nom;
      worksheet.mergeCells(currentRow, colSignature + 2, currentRow, colSignature + 4);
      worksheet.getCell(currentRow, colSignature + 2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      //la cellule nom doit avoire une hauteur considérable
      worksheet.getRow(currentRow).height = 30;
      
      // Colonne Signature (fusionnée sur 3 colonnes)
      worksheet.getCell(currentRow, colSignature + 5).value = "__________________________";
      worksheet.mergeCells(currentRow, colSignature + 5, currentRow, colSignature + 7);
      worksheet.getCell(currentRow, colSignature + 5).alignment = { horizontal: 'center', vertical: 'middle' };
    });

  }

  /**
   * Applique le formatage final à la feuille
   */
  private applyFinalFormatting(worksheet: ExcelJS.Worksheet, unitesCount: number, lastRow: number, lastCol: number): void {
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

    //Ajouter la legende
    this.addLegende(worksheet);

    //Ajouter le footer
    this.addFooter(worksheet, lastRow, lastCol);
  }

  /**
   * Génère et télécharge le fichier Excel
   */
  async downloadGrille(jury: any, data: GrilleDocumentData, filename?: string): Promise<void> {
    this.jury = jury;
    this.sessionType = data.sessionType || 'principale';
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

  /**
   * Récupère et calcule les données des étudiants pour le palmarès
   */
  private getEtudiantsForPalmaresse(data: GrilleDocumentData): EtudiantPalmaresse[] {
    let etudiants: Etudiant[] = [];
    let unites: UniteEnseignement[] = [];

    // Récupérer les étudiants et unités selon le type de session
    if (this.sessionType === 'annuelle' && data.classe.semestre1 && data.classe.semestre2) {
      // Pour la session annuelle, combiner les deux semestres
      etudiants = data.classe.semestre1.etudiants || data.classe.semestre2.etudiants || [];
      unites = [
        ...(data.classe.semestre1.unites || []),
        ...(data.classe.semestre2.unites || [])
      ];
    } else if (data.semestre) {
      // Pour les sessions semestrielles
      etudiants = data.semestre.etudiants || [];
      unites = data.semestre.unites || [];
    } else {
      // Fallback sur le premier semestre disponible
      const semestre = data.classe.semestre1 || data.classe.semestre2;
      if (semestre) {
        etudiants = semestre.etudiants || [];
        unites = semestre.unites || [];
      }
    }

    return etudiants.map((etudiant) => {
      let ncv = 0;
      let ncnv = 0;
      let totalObtenue = 0;
      let maxSemestre = 0;

      // Calculer les notes pour chaque unité
      unites.forEach((unite) => {
        let moy = 0;
        maxSemestre += 20 * unite.credit;
        
        unite.cours?.forEach((cours) => {
          const uniteNotes: Array<{ ecue: string; note: number }> = etudiant.notes?.[unite._id] || [];
          
          if (uniteNotes?.length > 0) {
            const noteValue = uniteNotes.find((note: { ecue: string; note: number }) => note.ecue === cours.coursId);
            
            if (noteValue && !isNaN(noteValue.note)) {
              moy += unite.credit ? (noteValue.note * cours.credit) / unite.credit : 0;
            }
          }
        });

        ncv += moy > 10 ? unite.credit : 0;
        ncnv += moy > 10 ? 0 : unite.credit;
        totalObtenue += moy;
      });

      const pourcentage: number = maxSemestre ? (totalObtenue / maxSemestre) * 100 : 0.0;

      // Déterminer l'appréciation
      let appreciation = '';
      if (pourcentage >= 90) {
        appreciation = 'A';
      } else if (pourcentage >= 80) {
        appreciation = 'B';
      } else if (pourcentage >= 70) {
        appreciation = 'C';
      } else if (pourcentage >= 60) {
        appreciation = 'D';
      } else if (pourcentage >= 50) {
        appreciation = 'E';
      } else {
        appreciation = 'G';
      }

      // Déterminer la décision
      let decision = '';
      try {
        if (ncv * 100/(ncv + ncnv) >= 60) {
          decision = 'Passe';
        } else {
          decision = 'Double';
        }
      } catch (error) {
        decision = 'Double';
      }

      return {
        nom: etudiant.nom,
        postnom: etudiant.postnom,
        prenom: etudiant.prenom,
        pourcentage,
        ncv,
        ncnv,
        appreciation,
        decision
      };
    });
  }

  /**
   * Applique les couleurs pour les appréciations
   */
  private applyAppreciationColors(cell: ExcelJS.Cell, appreciation: string): void {
    let appreciationColor = 'FF000000';
    let appreciationBgColor = 'FFFFFFFF';
    
    switch (appreciation) {
      case 'A':
        appreciationColor = 'FF006400';
        appreciationBgColor = 'FFE6FFE6';
        break;
      case 'B':
        appreciationColor = 'FF228B22';
        appreciationBgColor = 'FFF0FFF0';
        break;
      case 'C':
        appreciationColor = 'FF32CD32';
        appreciationBgColor = 'FFF5FFFA';
        break;
      case 'D':
        appreciationColor = 'FFFFA500';
        appreciationBgColor = 'FFFFF8DC';
        break;
      case 'E':
        appreciationColor = 'FFFF8C00';
        appreciationBgColor = 'FFFFEFD5';
        break;
      case 'G':
        appreciationColor = 'FFDC143C';
        appreciationBgColor = 'FFFFEAEA';
        break;
    }
    
    cell.font = { bold: true, color: { argb: appreciationColor } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: appreciationBgColor }
    };
  }

  /**
   * Applique les couleurs pour les décisions
   */
  private applyDecisionColors(cell: ExcelJS.Cell, decision: string): void {
    const isPassed = decision === 'Passe';
    cell.font = { 
      bold: true, 
      color: { argb: isPassed ? 'FF008000' : 'FFFF0000' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isPassed ? 'FFE8F5E8' : 'FFFFEAEA' }
    };
  }

  /**
   * Génère un palmarès (classement des étudiants)
   */
  async generatePalmaresse(data: GrilleDocumentData): Promise<Buffer> {
    // Réinitialiser le workbook
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Institut Admin System';
    this.workbook.created = new Date();

    // Créer la feuille de palmarès
    const worksheet = this.workbook.addWorksheet('Palmarès');

    // Configuration de base
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    let currentRow = 1;

    // En-tête du palmarès
    const totalCols = 7; // N°, Étudiant, Pourcentage, NCV, NCNV, Appréciation, Décision
    const lastColLetter = this.numberToColumnLetter(totalCols);

    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `PALMARÈS - ${data.classe.designation}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = `Année Académique: ${data.anneeAcademique} | Session: ${this.sessionType}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
    currentRow += 3;

    // En-têtes des colonnes
    const headers = ['N°', 'Étudiant', 'Pourcentage', 'NCV', 'NCNV', 'Appréciation', 'Décision du Jury'];
    headers.forEach((header, index) => {
      worksheet.getCell(currentRow, index + 1).value = header;
      worksheet.getCell(currentRow, index + 1).font = { bold: true };
      worksheet.getCell(currentRow, index + 1).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      worksheet.getCell(currentRow, index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' } // Lavande clair
      };
      worksheet.getCell(currentRow, index + 1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;

    // Récupérer et calculer les données des étudiants
    const etudiants = this.getEtudiantsForPalmaresse(data);
    
    // Trier les étudiants par pourcentage décroissant
    etudiants.sort((a: EtudiantPalmaresse, b: EtudiantPalmaresse) => b.pourcentage - a.pourcentage);

    // Ajouter les lignes d'étudiants
    etudiants.forEach((etudiant: EtudiantPalmaresse, index: number) => {
      // N° (rang)
      worksheet.getCell(currentRow, 1).value = index + 1;
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      
      // Étudiant
      worksheet.getCell(currentRow, 2).value = `${etudiant.nom} ${etudiant.postnom} ${etudiant.prenom}`;
      worksheet.getCell(currentRow, 2).alignment = { horizontal: 'left', vertical: 'middle' } as CellAlignment;
      
      // Pourcentage
      worksheet.getCell(currentRow, 3).value = `${etudiant.pourcentage.toFixed(2)}%`;
      worksheet.getCell(currentRow, 3).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      
      // NCV
      worksheet.getCell(currentRow, 4).value = etudiant.ncv;
      worksheet.getCell(currentRow, 4).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      
      // NCNV
      worksheet.getCell(currentRow, 5).value = etudiant.ncnv;
      worksheet.getCell(currentRow, 5).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      
      // Appréciation avec couleurs
      worksheet.getCell(currentRow, 6).value = etudiant.appreciation;
      worksheet.getCell(currentRow, 6).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      this.applyAppreciationColors(worksheet.getCell(currentRow, 6), etudiant.appreciation);
      
      // Décision avec couleurs
      worksheet.getCell(currentRow, 7).value = etudiant.decision;
      worksheet.getCell(currentRow, 7).alignment = { horizontal: 'center', vertical: 'middle' } as CellAlignment;
      this.applyDecisionColors(worksheet.getCell(currentRow, 7), etudiant.decision);

      // Bordures pour toutes les cellules
      for (let col = 1; col <= 7; col++) {
        worksheet.getCell(currentRow, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }

      currentRow++;
    });

    // Ajuster la largeur des colonnes
    worksheet.getColumn(1).width = 5;   // N°
    worksheet.getColumn(2).width = 30;  // Étudiant
    worksheet.getColumn(3).width = 12;  // Pourcentage
    worksheet.getColumn(4).width = 8;   // NCV
    worksheet.getColumn(5).width = 8;   // NCNV
    worksheet.getColumn(6).width = 12;  // Appréciation
    worksheet.getColumn(7).width = 15;  // Décision

    // Retourner le buffer du fichier Excel
    const buffer = await this.workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  /**
   * Télécharge le palmarès
   */
  async downloadPalmaresse(jury: any, data: GrilleDocumentData, filename?: string): Promise<void> {
    this.jury = jury;
    this.sessionType = data.sessionType || 'principale';
    const buffer = await this.generatePalmaresse(data);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `palmaresse-${data.classe.designation}-${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

}

export default new GrilleDocument();
