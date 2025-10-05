"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { useModal } from '@/hooks/useModal';
import { Question, SESSION_STATUTS } from '@/types/session';
import QuestionModal from '@/components/sessions/QuestionModal';

const SessionDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.slug as string;

  const {
    getSessionById,
    addQuestionToSession,
    updateQuestionInSession,
    deleteQuestionFromSession,
    updateSession,
  } = useSessionStore();

  const { getCoursById } = useCoursStore();
  const { isOpen, openModal, closeModal } = useModal();

  const [session, setSession] = useState(getSessionById(sessionId));
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const currentSession = getSessionById(sessionId);
    if (!currentSession) {
      router.push('/sessions');
      return;
    }
    setSession(currentSession);
  }, [sessionId, getSessionById, router]);

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Session non trouvée</p>
          <Link
            href="/sessions"
            className="mt-4 inline-block text-brand-600 hover:text-brand-800 dark:text-brand-400"
          >
            Retour aux sessions
          </Link>
        </div>
      </div>
    );
  }

  const cours = getCoursById(session.coursId);
  const statutInfo = SESSION_STATUTS.find(s => s.value === session.statut) || SESSION_STATUTS[0];

  const handleOpenModal = (question?: Question) => {
    setSelectedQuestion(question || null);
    openModal();
  };

  const handleSubmitQuestion = async (questionData: any) => {
    try {
      if (selectedQuestion) {
        await updateQuestionInSession(sessionId, selectedQuestion._id, questionData);
      } else {
        await addQuestionToSession(sessionId, questionData);
      }
      setSelectedQuestion(null);
      closeModal();
      // Refresh session data
      setSession(getSessionById(sessionId));
    } catch (error) {
      console.error('Erreur lors de la soumission de la question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await deleteQuestionFromSession(sessionId, questionId);
        setSession(getSessionById(sessionId));
      } catch (error) {
        console.error('Erreur lors de la suppression de la question:', error);
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateSession(sessionId, { statut: newStatus });
    setSession(getSessionById(sessionId));
  };

  const filteredQuestions = session.questions.filter(question =>
    question.enonce.some(line => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    ) || question.choix.some(choix =>
      choix.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/sessions" className="hover:text-brand-600 dark:hover:text-brand-400">
            Sessions
          </Link>
          <span>/</span>
          <span>{session.designation}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.designation}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Cours:</span> {cours?.designation || 'Cours inconnu'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut:</span>
                <select
                  value={session.statut}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-full px-3 py-1 text-xs font-semibold border-0 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
                >
                  {SESSION_STATUTS.map((statut) => (
                    <option key={statut.value} value={statut.value}>
                      {statut.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Score maximum:</span> {session.maximum} pts
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ajouter une question
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{session.questions.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Score Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{session.maximum} pts</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne/Question</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {session.questions.length > 0 ? (session.maximum / session.questions.length).toFixed(1) : '0'} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher dans les questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      {/* Table des questions */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Choix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Bonne Réponse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Points
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
              {filteredQuestions.map((question, index) => (
                <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {question.enonce.map((line, i) => (
                          <div key={i} className="truncate">{line}</div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {question.choix.length} choix
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {question.choix[question.reponse] || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                      {question.pts} pts
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(question)}
                      className="mr-3 text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Aucune question trouvée avec ce terme de recherche.'
                : 'Aucune question dans cette session. Cliquez sur "Ajouter une question" pour commencer.'
              }
            </p>
          </div>
        )}
      </div>

      <QuestionModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmitQuestion}
        question={selectedQuestion}
      />
    </div>
  );
};

export default SessionDetailPage;