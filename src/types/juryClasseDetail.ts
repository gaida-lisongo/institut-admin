// Dedicated types for JuryService.getClasseDetail response
// This file is intentionally separate to avoid impacting existing shared types.

export interface ClasseDetailResponse {
  success: boolean;
  message: string;
  data: ClasseDetailData;
}

export interface ClasseDetailData {
  classeId: string;
  designation: string;
  description: string;
  semestres: SemestreDetail[];
}

export interface SemestreDetail {
  semestreId: string;
  designation: string;
  description: string;
  etudiants: EtudiantSummary[];
  unites: UniteDetail[];
}

export interface EtudiantSummary {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F' | string; // Keep string fallback in case of other values
  nationalite: string;
  lieu_naissance: string;
  date_naissance: string; // ISO date string
  matricule: string;
  secure: string;
  documents: string[]; // URLs to documents
  photo?: string; // URL to photo may be optional
  semestres: any[]; // Not detailed in payload; keep as any[] for now
  __v?: number;
  solde?: number;
}

export interface UniteDetail {
  uniteId: string;
  designation: string;
  code: string;
  credit: number;
  cours: CoursDetail[];
}

// Types pour les sessions d'évaluation
export type SessionType = 'principale' | 'rattrapage' | 'annuelle';

export interface NoteDetail {
  cmi?: number; // Note de contrôle continu
  examen?: number; // Note d'examen
  rattrapage?: number; // Note de rattrapage
  moyenne?: number; // Moyenne calculée
}

export interface FicheEvaluation extends NoteDetail {
  _id: string;
  chargeId: string;
  logs: any[];
  reference: string;
  status: "OK" | "PENDING" | "NO";
  etudiantId: string; // ID de l'étudiant (pas l'objet complet)
}

export interface CoursDetail {
  coursId: string;
  titre: string;
  description: string;
  credit: number;
  fiches: FicheEvaluation[];
}

// Types pour les appréciations LMD
export type AppreciationLMD = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// Types pour les décisions du jury
export type DecisionJury = 'ADMIS' | 'DOUBLE' | 'REPECHAGE';

export interface ResultatEtudiant {
  etudiantId: string;
  moyenneGenerale: number;
  totalCredits: number;
  creditsValides: number;
  pourcentageCredits: number;
  appreciation: AppreciationLMD;
  decision: DecisionJury;
  notesParUE: {
    [uniteId: string]: {
      moyenne: number;
      creditValide: boolean;
      notesParcours: NoteDetail;
    };
  };
}
