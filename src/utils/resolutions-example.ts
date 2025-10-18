import { Resolution, IResolution } from './resolutions';
import { Etudiant } from '@/stores/etudiantStore';
import { Serie } from '@/stores/serieStore';

/**
 * Exemple d'utilisation de la classe Resolution pour générer des documents Excel
 */

// Exemple de données de test
const exampleData: IResolution[] = [
    {
        _id: '1',
        etudiantId: {
            _id: 'etud1',
            nom: 'Dupont',
            prenom: 'Jean',
            post_nom: 'Marie',
            matricule: 'MAT001',
            password: 'password123'
        },
        serieId: {
            _id: 'serie1',
            coursId: 'cours1',
            questions: [
                {
                    _id: 'q1',
                    enonce: 'Question 1',
                    assertions: ['A', 'B', 'C', 'D'],
                    reponse: 'A',
                    pts: 5
                },
                {
                    _id: 'q2',
                    enonce: 'Question 2',
                    assertions: ['A', 'B', 'C', 'D'],
                    reponse: 'B',
                    pts: 3
                }
            ]
        },
        reponses: [
            {
                _id: 'rep1',
                questionId: 'q1',
                pts: 5 // Bonne réponse
            },
            {
                _id: 'rep2',
                questionId: 'q2',
                pts: 2 // Réponse partielle
            }
        ]
    },
    {
        _id: '2',
        etudiantId: {
            _id: 'etud2',
            nom: 'Martin',
            prenom: 'Sophie',
            post_nom: 'Claire',
            matricule: 'MAT002',
            password: 'password456'
        },
        serieId: {
            _id: 'serie1',
            coursId: 'cours1',
            questions: [
                {
                    _id: 'q1',
                    enonce: 'Question 1',
                    assertions: ['A', 'B', 'C', 'D'],
                    reponse: 'A',
                    pts: 5
                },
                {
                    _id: 'q2',
                    enonce: 'Question 2',
                    assertions: ['A', 'B', 'C', 'D'],
                    reponse: 'B',
                    pts: 3
                }
            ]
        },
        reponses: [
            {
                _id: 'rep3',
                questionId: 'q1',
                pts: 3 // Réponse partielle
            },
            {
                _id: 'rep4',
                questionId: 'q2',
                pts: 3 // Bonne réponse
            }
        ]
    }
];

/**
 * Exemple d'utilisation basique
 */
export async function generateBasicReport() {
    // Créer une instance de Resolution
    const resolution = new Resolution(exampleData);
    
    // Générer et télécharger le document Excel
    await resolution.downloadExcelDocument('rapport_resolutions.xlsx');
    
    console.log('Document Excel généré et téléchargé !');
}

/**
 * Exemple d'utilisation avancée avec classement
 */
export async function generateAdvancedReport() {
    const resolution = new Resolution(exampleData);
    
    // Obtenir le classement
    const classement = resolution.generateClasser();
    console.log('Classement des étudiants:', classement);
    
    // Générer le document Excel complet
    const workbook = await resolution.generateExcelDocument();
    
    // Ajouter une feuille supplémentaire avec le classement
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
    
    // Télécharger le document avec la feuille supplémentaire
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapport_complet_resolutions.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Rapport complet généré avec classement !');
}

/**
 * Exemple d'utilisation dans un composant React
 */
export const ExampleComponent = () => {
    const handleGenerateReport = async () => {
        try {
            await generateBasicReport();
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
        }
    };
    
    const handleGenerateAdvancedReport = async () => {
        try {
            await generateAdvancedReport();
        } catch (error) {
            console.error('Erreur lors de la génération du rapport avancé:', error);
        }
    };
    
    return (
        <div className="space-y-4">
            <button 
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Générer Rapport Basic
            </button>
            
            <button 
                onClick={handleGenerateAdvancedReport}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Générer Rapport Avancé
            </button>
        </div>
    );
};
