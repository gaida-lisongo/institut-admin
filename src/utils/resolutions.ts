import { Etudiant } from "@/stores/etudiantStore";
import { Serie, SerieDetail } from "@/stores/serieStore";
import * as ExcelJS from 'exceljs';

export interface INote {
    questionId: string;
    pts: number;
    _id: string;
}

export interface IResolution {
    reponses: INote[];
    _id: string;
    etudiantId: Etudiant;
    serieId: Serie;
}

export class Resolution {
    notes: IResolution[];
    serieInfo?: SerieDetail;

    constructor(data: IResolution[] | any, serieInfo?: SerieDetail) {
        // Adapter différents formats de données
        if (Array.isArray(data)) {
            this.notes = data;
        } else if (data && data.data && Array.isArray(data.data)) {
            this.notes = data.data;
        } else if (data && data.resolutions && Array.isArray(data.resolutions)) {
            this.notes = data.resolutions;
        } else if (data && Array.isArray(data.notes)) {
            this.notes = data.notes;
        } else {
            console.warn('Format de données non reconnu:', data);
            this.notes = [];
        }
        
        this.serieInfo = serieInfo;
        console.log('Résolutions chargées:', this.notes.length);
        if (serieInfo) {
            console.log('Informations série:', serieInfo.coursId.designation);
        }
    }

    /**
     * Valide que les données sont correctes pour l'export
     */
    private validateData(): boolean {
        if (!Array.isArray(this.notes) || this.notes.length === 0) {
            console.error('Aucune résolution trouvée pour l\'export');
            return false;
        }

        // Vérifier la structure des données
        const firstNote = this.notes[0];
        if (!firstNote.etudiantId || !firstNote.serieId || !firstNote.reponses) {
            console.error('Structure de données invalide:', firstNote);
            return false;
        }

        return true;
    }

    /**
     * Calcule le total des points obtenus pour une résolution
     */
    private calculateTotalScore(resolution: IResolution): number {
        if (!resolution.reponses || !Array.isArray(resolution.reponses)) {
            return 0;
        }
        return resolution.reponses.reduce((total, reponse) => total + (reponse.pts || 0), 0);
    }

    /**
     * Calcule le score maximum possible pour une série
     */
    private calculateMaxScore(serie: Serie): number {
        return serie.questions.reduce((total, question) => total + question.pts, 0);
    }

    /**
     * Crée la feuille des métriques dans le workbook
     */
    async createMetricsSheet(workbook: ExcelJS.Workbook): Promise<ExcelJS.Worksheet> {
        if (!this.validateData()) {
            throw new Error('Données invalides pour l\'export');
        }

        const worksheet = workbook.addWorksheet('Métriques');

        // Ajouter les informations de la série et du cours en en-tête
        if (this.serieInfo) {
            worksheet.mergeCells('A1:G1');
            worksheet.getCell('A1').value = `RAPPORT DE RÉSULTATS - ${this.serieInfo.coursId.designation}`;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };
            worksheet.getCell('A1').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2E86AB' }
            };
            worksheet.getCell('A1').font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 16 };

            // Informations détaillées de la série
            worksheet.mergeCells('A2:G2');
            const serieDetails = `Série: ${this.serieInfo._id.slice(-8)} | Cours: ${this.serieInfo.coursId.designation} | Unité: ${this.serieInfo.coursId.unite} | Semestre: ${this.serieInfo.coursId.semestre} | Crédits: ${this.serieInfo.coursId.credit}`;
            worksheet.getCell('A2').value = serieDetails;
            worksheet.getCell('A2').font = { italic: true, size: 12 };
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getCell('A2').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE8F4F8' }
            };

            // Ligne vide
            worksheet.addRow([]);
        }

        // Configuration des colonnes (décalées si on a des infos de série)
        const startRow = this.serieInfo ? 4 : 1;
        worksheet.columns = [
            { header: 'Étudiant', key: 'etudiant', width: 25 },
            { header: 'Matricule', key: 'matricule', width: 15 },
            { header: 'Cours', key: 'cours', width: 25 },
            { header: 'Série', key: 'serie', width: 20 },
            { header: 'Score Total', key: 'scoreTotal', width: 12 },
            { header: 'Score Maximum', key: 'scoreMax', width: 12 },
            { header: 'Pourcentage', key: 'pourcentage', width: 12 },
            { header: 'Rang', key: 'rang', width: 8 }
        ];

        // Style de l'en-tête des colonnes
        const headerRow = this.serieInfo ? 4 : 1;
        worksheet.getRow(headerRow).font = { bold: true };
        worksheet.getRow(headerRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(headerRow).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Calcul des données avec classement
        const dataWithScores = this.notes.map(resolution => {
            const scoreTotal = this.calculateTotalScore(resolution);
            const scoreMax = this.calculateMaxScore(resolution.serieId);
            const pourcentage = scoreMax > 0 ? (scoreTotal / scoreMax) * 100 : 0;

            return {
                resolution,
                etudiant: `${resolution.etudiantId.nom} ${resolution.etudiantId.prenom}`,
                matricule: resolution.etudiantId.matricule,
                cours: this.serieInfo ? this.serieInfo.coursId.designation : 'N/A',
                serie: `Série ${resolution.serieId._id.slice(-8)}`,
                scoreTotal,
                scoreMax,
                pourcentage: Math.round(pourcentage * 100) / 100
            };
        });

        // Tri par score décroissant pour le classement
        dataWithScores.sort((a, b) => b.scoreTotal - a.scoreTotal);

        // Ajout des données avec rang
        dataWithScores.forEach((data, index) => {
            worksheet.addRow({
                etudiant: data.etudiant,
                matricule: data.matricule,
                cours: data.cours,
                serie: data.serie,
                scoreTotal: data.scoreTotal,
                scoreMax: data.scoreMax,
                pourcentage: `${data.pourcentage}%`,
                rang: index + 1
            });
        });

        // Style des cellules de données
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    
                    // Coloration selon le pourcentage
                    if (colNumber === 6) { // Colonne pourcentage
                        const percentage = parseFloat(cell.value?.toString().replace('%', '') || '0');
                        if (percentage >= 80) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
                        } else if (percentage >= 60) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
                        } else if (percentage < 50) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
                        }
                    }
                });
            }
        });

        return worksheet;
    }

    /**
     * Crée la feuille des notes détaillées dans le workbook
     */
    async createNotesSheet(workbook: ExcelJS.Workbook): Promise<ExcelJS.Worksheet> {
        if (!this.validateData()) {
            throw new Error('Données invalides pour l\'export');
        }

        const worksheet = workbook.addWorksheet('Notes Détaillées');

        // Ajouter les informations de la série et du cours en en-tête
        if (this.serieInfo) {
            worksheet.mergeCells('A1:H1');
            worksheet.getCell('A1').value = `NOTES DÉTAILLÉES - ${this.serieInfo.coursId.designation}`;
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };
            worksheet.getCell('A1').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF70AD47' }
            };
            worksheet.getCell('A1').font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 16 };

            // Informations détaillées de la série
            worksheet.mergeCells('A2:H2');
            const serieDetails = `Série: ${this.serieInfo._id.slice(-8)} | Questions: ${this.serieInfo.questions.length} | Score Maximum: ${this.serieInfo.questions.reduce((total, q) => total + q.pts, 0)} pts`;
            worksheet.getCell('A2').value = serieDetails;
            worksheet.getCell('A2').font = { italic: true, size: 12 };
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getCell('A2').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE8F4E8' }
            };

            // Ligne vide
            worksheet.addRow([]);
        }

        // En-têtes dynamiques basés sur les questions
        const headers = ['Étudiant', 'Matricule', 'Cours', 'Série'];
        const questionHeaders: string[] = [];
        
        // Récupération des questions de la première série pour les en-têtes
        if (this.notes.length > 0) {
            this.notes[0].serieId.questions.forEach((question, index) => {
                const header = `Q${index + 1} (${question.pts}pts)`;
                headers.push(header);
                questionHeaders.push(header);
            });
        }
        
        headers.push('Total Obtenu', 'Total Maximum', 'Pourcentage');

        // Configuration des colonnes
        worksheet.columns = headers.map((header, index) => ({
            header,
            key: `col${index}`,
            width: index < 3 ? 20 : 12
        }));

        // Style de l'en-tête des colonnes
        const headerRowDetails = this.serieInfo ? 4 : 1;
        worksheet.getRow(headerRowDetails).font = { bold: true };
        worksheet.getRow(headerRowDetails).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        worksheet.getRow(headerRowDetails).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Ajout des données
        this.notes.forEach(resolution => {
            const scoreTotal = this.calculateTotalScore(resolution);
            const scoreMax = this.calculateMaxScore(resolution.serieId);
            const pourcentage = scoreMax > 0 ? (scoreTotal / scoreMax) * 100 : 0;

            const rowData: any = {
                col0: `${resolution.etudiantId.nom} ${resolution.etudiantId.prenom}`,
                col1: resolution.etudiantId.matricule,
                col2: this.serieInfo ? this.serieInfo.coursId.designation : 'N/A',
                col3: `Série ${resolution.serieId._id.slice(-8)}`
            };

            // Ajout des notes par question
            resolution.serieId.questions.forEach((question, index) => {
                const reponse = resolution.reponses.find(r => r.questionId === question._id);
                rowData[`col${index + 4}`] = reponse ? reponse.pts : 0;
            });

            // Ajout des totaux
            const totalColIndex = headers.length - 3;
            rowData[`col${totalColIndex}`] = scoreTotal;
            rowData[`col${totalColIndex + 1}`] = scoreMax;
            rowData[`col${totalColIndex + 2}`] = `${Math.round(pourcentage * 100) / 100}%`;

            worksheet.addRow(rowData);
        });

        // Style des cellules
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    
                    // Alignement des nombres au centre
                    if (colNumber > 3) {
                        cell.alignment = { horizontal: 'center' };
                    }
                });
            }
        });

        return worksheet;
    }

    /**
     * Génère la première feuille avec les métriques dérivées (méthode de compatibilité)
     */
    async metricSheet(): Promise<ExcelJS.Worksheet> {
        const workbook = new ExcelJS.Workbook();
        return await this.createMetricsSheet(workbook);
    }

    /**
     * Génère la deuxième feuille avec les notes détaillées par question (méthode de compatibilité)
     */
    async listNotes(): Promise<ExcelJS.Worksheet> {
        const workbook = new ExcelJS.Workbook();
        return await this.createNotesSheet(workbook);
    }

    /**
     * Génère le document Excel complet avec les deux feuilles
     */
    async generateExcelDocument(): Promise<ExcelJS.Workbook> {
        const workbook = new ExcelJS.Workbook();
        
        // Métadonnées du document
        workbook.creator = 'Institut Admin';
        workbook.lastModifiedBy = 'Institut Admin';
        workbook.created = new Date();
        workbook.modified = new Date();

        // Génération de la première feuille (métriques)
        await this.createMetricsSheet(workbook);

        // Génération de la deuxième feuille (notes détaillées)
        await this.createNotesSheet(workbook);

        return workbook;
    }

    /**
     * Sauvegarde le document Excel
     */
    async saveExcelDocument(filename?: string): Promise<void> {
        const workbook = await this.generateExcelDocument();
        const defaultFilename = `resolutions_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Sauvegarde du fichier
        await workbook.xlsx.writeFile(filename || defaultFilename);
    }

    /**
     * Génère et télécharge le document Excel dans le navigateur
     */
    async downloadExcelDocument(filename?: string): Promise<void> {
        const workbook = await this.generateExcelDocument();
        const defaultFilename = `resolutions_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Génération du buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Création du blob et téléchargement
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Génère le classement des étudiants
     */
    generateClasser(): Array<{
        rang: number;
        etudiant: Etudiant;
        scoreTotal: number;
        scoreMax: number;
        pourcentage: number;
    }> {
        const classement = this.notes.map(resolution => {
            const scoreTotal = this.calculateTotalScore(resolution);
            const scoreMax = this.calculateMaxScore(resolution.serieId);
            const pourcentage = scoreMax > 0 ? (scoreTotal / scoreMax) * 100 : 0;

            return {
                etudiant: resolution.etudiantId,
                scoreTotal,
                scoreMax,
                pourcentage: Math.round(pourcentage * 100) / 100
            };
        });

        // Tri par score décroissant
        classement.sort((a, b) => b.scoreTotal - a.scoreTotal);

        // Ajout du rang
        return classement.map((item, index) => ({
            rang: index + 1,
            ...item
        }));
    }

    /**
     * Méthode statique pour créer et exporter directement depuis des données API
     */
    static async exportFromApiData(apiData: any, filename?: string, serieInfo?: SerieDetail): Promise<void> {
        try {
            const resolution = new Resolution(apiData, serieInfo);
            
            if (resolution.notes.length === 0) {
                throw new Error('Aucune résolution trouvée dans les données');
            }
            
            await resolution.downloadExcelDocument(filename);
            console.log('Export réussi !');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            throw error;
        }
    }

    /**
     * Méthode statique pour obtenir des informations sur les données sans export
     */
    static getDataInfo(apiData: any, serieInfo: SerieDetail): { count: number; isValid: boolean; error?: string } {
        try {
            const resolution = new Resolution(apiData, serieInfo);
            return {
                count: resolution.notes.length,
                isValid: resolution.notes.length > 0,
                error: resolution.notes.length === 0 ? 'Aucune résolution trouvée' : undefined
            };
        } catch (error) {
            return {
                count: 0,
                isValid: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }
}