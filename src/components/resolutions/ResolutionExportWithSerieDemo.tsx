'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Resolution, IResolution } from '@/utils/resolutions';
import { SerieDetail } from '@/stores/serieStore';
import { FileSpreadsheet, BookOpen, GraduationCap, Award } from 'lucide-react';

// Données de test avec informations de série complètes
const sampleSerieInfo: SerieDetail = {
    _id: '67123abc456def789',
    coursId: {
        _id: 'cours123',
        nom: 'MATH101',
        designation: 'Mathématiques Générales',
        semestre: 'Semestre 1',
        annee: '2024-2025',
        credit: 6,
        unite: 'Sciences Exactes'
    },
    questions: [
        {
            _id: 'q1',
            enonce: 'Résoudre l\'équation : 2x + 5 = 13',
            assertions: ['x = 4', 'x = 3', 'x = 5', 'x = 2'],
            reponse: 'x = 4',
            pts: 5
        },
        {
            _id: 'q2',
            enonce: 'Calculer la dérivée de f(x) = x² + 3x',
            assertions: ['2x + 3', '2x + 6', 'x + 3', '2x'],
            reponse: '2x + 3',
            pts: 4
        },
        {
            _id: 'q3',
            enonce: 'Quelle est la valeur de π (pi) ?',
            assertions: ['3.14159', '3.14', '3.1416', '3.15'],
            reponse: '3.14159',
            pts: 3
        }
    ]
};

const sampleResolutions: IResolution[] = [
    {
        _id: '1',
        etudiantId: {
            _id: 'etud1',
            nom: 'Mukendi',
            prenom: 'Jean-Baptiste',
            post_nom: 'Kalala',
            matricule: 'MATH2024001',
            password: 'password123'
        },
        serieId: {
            _id: sampleSerieInfo._id,
            coursId: sampleSerieInfo.coursId._id,
            questions: sampleSerieInfo.questions
        },
        reponses: [
            { _id: 'rep1', questionId: 'q1', pts: 5 }, // Parfait
            { _id: 'rep2', questionId: 'q2', pts: 3 }, // Partiel
            { _id: 'rep3', questionId: 'q3', pts: 3 }  // Parfait
        ]
    },
    {
        _id: '2',
        etudiantId: {
            _id: 'etud2',
            nom: 'Tshimanga',
            prenom: 'Marie-Claire',
            post_nom: 'Kabongo',
            matricule: 'MATH2024002',
            password: 'password456'
        },
        serieId: {
            _id: sampleSerieInfo._id,
            coursId: sampleSerieInfo.coursId._id,
            questions: sampleSerieInfo.questions
        },
        reponses: [
            { _id: 'rep4', questionId: 'q1', pts: 4 }, // Bon
            { _id: 'rep5', questionId: 'q2', pts: 4 }, // Parfait
            { _id: 'rep6', questionId: 'q3', pts: 2 }  // Partiel
        ]
    },
    {
        _id: '3',
        etudiantId: {
            _id: 'etud3',
            nom: 'Ngandu',
            prenom: 'Patrick',
            post_nom: 'Mbuyi',
            matricule: 'MATH2024003',
            password: 'password789'
        },
        serieId: {
            _id: sampleSerieInfo._id,
            coursId: sampleSerieInfo.coursId._id,
            questions: sampleSerieInfo.questions
        },
        reponses: [
            { _id: 'rep7', questionId: 'q1', pts: 5 }, // Parfait
            { _id: 'rep8', questionId: 'q2', pts: 2 }, // Faible
            { _id: 'rep9', questionId: 'q3', pts: 3 }  // Parfait
        ]
    }
];

export const ResolutionExportWithSerieDemo: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportWithSerieInfo = async () => {
        setIsExporting(true);
        try {
            await Resolution.exportFromApiData(sampleResolutions, 'demo_avec_serie_info.xlsx', sampleSerieInfo);
            alert('Export réussi avec informations de série !');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Erreur lors de l\'export');
        } finally {
            setIsExporting(false);
        }
    };

    // Calculs pour l'affichage
    const scoreMax = sampleSerieInfo.questions.reduce((total, q) => total + q.pts, 0);
    const resolution = new Resolution(sampleResolutions, sampleSerieInfo);
    const classement = resolution.generateClasser();
    const moyenneGenerale = classement.reduce((total, item) => total + item.pourcentage, 0) / classement.length;

    const getPerformanceBadge = (pourcentage: number) => {
        if (pourcentage >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
        if (pourcentage >= 60) return <Badge className="bg-yellow-500">Bien</Badge>;
        if (pourcentage >= 40) return <Badge className="bg-orange-500">Passable</Badge>;
        return <Badge className="bg-red-500">Insuffisant</Badge>;
    };

    const getRangBadge = (rang: number) => {
        if (rang === 1) return <Badge className="bg-yellow-500">🥇 1er</Badge>;
        if (rang === 2) return <Badge className="bg-gray-400">🥈 2ème</Badge>;
        if (rang === 3) return <Badge className="bg-amber-600">🥉 3ème</Badge>;
        return <Badge variant="outline">{rang}ème</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Export avec Informations de Série</h1>
                    <p className="text-muted-foreground">
                        Démonstration de l'export Excel enrichi avec les détails du cours et de la série
                    </p>
                </div>
                <Button
                    onClick={handleExportWithSerieInfo}
                    disabled={isExporting}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isExporting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Export en cours...
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Exporter avec Infos Série
                        </>
                    )}
                </Button>
            </div>

            {/* Informations de la série */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Informations de la Série
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <GraduationCap className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Cours:</span>
                                <span className="ml-2">{sampleSerieInfo.coursId.designation}</span>
                            </div>
                            <div className="flex items-center">
                                <Award className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Unité:</span>
                                <span className="ml-2">{sampleSerieInfo.coursId.unite}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold">Semestre:</span>
                                <span className="ml-2">{sampleSerieInfo.coursId.semestre}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <span className="font-semibold">Série ID:</span>
                                <span className="ml-2 font-mono text-sm">{sampleSerieInfo._id.slice(-8)}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold">Questions:</span>
                                <span className="ml-2">{sampleSerieInfo.questions.length}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold">Score Maximum:</span>
                                <span className="ml-2 font-bold text-blue-600">{scoreMax} pts</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sampleResolutions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sampleSerieInfo.questions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Score Max</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{scoreMax} pts</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Moyenne</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{moyenneGenerale.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Aperçu des résultats */}
            <Card>
                <CardHeader>
                    <CardTitle>Aperçu du Classement</CardTitle>
                    <CardDescription>
                        Résultats qui seront inclus dans le document Excel avec toutes les informations de série
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rang</TableHead>
                                <TableHead>Étudiant</TableHead>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Cours</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Pourcentage</TableHead>
                                <TableHead>Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classement.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{getRangBadge(item.rang)}</TableCell>
                                    <TableCell className="font-medium">
                                        {item.etudiant.nom} {item.etudiant.prenom}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{item.etudiant.matricule}</TableCell>
                                    <TableCell>{sampleSerieInfo.coursId.designation}</TableCell>
                                    <TableCell>
                                        {item.scoreTotal}/{item.scoreMax}
                                    </TableCell>
                                    <TableCell>{item.pourcentage}%</TableCell>
                                    <TableCell>{getPerformanceBadge(item.pourcentage)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Aperçu du contenu Excel */}
            <Card>
                <CardHeader>
                    <CardTitle>Contenu du Document Excel</CardTitle>
                    <CardDescription>
                        Le document généré contiendra les éléments suivants
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-semibold text-blue-900">📊 Feuille "Métriques"</h4>
                            <div className="mt-2 text-sm text-blue-700">
                                <div className="font-medium">En-tête enrichi:</div>
                                <div className="ml-4 font-mono text-xs bg-white p-2 rounded mt-1">
                                    RAPPORT DE RÉSULTATS - {sampleSerieInfo.coursId.designation}<br/>
                                    Série: {sampleSerieInfo._id.slice(-8)} | Cours: {sampleSerieInfo.coursId.designation} | 
                                    Unité: {sampleSerieInfo.coursId.unite} | Semestre: {sampleSerieInfo.coursId.semestre} | 
                                    Crédits: {sampleSerieInfo.coursId.credit}
                                </div>
                                <div className="mt-2">
                                    <strong>Colonnes:</strong> Étudiant, Matricule, Cours, Série, Score Total, Score Maximum, Pourcentage, Rang
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <h4 className="font-semibold text-green-900">📝 Feuille "Notes Détaillées"</h4>
                            <div className="mt-2 text-sm text-green-700">
                                <div className="font-medium">En-tête enrichi:</div>
                                <div className="ml-4 font-mono text-xs bg-white p-2 rounded mt-1">
                                    NOTES DÉTAILLÉES - {sampleSerieInfo.coursId.designation}<br/>
                                    Série: {sampleSerieInfo._id.slice(-8)} | Questions: {sampleSerieInfo.questions.length} | 
                                    Score Maximum: {scoreMax} pts
                                </div>
                                <div className="mt-2">
                                    <strong>Colonnes:</strong> Étudiant, Matricule, Cours, Série, Q1 (5pts), Q2 (4pts), Q3 (3pts), Total Obtenu, Total Maximum, Pourcentage
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-semibold text-purple-900">🏆 Fonctionnalités Avancées</h4>
                            <ul className="mt-2 text-sm text-purple-700 space-y-1">
                                <li>• <strong>Informations contextuelles:</strong> Cours, unité, semestre, crédits</li>
                                <li>• <strong>Identification précise:</strong> ID de série raccourci pour lisibilité</li>
                                <li>• <strong>Métadonnées complètes:</strong> Nombre de questions, score maximum</li>
                                <li>• <strong>Mise en forme professionnelle:</strong> En-têtes colorés, bordures, alignements</li>
                                <li>• <strong>Coloration conditionnelle:</strong> Performance selon les pourcentages</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResolutionExportWithSerieDemo;
