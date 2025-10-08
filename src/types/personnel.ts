export interface Personnel {
  _id: string;
  matricule: string;
  nom: string; 
  post_nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sexe: string;
  adresse: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date;
  provinceId: string | Object;
  categorie: string;
  grade?: string;
  niveau?: string;
  photo?: string;
  documents?: Document[];
  autorisations: Autorisation[];
}

export interface Document {
  _id: string;
  designation: string;
  type: string;
  url: string;
}

export interface Autorisation {
  _id: string;
  password: string;
  type: string;
  action: boolean;
}
