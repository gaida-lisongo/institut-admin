export interface Agent {
  _id?: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date | string;
  matricule: string;
  secure: string; // mot de passe
  solde: number;
  grade: string;
  titre: string;
  photo?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentFormData {
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
  grade: string;
  titre: string;
  photo?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface AgentCSVTemplate {
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
  grade: string;
  titre: string;
}
