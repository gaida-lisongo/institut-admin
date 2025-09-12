export interface Agent {
  _id?: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date;
  matricule: string;
  secure?: string; // Ne sera pas stocké côté client
  solde: number;
  grade: string;
  titre: string;
  photo: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: Agent | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  agent?: Agent;
}