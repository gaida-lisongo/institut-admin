// Types pour la gestion des groupes d'étudiants

export interface Reponse {
  questionId: string;
  reponse: string;
  note: number;
  statut: 'non_repondu' | 'en_cours' | 'soumis' | 'corrige';
}

export interface Resolution {
  etudiantId: string;
  reponses: Reponse[];
  note: number;
  statut: 'non_commence' | 'en_cours' | 'termine' | 'corrige';
  dateDebut?: Date;
  dateFin?: Date;
  tempsEcoule?: number; // en minutes
}

export interface Groupe {
  _id: string;
  designation: string;
  sessionId: string;
  resolutions: Resolution[];
  dateCreation: Date;
  dateOuverture?: Date;
  dateFermeture?: Date;
  statut: 'brouillon' | 'ouvert' | 'ferme' | 'archive';
  description?: string;
  dureeMaximale?: number; // en minutes
  tentativesMax?: number;
}

// Types pour les données enrichies avec relations
export interface GroupeWithSession extends Groupe {
  session?: {
    _id: string;
    designation: string;
    coursId: string;
    questions: any[];
    maximum: number;
  };
  cours?: {
    _id: string;
    designation: string;
    unite: string;
  };
}

export interface ResolutionWithEtudiant extends Resolution {
  etudiant?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    classeId: string;
  };
  classe?: {
    _id: string;
    nom: string;
    niveau: string;
  };
}

// Types pour les formulaires
export interface CreateGroupeData {
  designation: string;
  sessionId: string;
  description?: string;
  dureeMaximale?: number;
  tentativesMax?: number;
}

export interface UpdateGroupeData extends Partial<CreateGroupeData> {
  statut?: Groupe['statut'];
  dateOuverture?: Date;
  dateFermeture?: Date;
}

// Types pour les statistiques
export interface GroupeStats {
  totalGroupes: number;
  groupesActifs: number;
  totalParticipants: number;
  moyenneGenerale: number;
  tauxReussite: number;
}

export interface ResolutionStats {
  totalResolutions: number;
  resolutionsTerminees: number;
  resolutionsEnCours: number;
  moyenneGroupe: number;
  meilleureNote: number;
  plusMauvaiseNote: number;
  tempsEcouleTotal: number;
}

// Constantes pour les statuts
export const GROUPE_STATUTS = {
  brouillon: 'Brouillon',
  ouvert: 'Ouvert',
  ferme: 'Fermé',
  archive: 'Archivé'
} as const;

export const RESOLUTION_STATUTS = {
  non_commence: 'Non commencé',
  en_cours: 'En cours',
  termine: 'Terminé',
  corrige: 'Corrigé'
} as const;

export const REPONSE_STATUTS = {
  non_repondu: 'Non répondu',
  en_cours: 'En cours',
  soumis: 'Soumis',
  corrige: 'Corrigé'
} as const;

// Types pour l'export
export interface ExportPalmaresData {
  groupe: GroupeWithSession;
  resolutions: ResolutionWithEtudiant[];
  statistiques: ResolutionStats;
}

export interface ExportDocumentEtudiant {
  etudiant: ResolutionWithEtudiant['etudiant'];
  classe: ResolutionWithEtudiant['classe'];
  groupe: GroupeWithSession;
  session: GroupeWithSession['session'];
  cours: GroupeWithSession['cours'];
  qrCodeUrl: string;
  instructions?: string;
}

export type GroupeStatut = keyof typeof GROUPE_STATUTS;
export type ResolutionStatut = keyof typeof RESOLUTION_STATUTS;
export type ReponseStatut = keyof typeof REPONSE_STATUTS;
