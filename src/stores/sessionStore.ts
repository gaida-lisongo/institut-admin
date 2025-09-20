import { create } from "zustand";
import SessionService, { SessionFormData, SessionResponse } from "@/services/SessionService";

interface SessionState {
  sessions: SessionResponse[];
  loading: boolean;
  error: string | null;
  fetchSessions: (anneeId: string) => Promise<void>;
  createSession: (data: SessionFormData) => Promise<void>;
  updateSession: (id: string, data: Partial<SessionFormData>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async (anneeId) => {
    set({ loading: true, error: null });
    try {
      const data = await SessionService.getSessions(anneeId);
      set({ sessions: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erreur lors du chargement des sessions", loading: false });
    }
  },

  createSession: async (data) => {
    set({ loading: true, error: null });
    try {
      await SessionService.createSession(data);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erreur lors de la création de la session", loading: false });
    }
  },

  deleteSession: async (id) => {
    set({ loading: true, error: null });
    try {
      await SessionService.deleteSession(id);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erreur lors de la suppression de la session", loading: false });
    }
  },

  updateSession: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await SessionService.updateSession(id, data);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erreur lors de la mise à jour de la session", loading: false });
    }
  },
}));
