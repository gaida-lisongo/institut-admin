'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";

interface StudentData {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  matricule: string;
  groupe: {
    _id: string;
    designation: string;
    statut: string;
    userId: string;
    serieId: {
        _id: string;
        questions: {
            _id: string;
            enonce: string;
            pts: number;
            assertions: string[];
        }[];
    };
  };
  cours: {
    _id: string;
    designation: string;
    unite: string;
    credit: number;
    semestre: string;
  };
  reponses: {
    questionId: string;
    pts: number;
  }[];
}

export default function StudentsTable() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  
  const {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    emit,
    on,
    off,
  } = useSocket();

  // Configuration des listeners (une seule fois)
  useEffect(() => {
    console.log('🔌 Configuration des événements Socket.IO pour les étudiants');
    
    const handleStudentsData = (data: StudentData[]) => {
      console.log('✅ Étudiants reçus:', data);
      setStudents(data || []);
      setIsLoading(false);
      setLastUpdate(new Date());
      
      // Si on reçoit des données, désactiver le polling
      if (isPollingEnabled) {
        console.log('📡 Données reçues via Socket.IO - Désactivation du polling');
        setIsPollingEnabled(false);
      }
    };

    // Écouter l'événement avec la fonction helper
    on('allStudents', handleStudentsData);

    // Nettoyage
    return () => {
      console.log('🧹 Nettoyage événement allStudents');
      off('allStudents', handleStudentsData);
    };
  }, [on, off]);

  // Demander les données automatiquement quand la connexion change
  useEffect(() => {
    if (isConnected) {
      console.log('📤 Connexion établie - Demande automatique des étudiants...');
      setIsLoading(true);
      
      // Petit délai pour s'assurer que la connexion est stable
      const timer = setTimeout(() => {
        emit('allStudents', {});
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      console.log('❌ Socket déconnecté');
      setIsLoading(false);
    }
  }, [isConnected, emit]);

  // Système de polling intelligent comme fallback
  useEffect(() => {
    if (!isConnected || !isPollingEnabled) return;

    console.log('🔄 Activation du polling de fallback (10s)');
    
    const pollInterval = setInterval(() => {
      console.log('📊 Polling des données étudiants...');
      emit('allStudents', {});
    }, 10000); // 10 secondes

    return () => {
      console.log('🛑 Arrêt du polling');
      clearInterval(pollInterval);
    };
  }, [isConnected, isPollingEnabled, emit]);

  // Détecter si le serveur n'envoie pas de mises à jour temps réel
  useEffect(() => {
    if (!isConnected || !lastUpdate) return;

    // Si aucune mise à jour reçue depuis 30 secondes, activer le polling
    const checkInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
      
      if (timeSinceLastUpdate > 30000 && !isPollingEnabled) { // 30 secondes
        console.log('⚠️ Aucune mise à jour temps réel détectée - Activation du polling de fallback');
        setIsPollingEnabled(true);
      }
    }, 15000); // Vérifier toutes les 15 secondes

    return () => clearInterval(checkInterval);
  }, [isConnected, lastUpdate, isPollingEnabled]);

  // Effet pour écouter les mises à jour en temps réel
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔄 Configuration des événements temps réel');

    const handleStudentUpdate = (updatedStudent: StudentData) => {
      console.log('🔄 Mise à jour étudiant:', updatedStudent);
      setStudents(prev => 
        prev.map(student => 
          student._id === updatedStudent._id ? updatedStudent : student
        )
      );
      setLastUpdate(new Date());
      
      // Désactiver le polling si on reçoit des mises à jour temps réel
      if (isPollingEnabled) {
        console.log('📡 Mise à jour temps réel reçue - Désactivation du polling');
        setIsPollingEnabled(false);
      }
    };

    const handleNewStudent = (newStudent: StudentData) => {
      console.log('➕ Nouvel étudiant:', newStudent);
      setStudents(prev => [...prev, newStudent]);
      setLastUpdate(new Date());
      
      if (isPollingEnabled) {
        console.log('📡 Nouvel étudiant temps réel - Désactivation du polling');
        setIsPollingEnabled(false);
      }
    };

    const handleStudentDeleted = (studentId: string) => {
      console.log('🗑️ Étudiant supprimé:', studentId);
      setStudents(prev => prev.filter(student => student._id !== studentId));
      setLastUpdate(new Date());
      
      if (isPollingEnabled) {
        console.log('📡 Suppression temps réel - Désactivation du polling');
        setIsPollingEnabled(false);
      }
    };

    // Écouter les événements de mise à jour avec les helpers
    on('studentUpdated', handleStudentUpdate);
    on('studentAdded', handleNewStudent);
    on('studentDeleted', handleStudentDeleted);

    return () => {
      off('studentUpdated', handleStudentUpdate);
      off('studentAdded', handleNewStudent);
      off('studentDeleted', handleStudentDeleted);
    };
  }, [isConnected, on, off]);

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    if (isConnected) {
      console.log('🔄 Rafraîchissement manuel des données');
      setIsLoading(true);
      emit('allStudents', {});
    }
  };

  // Fonction pour calculer la note totale obtenue
  const calculateTotalScore = (student: StudentData): number => {
    if (!student.reponses || student.reponses.length === 0) return 0;
    return student.reponses.reduce((total, reponse) => total + (reponse.pts || 0), 0);
  };

  // Fonction pour calculer la note maximale possible
  const calculateMaxScore = (student: StudentData): number => {
    if (!student.groupe?.serieId?.questions || student.groupe.serieId.questions.length === 0) return 0;
    return student.groupe.serieId.questions.reduce((total, question) => total + (question.pts || 0), 0);
  };

  // Fonction pour filtrer les étudiants selon le terme de recherche
  const filteredStudents = students.filter(student => {
    const fullName = `${student.nom} ${student.prenom} ${student.post_nom}`.toLowerCase();
    const matricule = student.matricule.toLowerCase();
    const groupeName = student.groupe?.designation?.toLowerCase() || '';
    const courseName = student.cours?.designation?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           matricule.includes(searchTerm.toLowerCase()) ||
           groupeName.includes(searchTerm.toLowerCase()) ||
           courseName.includes(searchTerm.toLowerCase());
  });

  // Fonction pour obtenir la couleur du badge selon la performance
  const getPerformanceBadgeColor = (score: number, maxScore: number): "success" | "warning" | "error" => {
    if (maxScore === 0) return "error";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Résultats des Étudiants
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} trouvé{filteredStudents.length > 1 ? 's' : ''}
            </p>
            {isPollingEnabled && (
              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Mode polling actif</span>
              </div>
            )}
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Dernière MAJ: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Bouton de rafraîchissement */}
          <button
            onClick={refreshData}
            disabled={!isConnected || isLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-theme-sm font-medium shadow-theme-xs transition-colors ${
              isConnected && !isLoading
                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600'
            }`}
          >
            <svg 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>

          {/* Boutons pour contrôler le polling */}
          {isPollingEnabled ? (
            <button
              onClick={() => {
                console.log('🚫 Désactivation manuelle du polling');
                setIsPollingEnabled(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-theme-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              Arrêter polling
            </button>
          ) : (
            <button
              onClick={() => {
                console.log('🔄 Activation manuelle du polling');
                setIsPollingEnabled(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-theme-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Activer polling
            </button>
          )}

          {/* Indicateur de connexion */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 
              reconnectAttempts > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connecté' : 
               reconnectAttempts > 0 ? `Reconnexion... (${reconnectAttempts})` : 'Déconnecté'}
            </span>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des étudiants...</span>
        </div>
      )}

      {/* Erreur de connexion */}
      {connectionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300">Erreur de connexion: {connectionError}</span>
          </div>
        </div>
      )}

      {/* Tableau des étudiants */}
      {!isLoading && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* En-tête du tableau */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Étudiant
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Groupe
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cours
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Note
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Corps du tableau */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell className="py-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Aucun étudiant trouvé pour cette recherche' : 'Aucun étudiant disponible'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-8">&nbsp;</TableCell>
                  <TableCell className="py-8">&nbsp;</TableCell>
                  <TableCell className="py-8">&nbsp;</TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const totalScore = calculateTotalScore(student);
                  const maxScore = calculateMaxScore(student);
                  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

                  return (
                    <TableRow key={student._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      {/* Colonne Étudiant */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                              {student.prenom.charAt(0)}{student.nom.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {student.nom} {student.prenom}
                            </p>
                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                              Mat: {student.matricule}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Colonne Groupe */}
                      <TableCell className="py-3">
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {student.groupe?.designation || 'N/A'}
                          </p>
                          <Badge
                            size="sm"
                            color={
                              student.groupe?.statut === "active" ? "success" :
                              student.groupe?.statut === "fermé" ? "error" : "warning"
                            }
                          >
                            {student.groupe?.statut || 'Inconnu'}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Colonne Cours */}
                      <TableCell className="py-3">
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {student.cours?.designation || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                            <span>{student.cours?.unite || 'N/A'}</span>
                            <span>•</span>
                            <span>{student.cours?.credit || 0} crédits</span>
                            <span>•</span>
                            <span>{student.cours?.semestre || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Colonne Note */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                              {totalScore} / {maxScore}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    percentage >= 80 ? 'bg-green-500' :
                                    percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                          <Badge
                            size="sm"
                            color={getPerformanceBadgeColor(totalScore, maxScore)}
                          >
                            {percentage >= 80 ? 'Excellent' :
                             percentage >= 60 ? 'Bien' : 
                             percentage >= 40 ? 'Passable' : 'Insuffisant'}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
