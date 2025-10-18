'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Resolution, IResolution } from '@/utils/resolutions';

interface ExportResolutionsButtonProps {
    resolutions: IResolution[];
    filename?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    includeClassement?: boolean;
}

export const ExportResolutionsButton: React.FC<ExportResolutionsButtonProps> = ({
    resolutions,
    filename,
    variant = 'default',
    size = 'default',
    className = '',
    includeClassement = false
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!resolutions || resolutions.length === 0) {
            alert('Aucune résolution à exporter');
            return;
        }

        setIsExporting(true);
        
        try {
            const resolution = new Resolution(resolutions);
            
            if (includeClassement) {
                // Export avancé avec classement
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
                
                // Style des cellules de classement
                classementSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        row.eachCell((cell, colNumber) => {
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                            
                            // Coloration selon le rang
                            if (colNumber === 1) { // Colonne rang
                                const rang = parseInt(cell.value?.toString() || '0');
                                if (rang === 1) {
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } }; // Or
                                } else if (rang === 2) {
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0C0C0' } }; // Argent
                                } else if (rang === 3) {
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCD7F32' } }; // Bronze
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
                
            } else {
                // Export simple
                await resolution.downloadExcelDocument(filename);
            }
            
            console.log('Export réussi !');
            
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Erreur lors de l\'export du fichier Excel');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting || !resolutions || resolutions.length === 0}
            variant={variant}
            size={size}
            className={className}
        >
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Export en cours...
                </>
            ) : (
                <>
                    {includeClassement ? (
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {includeClassement ? 'Export Complet' : 'Export Excel'}
                </>
            )}
        </Button>
    );
};

// Composant pour export simple
export const SimpleExportButton: React.FC<Omit<ExportResolutionsButtonProps, 'includeClassement'>> = (props) => (
    <ExportResolutionsButton {...props} includeClassement={false} />
);

// Composant pour export avec classement
export const AdvancedExportButton: React.FC<Omit<ExportResolutionsButtonProps, 'includeClassement'>> = (props) => (
    <ExportResolutionsButton {...props} includeClassement={true} />
);

export default ExportResolutionsButton;
