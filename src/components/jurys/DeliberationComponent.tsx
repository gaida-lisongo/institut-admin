"use client";
import React, { useState, useEffect } from "react";
import GrilleDocument from "@/utils/GrilleDocument";
import JuryService from "@/services/JuryService";
import { toGrilleDocumentData } from "@/utils/mappers/grilleMapper";

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
  const [classeData, setClasseData] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'principale' | 'rattrapage' | 'annuelle'>('principale');
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

  const handleLoadStudents = async () => {
    setIsLoading(true);
    try {
      console.log("Chargement des étudiants pour:", {
        jury: jury.juryId,
        classe: semestre.classe.classeId,
        semestre: semestre.semestreId
      });

      // Récupérer les données de la classe via JuryService
      const response = await JuryService.getClasseDetail(`${semestre.classe.classeId}/${jury.annee._id}`);
      console.log("Données de la classe récupérées:", response);
      
      setClasseData(response);

      // Extraire les étudiants selon le semestre sélectionné
      let etudiants: any[] = [];
      let unites: any[] = [];

      // Chercher le bon semestre dans la réponse
      const semestreData = response.data.semestres.find((s: any) => s.semestreId === semestre.semestreId);
      if (semestreData) {
        etudiants = semestreData.etudiants || [];
        unites = semestreData.unites || [];
      }

      // Transformer les données pour l'affichage
      const studentsData = etudiants.map((etudiant: any) => {
        // Calculer la moyenne et les statistiques
        let totalNotes = 0;
        let totalCredits = 0;
        let ncv = 0;
        let ncnv = 0;

        unites.forEach((unite: any) => {
          let moyenneUnite = 0;
          let totalCoursCredits = 0;

          unite.cours?.forEach((cours: any) => {
            const noteValue = etudiant.notes?.[unite._id]?.[cours.coursId];
            if (noteValue !== undefined && noteValue !== null && !isNaN(Number(noteValue))) {
              moyenneUnite += Number(noteValue) * cours.credit;
              totalCoursCredits += cours.credit;
            }
          });

          if (totalCoursCredits > 0) {
            moyenneUnite = moyenneUnite / totalCoursCredits;
            totalNotes += moyenneUnite * unite.credit;
            totalCredits += unite.credit;

            if (moyenneUnite >= 10) {
              ncv += unite.credit;
            } else {
              ncnv += unite.credit;
            }
          }
        });

        const moyenne = totalCredits > 0 ? totalNotes / totalCredits : 0;
        
        // Déterminer la décision automatique
        let decision = 'redoublement';
        if (ncv > 0 && ncnv > 0) {
          const pourcentageValidation = (ncv / (ncv + ncnv)) * 100;
          if (pourcentageValidation >= 60) {
            decision = moyenne >= 12 ? 'passage' : 'passage conditionnel';
          }
        } else if (ncv > 0 && ncnv === 0) {
          decision = 'passage';
        }

        return {
          id: etudiant._id,
          nom: etudiant.nom,
          postnom: etudiant.postnom,
          prenom: etudiant.prenom,
          matricule: etudiant.matricule,
          notes: etudiant.notes || {},
          moyenne: moyenne,
          ncv: ncv,
          ncnv: ncnv,
          decision: decision,
          originalData: etudiant
        };
      });

      setStudents(studentsData);
      console.log("Étudiants transformés:", studentsData);

    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error);
      alert("Erreur lors du chargement des étudiants. Utilisation des données de démonstration.");
      setStudents(mockStudents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecisionChange = (studentId: string, decision: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, decision }
        : student
    ));
  };

  const handleEditNotes = (studentId: string) => {
    setEditingStudent(studentId);
  };

  const handleSaveNotes = (studentId: string, newNotes: any) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        // Recalculer la moyenne avec les nouvelles notes (format CMI/Examen/Rattrapage)
        let totalNotes = 0;
        let totalCredits = 0;
        let ncv = 0;
        let ncnv = 0;

        // Récupérer les unités du semestre
        const semestreData = classeData?.data.semestres.find((s: any) => s.semestreId === semestre.semestreId);
        const unites = semestreData?.unites || [];

        // Fonction de calcul du total comme dans FicheCotation
        const calculateCoursTotal = (cmi: number = 0, examen: number = 0, rattrapage: number = 0) => {
          const totalNormal = cmi + examen;
          if (rattrapage > 0 && rattrapage > totalNormal) {
            return Math.round(rattrapage * 100) / 100;
          }
          return Math.round(totalNormal * 100) / 100;
        };

        unites.forEach((unite: any) => {
          let moyenneUnite = 0;
          let totalCoursCredits = 0;

          unite.cours?.forEach((cours: any) => {
            const coursNotes = newNotes[unite.uniteId]?.[cours.coursId] || {};
            const cmi = coursNotes.cmi || 0;
            const examen = coursNotes.examen || 0;
            const rattrapage = coursNotes.rattrapage || 0;
            
            // Calculer le total du cours selon la logique de FicheCotation
            const totalCours = calculateCoursTotal(cmi, examen, rattrapage);
            
            if (totalCours > 0) {
              moyenneUnite += totalCours * cours.credit;
              totalCoursCredits += cours.credit;
            }
          });

          if (totalCoursCredits > 0) {
            moyenneUnite = moyenneUnite / totalCoursCredits;
            totalNotes += moyenneUnite * unite.credit;
            totalCredits += unite.credit;

            if (moyenneUnite >= 10) {
              ncv += unite.credit;
            } else {
              ncnv += unite.credit;
            }
          }
        });

        const moyenne = totalCredits > 0 ? totalNotes / totalCredits : 0;
        
        // Déterminer la décision automatique
        let decision = 'redoublement';
        if (ncv > 0 && ncnv > 0) {
          const pourcentageValidation = (ncv / (ncv + ncnv)) * 100;
          if (pourcentageValidation >= 60) {
            decision = moyenne >= 12 ? 'passage' : 'passage conditionnel';
          }
        } else if (ncv > 0 && ncnv === 0) {
          decision = 'passage';
        }

        return { 
          ...student, 
          notes: newNotes, 
          moyenne: moyenne,
          ncv: ncv,
          ncnv: ncnv,
          decision: decision
        };
      }
      return student;
    }));
    setEditingStudent(null);
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
      
      if (!classeData) {
        alert('Données de la classe non disponibles');
        return;
      }

      // Construire les données pour le document Excel
      const anneeAcademique = `${jury.annee.debut}-${jury.annee.fin}`;
      const data = toGrilleDocumentData(classeData, anneeAcademique, sessionType);
      
      // Générer le nom du fichier
      const filename = `grille_deliberation_${semestre.classe.designation}_${semestre.designation}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Télécharger la grille
      await GrilleDocument.downloadGrille(jury, data, filename);
      
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
        
        {/* Options et Bouton Imprimer Grille */}
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de Session
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'principale' | 'rattrapage' | 'annuelle')}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="principale">Session Principale</option>
              <option value="rattrapage">Session de Rattrapage</option>
              <option value="annuelle">Grille Annuelle</option>
            </select>
          </div>
          
          <button
            onClick={handleExportGrille}
            disabled={isExporting || students.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
                      <button 
                        onClick={() => handleEditNotes(student.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Modifier Notes
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

      {/* Modal de modification des notes */}
      {editingStudent && (
        <EditNotesModal
          student={students.find(s => s.id === editingStudent)}
          semestre={semestre}
          classeData={classeData}
          onSave={handleSaveNotes}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}

// Composant Modal pour modifier les notes
function EditNotesModal({ student, semestre, classeData, onSave, onClose }: {
  student: any;
  semestre: any;
  classeData: any;
  onSave: (studentId: string, notes: any) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(student?.notes || {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  if (!student || !classeData) return null;

  console.log("========DEBUG EditNotesModal=======")
  console.log("student", student)
  console.log("semestre", semestre)
  console.log("classeData", classeData)
  // Récupérer les unités du semestre
  const semestreData = classeData.data.semestres.find((s: any) => s.semestreId === semestre.semestreId);
  const unites = semestreData?.unites || [];

  // Validation des valeurs saisies - inspiré de FicheCotation
  const validateAndParseValue = (value: string, field: 'cmi' | 'examen' | 'rattrapage') => {
    if (!value || value.trim() === '') {
      return { isValid: true, value: 0, error: null };
    }
    
    const normalizedValue = value.replace(',', '.');
    const numValue = parseFloat(normalizedValue);
    
    if (isNaN(numValue) || !isFinite(numValue)) {
      return { isValid: false, value: 0, error: 'Format invalide' };
    }
    
    const limits = {
      cmi: { min: 0, max: 10 },
      examen: { min: 0, max: 10 },
      rattrapage: { min: 0, max: 20 }
    };
    
    const { min, max } = limits[field];
    
    if (numValue < min) {
      return { isValid: false, value: numValue, error: `Minimum: ${min}` };
    }
    
    if (numValue > max) {
      return { isValid: false, value: numValue, error: `Maximum: ${max}` };
    }
    
    return { isValid: true, value: numValue, error: null };
  };

  // Calcul du total - inspiré de FicheCotation
  const calculateTotal = (cmi: number = 0, examen: number = 0, rattrapage: number = 0) => {
    const totalNormal = cmi + examen;
    if (rattrapage > 0 && rattrapage > totalNormal) {
      return Math.round(rattrapage * 100) / 100;
    }
    return Math.round(totalNormal * 100) / 100;
  };


  // Gestion des changements de notes avec validation et sauvegarde automatique - inspiré de FicheCotation
  const handleNoteChange = (uniteId: string, coursId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => {
    const validation = validateAndParseValue(value, field);
    const errorKey = `${uniteId}_${coursId}_${field}`;
    
    // Mise à jour des erreurs dans un état séparé
    setFieldErrors(prev => ({
      ...prev,
      [errorKey]: validation.error
    }));
    
    // Mise à jour immédiate de l'affichage (même si invalide pour le feedback)
    setNotes((prev: any) => ({
      ...prev,
      [uniteId]: {
        ...prev[uniteId],
        [coursId]: {
          ...prev[uniteId]?.[coursId],
          [field]: validation.value
        }
      }
    }));

    // Sauvegarde automatique seulement si valide
    if (validation.isValid) {
      // Utiliser la fonction définie après allCours
      setTimeout(() => {
        triggerAutoSave(uniteId, coursId, field, validation.value);
      }, 0); // Délai minimal pour que triggerAutoSave soit définie
    }
  };

  // Obtenir les couleurs selon la note
  const getGradeColor = (total: number) => {
    if (total >= 16) return 'text-green-600 dark:text-green-400';
    if (total >= 14) return 'text-blue-600 dark:text-blue-400';
    if (total >= 12) return 'text-yellow-600 dark:text-yellow-400';
    if (total >= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleSave = () => {
    // Ne s'occupe que de la persistance locale
    // La sauvegarde serveur se fait automatiquement via autoSaveFiche
    onSave(student.id, notes);
  };

  // Créer une liste plate de tous les cours avec leurs unités
  // Filtrer seulement les cours où l'étudiant a une fiche (est inscrit)
  const allCours: Array<{
    unite: any;
    cours: any;
    index: number;
    hasFiche: boolean;
    ficheData?: any;
  }> = [];

  unites.forEach((unite: any) => {
    unite.cours?.forEach((cours: any) => {
      // Vérifier si l'étudiant a une fiche pour ce cours
      console.log("cours", cours)
      const ficheData = cours.fiches.length > 0 && cours.fiches?.find((fiche: any) => fiche && fiche.etudiantId._id === student.id);
      const hasFiche = !!ficheData;
      
      // Ajouter tous les cours mais marquer ceux avec/sans fiche
      allCours.push({
        unite,
        cours,
        index: allCours.length + 1,
        hasFiche,
        ficheData
      });
    });
  });

  // Sauvegarde automatique avec calcul du status - inspiré de FicheCotation
  const autoSaveFiche = async (ficheId: string, field: 'cmi' | 'examen' | 'rattrapage', value: number) => {
    setLoading(true);
    try {
      // Calculer le nouveau status basé sur le total
      // D'abord, récupérer la fiche actuelle pour avoir les autres valeurs
      const currentFiche = allCours.find(c => c.ficheData?._id === ficheId)?.ficheData;
      if (!currentFiche) {
        console.error('Fiche non trouvée:', ficheId);
        return;
      }

      const updatedData = { ...currentFiche, [field]: value };
      const total = calculateTotal(updatedData.cmi || 0, updatedData.examen || 0, updatedData.rattrapage || 0);
      
      // Calcul automatique du status
      const newStatus = total >= 10 ? 'OK' : 'PENDING';
      
      // Utiliser ChargeService pour mettre à jour la fiche
      const ChargeService = (await import('@/services/ChargeService')).default;
      await ChargeService.updateFiche(ficheId, {
        [field]: value,
        status: newStatus
      });
      
      console.log(`Fiche ${ficheId} sauvegardée: ${field} = ${value}, status = ${newStatus}`);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déclencher la sauvegarde automatique avec délai
  const triggerAutoSave = (uniteId: string, coursId: string, field: 'cmi' | 'examen' | 'rattrapage', value: number) => {
    // Trouver la fiche correspondante
    const coursItem = allCours.find(c => c.unite.uniteId === uniteId && c.cours.coursId === coursId);
    if (coursItem && coursItem.hasFiche && coursItem.ficheData) {
      const errorKey = `${uniteId}_${coursId}_${field}`;
      setTimeout(() => {
        autoSaveFiche(coursItem.ficheData._id, field, value);
        // Nettoyer l'erreur après sauvegarde réussie
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }, 1000); // 1 seconde de délai comme dans FicheCotation
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Modifier les Notes - Délibération
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {student.nom} {student.postnom} {student.prenom} - {student.matricule}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Légende du système de notation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Système de notation - Format Charge Horaire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium text-blue-700 dark:text-blue-300">CMI (0-10 pts)</span>
                <p className="text-blue-600 dark:text-blue-400">Cours Magistral Interactif</p>
              </div>
              <div>
                <span className="font-medium text-blue-700 dark:text-blue-300">Examen (0-10 pts)</span>
                <p className="text-blue-600 dark:text-blue-400">Note d'examen final</p>
              </div>
              <div>
                <span className="font-medium text-blue-700 dark:text-blue-300">Rattrapage (0-20 pts)</span>
                <p className="text-blue-600 dark:text-blue-400">Remplace CMI+Examen si supérieur</p>
              </div>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ⚠️ <strong>Important :</strong> Seuls les cours où l'étudiant est inscrit (a une fiche) peuvent être modifiés.
                Les cours grisés indiquent une absence d'inscription.
              </p>
            </div>
          </div>

          {/* Tableau des notes - Format charge horaire */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notes par Cours ({allCours.length} cours)
                </h3>
                <div className="flex items-center space-x-4">
                  {loading && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Sauvegarde...
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {allCours.filter(c => c.hasFiche).length} modifiables • {allCours.filter(c => !c.hasFiche).length} non inscrits
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      N°
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CMI (/10)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Examen (/10)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rattrapage (/20)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total (/20)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Crédit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allCours.map((item) => {
                    const { unite, cours, index, hasFiche, ficheData } = item;
                    
                    // Si l'étudiant a une fiche, utiliser les notes du modal, sinon utiliser les notes de la fiche
                    let coursNotes : any = {};
                    if (hasFiche && ficheData) {
                      // Prioriser les notes du modal, sinon utiliser celles de la fiche
                      coursNotes = notes[unite.uniteId]?.[cours.coursId] || {
                        cmi: ficheData.cmi || 0,
                        examen: ficheData.examen || 0,
                        rattrapage: ficheData.rattrapage || 0
                      };
                    }
                    
                    const cmi = coursNotes.cmi || 0;
                    const examen = coursNotes.examen || 0;
                    const rattrapage = coursNotes.rattrapage || 0;
                    const total = calculateTotal(cmi, examen, rattrapage);
                    const status = total >= 10 ? 'VALIDÉ' : 'ÉCHEC';

                    // Styles pour les cours sans fiche
                    const rowClass = hasFiche 
                      ? "hover:bg-gray-50 dark:hover:bg-gray-700" 
                      : "bg-gray-100 dark:bg-gray-700 opacity-60";
                    
                    const textClass = hasFiche 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-gray-400";

                    return (
                      <tr key={`${unite.uniteId}_${cours.coursId}`} className={rowClass}>
                        {/* N° */}
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                          {index}
                        </td>
                        
                        {/* Cours */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${textClass} flex items-center`}>
                            {cours.titre}
                            {!hasFiche && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                                Non inscrit
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {unite.code} - {unite.designation}
                          </div>
                        </td>
                        
                        {/* CMI */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasFiche ? (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="0-10"
                                value={cmi || ''}
                                onChange={(e) => handleNoteChange(unite.uniteId, cours.coursId, 'cmi', e.target.value)}
                                className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                  fieldErrors[`${unite.uniteId}_${cours.coursId}_cmi`] 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                              {fieldErrors[`${unite.uniteId}_${cours.coursId}_cmi`] && (
                                <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                                  {fieldErrors[`${unite.uniteId}_${cours.coursId}_cmi`]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        
                        {/* Examen */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasFiche ? (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="0-10"
                                value={examen || ''}
                                onChange={(e) => handleNoteChange(unite.uniteId, cours.coursId, 'examen', e.target.value)}
                                className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                  fieldErrors[`${unite.uniteId}_${cours.coursId}_examen`] 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                              {fieldErrors[`${unite.uniteId}_${cours.coursId}_examen`] && (
                                <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                                  {fieldErrors[`${unite.uniteId}_${cours.coursId}_examen`]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        
                        {/* Rattrapage */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasFiche ? (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="0-20"
                                value={rattrapage || ''}
                                onChange={(e) => handleNoteChange(unite.uniteId, cours.coursId, 'rattrapage', e.target.value)}
                                className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                  fieldErrors[`${unite.uniteId}_${cours.coursId}_rattrapage`] 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                              />
                              {fieldErrors[`${unite.uniteId}_${cours.coursId}_rattrapage`] && (
                                <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
                                  {fieldErrors[`${unite.uniteId}_${cours.coursId}_rattrapage`]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        
                        {/* Total */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasFiche ? (
                            <span className={`text-sm font-medium ${getGradeColor(total)}`}>
                              {total.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        
                        {/* Crédit */}
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                          {cours.credit}
                        </td>
                        
                        {/* Statut */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasFiche ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'VALIDÉ' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400">
                              NON INSCRIT
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sauvegarder les Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
