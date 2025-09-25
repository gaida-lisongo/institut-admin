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

export interface CoursDetail {
  coursId: string;
  titre: string;
  description: string;
  credit: number;
  fiches: {
    _id: string;
    chargeId: string;
    logs: any[];
    reference: string;
    status: "OK"| "PENDING" | "NO";
    etudiantId: EtudiantSummary;
  }[]; // Not detailed in payload; define a precise type later if needed
}
