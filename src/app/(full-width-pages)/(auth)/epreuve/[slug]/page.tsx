'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-interro.he-section.site/api/v1';
console.log("API_URL", API_URL)
export default function EpreuvePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [groupeId, setGroupeId] = useState<string>('');
  const [etudiantId, setEtudiantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [groupDetail, setGroupDetail] = useState<{
    _id: string;
    designation: string;
    statut: string;
    titulaire: {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
        sexe: string;
    },
    serieId: string;
    questions:[{
        _id: string;
        enonce: string;
        pts: number;
        assertions:string[]
    }]
  } | null>(null);
  const [etudiantDetail, setEtudiantDetail] = useState<{
    _id: string;
    nom: string;
    prenom: string;
    matricule: string;
    post_nom: string;
  } | null>(null);
  const [resultat, setResultat] = useState<{
    _id: string;
    noteMaximale: number;
    noteObtenue: number;
    pourcentage: number;
  } | null>(null);

  // États pour le système d'épreuve
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[questionId: string]: string}>({});
  const [isEpreuveStarted, setIsEpreuveStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlreadyDoneModal, setShowAlreadyDoneModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchGroupDetail = async (id: string) => {
    try {
      console.log("Fetching group detail for group ID:", id);
      const response = await fetch(`${API_URL}/groupe/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Groupe detail", data);
      
      if (data) {
        setGroupDetail(data);
        return data;
      } else {
        throw new Error('Groupe non trouvé ou accès non autorisé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du groupe:', error);
      setError('Impossible d\'accéder à ce groupe. Veuillez contacter le titulaire du cours.');
      return null;
    }
  };

  const fetchEtudiantDetail = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/etudiant/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Etudiant detail", data);
      
      if (data) {
        setEtudiantDetail(data);
        return data;
      } else {
        throw new Error('Étudiant non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'etudiant:', error);
      return null;
    }
  };

  // Fonction pour mélanger les questions
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fonction pour démarrer l'épreuve
  const startEpreuve = async () => {
    try {
        const request = await fetch(`${API_URL}/resolution/etudiant/${etudiantId}`);
        const response = await request.json();
        console.log("Response", response.length);
        if(response.length === 0){
            if (groupDetail?.questions && groupDetail.questions.length > 0) {
              const shuffled = shuffleArray(groupDetail.questions);
              setShuffledQuestions(shuffled);
              setIsEpreuveStarted(true);
              setCurrentQuestionIndex(0);
            }
        } else {
            // L'étudiant a déjà fait l'épreuve
            setShowAlreadyDoneModal(true);
        }

    } catch (error) {
        console.error('Erreur lors du démarrage de l\'épreuve:', error);
        setError('Impossible de démarrer l\'épreuve. Veuillez contacter le titulaire du cours.');
    }
  };

  // Navigation entre questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Gérer les réponses
  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Afficher le résumé avant soumission
  const showSubmissionSummary = () => {
    setShowSummary(true);
  };

  // Soumettre définitivement
  const submitFinalAnswer = async () => {
    setIsSubmitting(true);
    try {
      // Ici on pourrait envoyer les réponses à l'API
      const payload = {
        etudiantId: etudiantDetail?._id,
        serieId: groupDetail?.serieId,
        reponses: userAnswers
      }
      
      const response = await fetch(`${API_URL}/resolution/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Réponses soumises:', data);

      if(data){
        setResultat(data);
        setShowSummary(false);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour générer le PDF des résultats
  const generateResultsPDF = async () => {
    if (!resultat || !etudiantDetail || !groupDetail) return;
    
    setIsGeneratingPDF(true);
    try {
      // Importer pdfmake dynamiquement
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      pdfMake.vfs = pdfFonts.vfs;

      const content: any[] = [
        // En-tête
        {
          text: 'RÉSULTATS D\'ÉPREUVE',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },

        // Informations étudiant
        {
          table: {
            widths: ['25%', '75%'],
            body: [
              [
                { text: 'Étudiant:', style: 'labelStyle' },
                { text: `${etudiantDetail.nom} ${etudiantDetail.prenom}`, style: 'valueStyle', bold: true }
              ],
              [
                { text: 'Matricule:', style: 'labelStyle' },
                { text: etudiantDetail.matricule, style: 'valueStyle' }
              ],
              [
                { text: 'Groupe:', style: 'labelStyle' },
                { text: groupDetail.designation, style: 'valueStyle' }
              ],
              [
                { text: 'Date:', style: 'labelStyle' },
                { text: new Date().toLocaleDateString('fr-FR'), style: 'valueStyle' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 30]
        },

        // Résultats
        {
          text: 'RÉSULTATS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },

        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: [
                    { text: resultat.noteObtenue.toString(), fontSize: 24, bold: true, color: '#059669' },
                    { text: '\nNote obtenue', fontSize: 12, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#f0fdf4',
                  margin: [0, 15, 0, 15]
                },
                {
                  text: [
                    { text: resultat.noteMaximale.toString(), fontSize: 24, bold: true, color: '#dc2626' },
                    { text: '\nNote maximale', fontSize: 12, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#fef2f2',
                  margin: [0, 15, 0, 15]
                },
                {
                  text: [
                    { text: `${resultat.pourcentage}%`, fontSize: 24, bold: true, color: '#2563eb' },
                    { text: '\nPourcentage', fontSize: 12, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#eff6ff',
                  margin: [0, 15, 0, 15]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb'
          },
          margin: [0, 0, 0, 30]
        },

        // Détail des réponses
        {
          text: 'DÉTAIL DES RÉPONSES',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        }
      ];

      // Ajouter chaque question et réponse
      shuffledQuestions.forEach((question, index) => {
        content.push({
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    {
                      text: `Question ${index + 1} (${question.pts} pts)`,
                      style: 'questionHeader',
                      margin: [0, 0, 0, 5]
                    },
                    {
                      text: question.enonce,
                      style: 'questionText',
                      margin: [0, 0, 0, 10]
                    },
                    {
                      text: [
                        { text: 'Votre réponse: ', bold: true, color: '#374151' },
                        { text: userAnswers[question._id] || 'Aucune réponse', color: '#1f2937' }
                      ],
                      margin: [0, 0, 0, 5]
                    }
                  ],
                  fillColor: '#f9fafb'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb'
          },
          margin: [0, 0, 0, 10]
        });
      });

      // Pied de page
      content.push({
        columns: [
          {
            width: '50%',
            text: [
              { text: 'Document généré le: ', fontSize: 8, color: '#6b7280' },
              { text: new Date().toLocaleDateString('fr-FR'), fontSize: 8, color: '#374151' }
            ]
          },
          {
            width: '50%',
            text: [
              { text: 'Système Institut Admin', fontSize: 8, color: '#6b7280' }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 40, 0, 0]
      });

      const documentDefinition: any = {
        content,
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            color: '#1f2937'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#7c3aed',
            decoration: 'underline'
          },
          labelStyle: {
            fontSize: 11,
            bold: true,
            color: '#374151'
          },
          valueStyle: {
            fontSize: 11,
            color: '#1f2937'
          },
          questionHeader: {
            fontSize: 12,
            bold: true,
            color: '#7c3aed'
          },
          questionText: {
            fontSize: 10,
            color: '#4b5563'
          }
        },
        defaultStyle: {
          fontSize: 10
        },
        pageMargins: [40, 60, 40, 60] as [number, number, number, number]
      };

      const fileName = `resultats_${etudiantDetail.matricule}_${groupDetail.designation.replace(/\s+/g, '_')}.pdf`;
      pdfMake.createPdf(documentDefinition).download(fileName);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (slug) {
      try {
        // Séparer le slug au format "groupeId-etudiantId"
        const parts = slug.split('-');
        
        if (parts.length >= 2) {
          // Le groupeId est la première partie
          const extractedGroupeId = parts[0];
          // L'etudiantId est tout ce qui suit le premier tiret
          const extractedEtudiantId = parts.slice(1).join('-');
          console.log("Extracted group ID:", extractedGroupeId);
          console.log("Extracted etudiant ID:", extractedEtudiantId);
          setGroupeId(extractedGroupeId);
          setEtudiantId(extractedEtudiantId);
          setError('');
          fetchGroupDetail(extractedGroupeId);
          fetchEtudiantDetail(extractedEtudiantId);
        } else {
          setError('Format de slug invalide. Attendu: groupeId-etudiantId');
        }
      } catch (err) {
        setError('Erreur lors du parsing du slug');
        console.error('Erreur parsing slug:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement de l'épreuve...</span>
      </div>
    );
  }

  // Modal pour épreuve déjà faite
  if (showAlreadyDoneModal) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Épreuve déjà effectuée</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vous avez déjà passé cette épreuve. Pour des raisons de sécurité, vous ne pouvez pas la repasser.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Pour plus d'informations :</h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                  <li>• Contactez le titulaire du cours</li>
                  <li>• Demandez vos résultats</li>
                  <li>• Vérifiez votre performance</li>
                </ul>
                
                {groupDetail?.titulaire && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Titulaire :</strong> {groupDetail.titulaire.nom} {groupDetail.titulaire.prenom}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Email :</strong> {groupDetail.titulaire.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowAlreadyDoneModal(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des résultats après soumission
  if (showResults && resultat) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Bannière d'informations */}
        {groupDetail && etudiantDetail && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6 mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">🎉 Épreuve terminée !</h1>
              <p className="opacity-90">Félicitations {etudiantDetail.prenom}, voici vos résultats</p>
            </div>
          </div>
        )}

        {/* Résultats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Vos résultats</h2>
          
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {resultat.noteObtenue}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">Note obtenue</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {resultat.noteMaximale}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Note maximale</div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {resultat.pourcentage}%
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Pourcentage</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{resultat.pourcentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  resultat.pourcentage >= 80 ? 'bg-green-500' :
                  resultat.pourcentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${resultat.pourcentage}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateResultsPDF}
              disabled={isGeneratingPDF}
              className={`px-6 py-3 rounded-lg transition-colors ${
                isGeneratingPDF 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger le PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message de fin */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Merci d'avoir participé à cette épreuve. Vous pouvez maintenant fermer cette page.
          </p>
          {groupDetail?.titulaire && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Pour toute question, contactez {groupDetail.titulaire.nom} {groupDetail.titulaire.prenom} ({groupDetail.titulaire.email})
            </p>
          )}
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl font-bold text-red-800 dark:text-red-200">Accès refusé</h1>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <div className="bg-red-100 dark:bg-red-800/30 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Que faire ?</h3>
            <ul className="text-red-700 dark:text-red-300 space-y-1">
              <li>• Vérifiez que le lien QR code est correct</li>
              <li>• Contactez le titulaire du cours</li>
              <li>• Assurez-vous d'être autorisé à passer cette épreuve</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Affichage du résumé avant soumission
  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Bannière d'informations */}
        {groupDetail && etudiantDetail && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Étudiant</h3>
                <p>{etudiantDetail.nom} {etudiantDetail.prenom}</p>
                <p className="text-sm opacity-90">Mat: {etudiantDetail.matricule}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Groupe</h3>
                <p>{groupDetail.designation}</p>
                <p className="text-sm opacity-90">Statut: {groupDetail.statut}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Titulaire</h3>
                <p>{groupDetail.titulaire.nom} {groupDetail.titulaire.prenom}</p>
                <p className="text-sm opacity-90">{groupDetail.titulaire.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Résumé des réponses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Résumé de vos réponses</h2>
          
          <div className="space-y-4">
            {shuffledQuestions.map((question, index) => (
              <div key={question._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Question {index + 1} ({question.pts} pts)
                  </h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    userAnswers[question._id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userAnswers[question._id] ? 'Répondue' : 'Non répondue'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{question.enonce}</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Votre réponse:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {userAnswers[question._id] || 'Aucune réponse'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setShowSummary(false)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Retour aux questions
            </button>
            <button
              onClick={submitFinalAnswer}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Soumission...
                </>
              ) : (
                'Soumettre définitivement'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bannière d'informations */}
      {groupDetail && etudiantDetail && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Étudiant</h3>
              <p>{etudiantDetail.nom} {etudiantDetail.prenom}</p>
              <p className="text-sm opacity-90">Mat: {etudiantDetail.matricule}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Groupe</h3>
              <p>{groupDetail.designation}</p>
              <p className="text-sm opacity-90">Statut: {groupDetail.statut}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Titulaire</h3>
              <p>{groupDetail.titulaire.nom} {groupDetail.titulaire.prenom}</p>
              <p className="text-sm opacity-90">{groupDetail.titulaire.email}</p>
            </div>
          </div>
          
          {!isEpreuveStarted && groupDetail.questions && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Questions disponibles: {groupDetail.questions.length}</p>
                  <p className="text-sm opacity-90">Points total: {groupDetail.questions.reduce((sum, q) => sum + q.pts, 0)}</p>
                </div>
                <button
                  onClick={startEpreuve}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Commencer l'épreuve
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interface d'épreuve */}
      {isEpreuveStarted && shuffledQuestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} sur {shuffledQuestions.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {shuffledQuestions[currentQuestionIndex]?.pts} points
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question actuelle */}
          {shuffledQuestions[currentQuestionIndex] && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {shuffledQuestions[currentQuestionIndex].enonce}
              </h2>
              
              <div className="space-y-3">
                {shuffledQuestions[currentQuestionIndex].assertions.map((assertion: string, index: number) => (
                  <label key={index} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${shuffledQuestions[currentQuestionIndex]._id}`}
                      value={assertion}
                      checked={userAnswers[shuffledQuestions[currentQuestionIndex]._id] === assertion}
                      onChange={(e) => handleAnswerChange(shuffledQuestions[currentQuestionIndex]._id, e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-900 dark:text-white">{assertion}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Précédent
            </button>

            <div className="flex space-x-3">
              {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                <button
                  onClick={showSubmissionSummary}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Terminer l'épreuve
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Suivant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}