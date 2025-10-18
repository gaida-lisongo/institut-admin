'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExportResolutionsButton, SimpleExportButton, AdvancedExportButton } from '@/components/ui/ExportResolutionsButton';
import { useResolutionExport } from '@/hooks/useResolutionExport';
import { IResolution } from '@/utils/resolutions';
import { FileSpreadsheet, Trophy, Users, BarChart3 } from 'lucide-react';

// Données de test
const sampleResolutions: IResolution[] = [
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
                    enonce: 'Quelle est la capitale de la France ?',
                    assertions: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
                    reponse: 'Paris',
                    pts: 5
                },
                {
                    _id: 'q2',
                    enonce: 'Combien font 2 + 2 ?',
                    assertions: ['3', '4', '5', '6'],
                    reponse: '4',
                    pts: 3
                },
                {
                    _id: 'q3',
                    enonce: 'Qui a écrit "Les Misérables" ?',
                    assertions: ['Victor Hugo', 'Émile Zola', 'Gustave Flaubert', 'Honoré de Balzac'],
                    reponse: 'Victor Hugo',
                    pts: 4
                }
            ]
        },
        reponses: [
            { _id: 'rep1', questionId: 'q1', pts: 5 },
            { _id: 'rep2', questionId: 'q2', pts: 3 },
            { _id: 'rep3', questionId: 'q3', pts: 2 }
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
                    enonce: 'Quelle est la capitale de la France ?',
                    assertions: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
                    reponse: 'Paris',
                    pts: 5
                },
                {
                    _id: 'q2',
                    enonce: 'Combien font 2 + 2 ?',
                    assertions: ['3', '4', '5', '6'],
                    reponse: '4',
                    pts: 3
                },
                {
                    _id: 'q3',
                    enonce: 'Qui a écrit "Les Misérables" ?',
                    assertions: ['Victor Hugo', 'Émile Zola', 'Gustave Flaubert', 'Honoré de Balzac'],
                    reponse: 'Victor Hugo',
                    pts: 4
                }
            ]
        },
        reponses: [
            { _id: 'rep4', questionId: 'q1', pts: 3 },
            { _id: 'rep5', questionId: 'q2', pts: 3 },
            { _id: 'rep6', questionId: 'q3', pts: 4 }
        ]
    },
    {
        _id: '3',
        etudiantId: {
            _id: 'etud3',
            nom: 'Bernard',
            prenom: 'Pierre',
            post_nom: 'Louis',
            matricule: 'MAT003',
            password: 'password789'
        },
        serieId: {
            _id: 'serie1',
            coursId: 'cours1',
            questions: [
                {
                    _id: 'q1',
                    enonce: 'Quelle est la capitale de la France ?',
                    assertions: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
                    reponse: 'Paris',
                    pts: 5
                },
                {
                    _id: 'q2',
                    enonce: 'Combien font 2 + 2 ?',
                    assertions: ['3', '4', '5', '6'],
                    reponse: '4',
                    pts: 3
                },
                {
                    _id: 'q3',
                    enonce: 'Qui a écrit "Les Misérables" ?',
                    assertions: ['Victor Hugo', 'Émile Zola', 'Gustave Flaubert', 'Honoré de Balzac'],
                    reponse: 'Victor Hugo',
                    pts: 4
                }
            ]
        },
        reponses: [
            { _id: 'rep7', questionId: 'q1', pts: 5 },
            { _id: 'rep8', questionId: 'q2', pts: 2 },
            { _id: 'rep9', questionId: 'q3', pts: 4 }
        ]
    }
];

export const ResolutionExportDemo: React.FC = () => {
    const { getClassement, isExporting, error } = useResolutionExport();
    const [showClassement, setShowClassement] = useState(false);

    // Calcul des statistiques
    const totalEtudiants = sampleResolutions.length;
    const scoreMax = sampleResolutions[0]?.serieId.questions.reduce((total, q) => total + q.pts, 0) || 0;
    const classement = getClassement(sampleResolutions);
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
                    <h1 className="text-3xl font-bold">Export des Résolutions</h1>
                    <p className="text-muted-foreground">
                        Démonstration de l'export Excel des résultats d'épreuves
                    </p>
                </div>
                <div className="flex gap-2">
                    <SimpleExportButton
                        resolutions={sampleResolutions}
                        filename="demo_resolutions_simple.xlsx"
                        variant="outline"
                    />
                    <AdvancedExportButton
                        resolutions={sampleResolutions}
                        filename="demo_resolutions_complet.xlsx"
                    />
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Erreur: {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEtudiants}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Score Maximum</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{scoreMax} pts</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{moyenneGenerale.toFixed(1)}%</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sampleResolutions[0]?.serieId.questions.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Aperçu des résultats */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Aperçu des Résultats</CardTitle>
                            <CardDescription>
                                Résultats des étudiants pour la série de questions
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowClassement(!showClassement)}
                        >
                            {showClassement ? 'Masquer' : 'Afficher'} le Classement
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {showClassement && <TableHead>Rang</TableHead>}
                                <TableHead>Étudiant</TableHead>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Pourcentage</TableHead>
                                <TableHead>Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(showClassement ? classement : sampleResolutions.map((resolution, index) => {
                                const scoreTotal = resolution.reponses.reduce((total, rep) => total + rep.pts, 0);
                                const pourcentage = scoreMax > 0 ? (scoreTotal / scoreMax) * 100 : 0;
                                return {
                                    rang: index + 1,
                                    etudiant: resolution.etudiantId,
                                    scoreTotal,
                                    scoreMax,
                                    pourcentage: Math.round(pourcentage * 100) / 100
                                };
                            })).map((item, index) => (
                                <TableRow key={index}>
                                    {showClassement && (
                                        <TableCell>{getRangBadge(item.rang)}</TableCell>
                                    )}
                                    <TableCell className="font-medium">
                                        {item.etudiant.nom} {item.etudiant.prenom}
                                    </TableCell>
                                    <TableCell>{item.etudiant.matricule}</TableCell>
                                    <TableCell>
                                        {item.scoreTotal}/{item.scoreMax || scoreMax}
                                    </TableCell>
                                    <TableCell>{item.pourcentage}%</TableCell>
                                    <TableCell>{getPerformanceBadge(item.pourcentage)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Informations sur l'export */}
            <Card>
                <CardHeader>
                    <CardTitle>Fonctionnalités d'Export</CardTitle>
                    <CardDescription>
                        Le système génère automatiquement des documents Excel avec les fonctionnalités suivantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">📊 Feuille "Métriques"</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Classement automatique par score</li>
                                <li>• Calcul des pourcentages</li>
                                <li>• Coloration selon performance</li>
                                <li>• Informations complètes des étudiants</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold">📝 Feuille "Notes Détaillées"</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Score par question individuelle</li>
                                <li>• Points obtenus vs points maximum</li>
                                <li>• Totaux calculés automatiquement</li>
                                <li>• Format adapté pour analyse</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900">🏆 Export Avancé (avec Classement)</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Inclut une feuille supplémentaire "Classement" avec podium coloré (Or, Argent, Bronze) 
                            et tri automatique par performance.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResolutionExportDemo;
