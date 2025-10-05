export interface Question {
  _id: string;
  enonce: string[];
  reponse: number; // Index de la bonne réponse dans les choix
  choix: string[];
  pts: number;
}

export interface Session {
  _id: string;
  designation: string;
  statut: string; // 'brouillon' | 'active' | 'terminee' | 'archivee'
  questions: Question[];
  coursId: string;
  maximum: number; // Score maximum possible
}

export interface Cours {
  _id: string;
  designation: string;
  credit: number;
  unite: string;
}

export interface SessionWithCours extends Session {
  cours?: Cours;
}

// Types pour les formulaires
export interface CreateSessionData extends Omit<Session, '_id' | 'questions' | 'maximum'> {
  questions?: Omit<Question, '_id'>[];
}

export interface CreateQuestionData extends Omit<Question, '_id'> {}

// Statuts possibles pour les sessions
export const SESSION_STATUTS = [
  { value: 'brouillon', label: 'Brouillon', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'terminee', label: 'Terminée', color: 'blue' },
  { value: 'archivee', label: 'Archivée', color: 'red' }
] as const;

export type SessionStatut = typeof SESSION_STATUTS[number]['value'];
