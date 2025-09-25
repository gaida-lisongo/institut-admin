"use client";
import React, { useState, useEffect } from "react";
import GrilleDocument from "@/utils/GrilleDocument";

interface DeliberationComponentProps {
  jury: any;
  semestre: any;
  onBack: () => void;
}

export default function DeliberationComponent({ jury, semestre, onBack }: DeliberationComponentProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  console.log("Current semestre: ", semestre);
  // Template - données fictives pour la démonstration
  const mockStudents = [
    {
      id: "1",
      nom: "MUKENDI",
      postnom: "KALALA",
      prenom: "Jean",
      matricule: "2023001",
      notes: {
        "UE101": { 
          "EC1": 12, 
          "EC2": 14, 
          "Moy": 13,
          note: 13, 
          status: "validé" 
        },
        "UE102": { 
          "EC1": 10, 
          "EC2": 11, 
          "Moy": 10.5,
          note: 10.5, 
          status: "validé" 
        },
        "UE103": { 
          "EC1": 8, 
          "EC2": 9, 
          "Moy": 8.5,
          note: 8.5, 
          status: "échec" 
        }
      },
      moyenne: 10.67,
      decision: "passage conditionnel"
    },
    {
      id: "2",
      nom: "KABONGO",
      postnom: "MWAMBA",
      prenom: "Marie",
      matricule: "2023002",
      notes: {
        "UE101": { 
          "EC1": 15, 
          "EC2": 16, 
          "Moy": 15.5,
          note: 15.5, 
          status: "validé" 
        },
        "UE102": { 
          "EC1": 14, 
          "EC2": 15, 
          "Moy": 14.5,
          note: 14.5, 
          status: "validé" 
        },
        "UE103": { 
          "EC1": 13, 
          "EC2": 14, 
          "Moy": 13.5,
          note: 13.5, 
          status: "validé" 
        }
      },
      moyenne: 14.5,
      decision: "passage"
    },
    {
      id: "3",
      nom: "TSHIMANGA",
      postnom: "KASONGO",
      prenom: "Paul",
      matricule: "2023003",
      notes: {
        "UE101": { 
          "EC1": 16, 
          "EC2": 17, 
          "Moy": 16.5,
          note: 16.5, 
          status: "validé" 
        },
        "UE102": { 
          "EC1": 15, 
          "EC2": 16, 
          "Moy": 15.5,
          note: 15.5, 
          status: "validé" 
        },
        "UE103": { 
          "EC1": 14, 
          "EC2": 15, 
          "Moy": 14.5,
          note: 14.5, 
          status: "validé" 
        }
      },
      moyenne: 15.5,
      decision: "passage"
    }
  ];

  // Charger automatiquement les étudiants au montage du composant
  useEffect(() => {
    if (isInitialLoad) {
      handleLoadStudents();
      setIsInitialLoad(false);
    }
  }, []);

  const handleLoadStudents = () => {
    setIsLoading(true);
    // Simuler le chargement des étudiants pour le semestre sélectionné
    console.log("Chargement des étudiants pour:", {
      jury: jury.juryId,
      classe: semestre.classe.classeId,
      semestre: semestre.semestreId
    });
    
    setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 1000);
  };

  const handleDecisionChange = (studentId: string, decision: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, decision }
        : student
    ));
  };

  const getDecisionColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'passage':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'passage conditionnel':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'redoublement':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleExportGrille = async () => {
    try {
      setIsExporting(true);
      
      // Convertir les données mockées en format attendu par GrilleDocument
      const grilleData = {
        classe: {
          _id: semestre.classe.classeId,
          designation: semestre.classe.designation,
          semestre1: {
            _id: semestre.semestreId,
            designation: semestre.designation,
            unites: semestre.unites.map((unite: any) => ({
              _id: unite.uniteId,
              code: unite.code,
              designation: unite.designation,
              credit: unite.credit || 3,
              evaluations: [
                { code: 'EC1', designation: 'Évaluation Continue 1', ponderation: 30 },
                { code: 'EC2', designation: 'Évaluation Continue 2', ponderation: 30 },
              ],
              cours: unite.cours?.length > 0 ? unite.cours : [
                { coursId: 'EC1', titre: 'Évaluation Continue 1', credit: 30 },
                { coursId: 'EC2', titre: 'Évaluation Continue 2', credit: 30 },
              ]               
            })),
            etudiants: students.map((student) => ({
              _id: student.id,
              nom: student.nom,
              postnom: student.postnom,
              prenom: student.prenom,
              matricule: student.matricule,
              notes: student.notes || {}
            }))
          }
        },
        anneeAcademique: `${jury.annee.debut}-${jury.annee.fin}`
      };

      // Générer le nom du fichier
      const filename = `grille_deliberation_${semestre.classe.designation}_${semestre.designation}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Télécharger la grille
      await GrilleDocument.downloadGrille(grilleData, filename);
      
      console.log('Grille de délibération exportée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export de la grille:', error);
      alert('Erreur lors de l\'export de la grille de délibération');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux Jurys
          </button>
          <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Délibération - {semestre.designation}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {semestre.classe.designation} • {jury.section.description.sigle} • Année {jury.annee.debut}-{jury.annee.fin}
            </p>
          </div>
        </div>
        
        {/* Bouton Imprimer Grille */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportGrille}
            disabled={isExporting || students.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Export...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Imprimer Grille
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informations du jury */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Code Jury</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{jury.code}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Votre Rôle</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              jury.role.toLowerCase() === 'président' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : jury.role.toLowerCase() === 'secrétaire'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {jury.role}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Classe</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {semestre.classe.designation}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Semestre</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {semestre.designation}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Section</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {jury.section.description.designation}
            </p>
          </div>
        </div>
      </div>

      {/* Informations du semestre sélectionné */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Détails du Semestre à Délibérer
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Classe
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
              {semestre.classe.designation}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semestre
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
              {semestre.designation}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unités d'Enseignement
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
              {semestre.unites.length} unité{semestre.unites.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleLoadStudents}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Chargement..." : "Recharger Étudiants"}
            </button>
          </div>
        </div>

        {/* Liste des unités */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unités d'Enseignement :
          </h4>
          <div className="flex flex-wrap gap-2">
            {semestre.unites.map((unite: any) => (
              <span key={unite.uniteId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {unite.code} - {unite.designation} ({unite.credit} crédits)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Étudiants à Délibérer ({students.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {semestre.classe.designation} - {semestre.designation}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Décision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.nom} {student.postnom} {student.prenom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.matricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.moyenne >= 12 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : student.moyenne >= 10
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {student.moyenne.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={student.decision}
                        onChange={(e) => handleDecisionChange(student.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="passage">Passage</option>
                        <option value="passage conditionnel">Passage Conditionnel</option>
                        <option value="redoublement">Redoublement</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                        Détails
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        Valider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions de délibération */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {students.length} étudiant{students.length > 1 ? 's' : ''} • 
                {students.filter(s => s.decision === 'passage').length} passage{students.filter(s => s.decision === 'passage').length > 1 ? 's' : ''} • 
                {students.filter(s => s.decision === 'passage conditionnel').length} conditionnel{students.filter(s => s.decision === 'passage conditionnel').length > 1 ? 's' : ''} • 
                {students.filter(s => s.decision === 'redoublement').length} redoublement{students.filter(s => s.decision === 'redoublement').length > 1 ? 's' : ''}
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Sauvegarder Brouillon
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  Finaliser Délibération
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun étudiant */}
      {students.length === 0 && !isLoading && !isInitialLoad && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun étudiant trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucun étudiant inscrit pour {semestre.classe.designation} - {semestre.designation}.
          </p>
        </div>
      )}
    </div>
  );
}
