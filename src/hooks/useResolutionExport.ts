import { useState, useCallback } from 'react';
import { Resolution, IResolution } from '@/utils/resolutions';

interface UseResolutionExportReturn {
    exportToExcel: (resolutions: IResolution[], filename?: string) => Promise<void>;
    exportWithClassement: (resolutions: IResolution[], filename?: string) => Promise<void>;
    getClassement: (resolutions: IResolution[]) => Array<{
        rang: number;
        etudiant: any;
        scoreTotal: number;
        scoreMax: number;
        pourcentage: number;
    }>;
    isExporting: boolean;
    error: string | null;
}

/**
 * Hook personnalisé pour l'export des résolutions en Excel
 */
export const useResolutionExport = (): UseResolutionExportReturn => {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Export simple vers Excel
     */
    const exportToExcel = useCallback(async (resolutions: IResolution[], filename?: string) => {
        if (!resolutions || resolutions.length === 0) {
            setError('Aucune résolution à exporter');
            return;
        }

        setIsExporting(true);
        clearError();

        try {
            const resolution = new Resolution(resolutions);
            await resolution.downloadExcelDocument(filename);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export';
            setError(errorMessage);
            throw err;
        } finally {
            setIsExporting(false);
        }
    }, [clearError]);

    /**
     * Export avec classement vers Excel
     */
    const exportWithClassement = useCallback(async (resolutions: IResolution[], filename?: string) => {
        if (!resolutions || resolutions.length === 0) {
            setError('Aucune résolution à exporter');
            return;
        }

        setIsExporting(true);
        clearError();

        try {
            const resolution = new Resolution(resolutions);
            const workbook = await resolution.generateExcelDocument();
            
            // Ajouter une feuille de classement
            const classement = resolution.generateClasser();
            const classementSheet = workbook.addWorksheet('Classement');
            
            // Configuration des colonnes pour le classement
            classementSheet.columns = [
                { header: 'Rang', key: 'rang', width: 8 },
                { header: 'Étudiant', key: 'etudiant', width: 25 },
                { header: 'Matricule', key: 'matricule', width: 15 },
                { header: 'Score Total', key: 'scoreTotal', width: 12 },
                { header: 'Score Maximum', key: 'scoreMax', width: 12 },
                { header: 'Pourcentage', key: 'pourcentage', width: 12 }
            ];
            
            // Style de l'en-tête
            classementSheet.getRow(1).font = { bold: true };
            classementSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF6B35' }
            };
            classementSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
            
            // Ajout des données de classement
            classement.forEach(item => {
                classementSheet.addRow({
                    rang: item.rang,
                    etudiant: `${item.etudiant.nom} ${item.etudiant.prenom}`,
                    matricule: item.etudiant.matricule,
                    scoreTotal: item.scoreTotal,
                    scoreMax: item.scoreMax,
                    pourcentage: `${item.pourcentage}%`
                });
            });
            
            // Style des cellules de classement avec podium
            classementSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.eachCell((cell, colNumber) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                        
                        // Coloration selon le rang (podium)
                        if (colNumber === 1) { // Colonne rang
                            const rang = parseInt(cell.value?.toString() || '0');
                            if (rang === 1) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } }; // Or
                                cell.font = { bold: true };
                            } else if (rang === 2) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0C0C0' } }; // Argent
                                cell.font = { bold: true };
                            } else if (rang === 3) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCD7F32' } }; // Bronze
                                cell.font = { bold: true };
                            }
                        }
                    });
                }
            });
            
            // Télécharger le document complet
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `resolutions_complet_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export avec classement';
            setError(errorMessage);
            throw err;
        } finally {
            setIsExporting(false);
        }
    }, [clearError]);

    /**
     * Obtenir le classement sans export
     */
    const getClassement = useCallback((resolutions: IResolution[]) => {
        if (!resolutions || resolutions.length === 0) {
            return [];
        }

        const resolution = new Resolution(resolutions);
        return resolution.generateClasser();
    }, []);

    return {
        exportToExcel,
        exportWithClassement,
        getClassement,
        isExporting,
        error
    };
};

export default useResolutionExport;
