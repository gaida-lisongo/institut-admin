import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, CreateSessionData } from '@/types/session';

interface SessionStore {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  
  // Actions CRUD Sessions
  fetchSessions: () => Promise<void>;
  addSession: (session: CreateSessionData) => Promise<void>;
  updateSession: (id: string, session: Partial<Omit<Session, '_id'>>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionById: (id: string) => Session | undefined;
  getSessionsByCours: (coursId: string) => Session[];
  
  // Actions pour les questions
  addQuestionToSession: (sessionId: string, question: any) => Promise<void>;
  updateQuestionInSession: (sessionId: string, questionId: string, questionData: any) => Promise<void>;
  deleteQuestionFromSession: (sessionId: string, questionId: string) => Promise<void>;
  
  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const sessions = await response.json();
      set({ sessions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addSession: async (sessionData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to create session');
      const newSession = await response.json();
      set((state) => ({
        sessions: [...state.sessions, newSession],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSession: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD persister en backend
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.status}`);
      }
      
      const serverSession = await response.json();
      console.log('✅ Session from store mise à jour avec succès:', updates);
      
      // 2. ENSUITE mettre à jour l'état local avec les données utilisateur
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session._id === id ? {...session, ...updates} : session
        ),
        loading: false,
        error: null,
      }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteSession: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete session');
      set((state) => ({
        sessions: state.sessions.filter((session) => session._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getSessionById: (id) => {
    return get().sessions.find((session) => session._id === id);
  },

  getSessionsByCours: (coursId) => {
    return get().sessions.filter((session) => session.coursId === coursId);
  },

  // Actions pour les questions
  addQuestionToSession: async (sessionId, question) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD créer la question en base de données
      const questionResponse = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });
      
      if (!questionResponse.ok) {
        throw new Error(`Failed to create question: ${questionResponse.status}`);
      }
      
      const newQuestion = await questionResponse.json();
      
      // 2. ENSUITE ajouter l'ID de la question à la session
      const { sessions } = get();
      const currentSession = sessions.find(s => s._id === sessionId);
      if (!currentSession) {
        throw new Error('Session not found');
      }

      const updatedQuestionIds = [...(currentSession.questions || []), newQuestion._id];
      
      // 3. Mettre à jour la session avec le nouvel ID de question
      const sessionResponse = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: sessionId, 
          questions: updatedQuestionIds 
        }),
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`Failed to update session: ${sessionResponse.status}`);
      }
      
      // 4. Mettre à jour l'état local avec la nouvelle question
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session._id === sessionId
            ? {
                ...session,
                questions: [...session.questions, newQuestion],
                maximum: session.maximum + (newQuestion.pts || 0)
              }
            : session
        ),
        loading: false,
        error: null,
      }));
      
      console.log('✅ Question ajoutée avec succès:', newQuestion);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de la question:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateQuestionInSession: async (sessionId, questionId, questionData) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD mettre à jour la question en base de données
      const questionResponse = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: questionId, ...questionData }),
      });
      
      if (!questionResponse.ok) {
        throw new Error(`Failed to update question: ${questionResponse.status}`);
      }
      
      const updatedQuestion = await questionResponse.json();
      
      // 2. ENSUITE mettre à jour l'état local avec les données utilisateur
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session._id === sessionId
            ? {
                ...session,
                questions: session.questions.map((q) =>
                  q._id === questionId ? { ...q, ...questionData } : q
                ),
                maximum: session.questions.reduce((total, q) => 
                  total + (q._id === questionId ? (questionData.pts || 0) : (q.pts || 0)), 0
                )
              }
            : session
        ),
        loading: false,
        error: null,
      }));
      
      console.log('✅ Question mise à jour avec succès:', questionData);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la question:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteQuestionFromSession: async (sessionId, questionId) => {
    set({ loading: true, error: null });

    try {
      // 1. D'ABORD supprimer la question de la base de données
      const questionResponse = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: questionId }),
      });
      
      if (!questionResponse.ok) {
        throw new Error(`Failed to delete question: ${questionResponse.status}`);
      }
      
      // 2. ENSUITE retirer l'ID de la question de la session
      const { sessions } = get();
      const currentSession = sessions.find(s => s._id === sessionId);
      if (!currentSession) {
        throw new Error('Session not found');
      }

      const updatedQuestionIds = (currentSession.questions || [])
        .filter(q => q._id !== questionId)
        .map(q => q._id);
      
      // 3. Mettre à jour la session sans cet ID de question
      const sessionResponse = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: sessionId, 
          questions: updatedQuestionIds 
        }),
      });
      
      if (!sessionResponse.ok) {
        throw new Error(`Failed to update session: ${sessionResponse.status}`);
      }
      
      // 4. Mettre à jour l'état local
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session._id === sessionId
            ? {
                ...session,
                questions: session.questions.filter((q) => q._id !== questionId),
                maximum: session.questions
                  .filter((q) => q._id !== questionId)
                  .reduce((total, q) => total + (q.pts || 0), 0)
              }
            : session
        ),
        loading: false,
        error: null,
      }));
      
      console.log('✅ Question supprimée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la question:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearSessions: () => set({ sessions: [], error: null }),
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({ sessions: state.sessions }),
      version: 1,
    }
  )
);
