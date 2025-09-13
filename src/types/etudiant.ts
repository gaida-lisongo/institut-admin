export interface Semestre {
  semestreId: string;
  anneeId: string;
}

export interface Etudiant {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date | string;
  matricule: string;
  secure: string; // mot de passe
  solde?: number;
  documents?: string[]; // URLs des documents
  photo?: string;
  semestres?: Semestre[]; // Géré par l'étudiant lui-même
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface EtudiantFormData {
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F' | '';
  nationalite: string;
  lieu_naissance: string;
  date_naissance: string;
  matricule: string;
  secure: string;
  solde: number;
  photo?: string;
}

export interface EtudiantCSVTemplate {
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: string;
  matricule: string;
  secure: string;
  solde: string;
}
