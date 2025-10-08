export interface Personnel {
  _id: string;
  matricule: string;
  nom: string;
  post_nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sexe: 'M' | 'F';
  adresse?: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date | string;
  province: string | Province; // ObjectId ou objet Province populé
  categorie: 'SCIENTIFIQUE' | 'ADMINISTRATIF' | 'ACADEMIQUE' | 'OUVRIER';
  grade?: string;
  niveau?: string;
  photo?: string;
  documents?: PersonnelDocument[];
  autorisations?: Autorisation[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Méthodes calculées côté client
  nomComplet?: string;
  age?: number;
}

export interface PersonnelDocument {
  _id?: string;
  designation: string;
  url: string;
  dateAjout?: Date | string;
  taille?: number;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'gif';
}

export interface Autorisation {
  _id?: string;
  type: 'admin' | 'gestionnaire' | 'secretaire' | 'comptable' | 'directeur';
  password: string; // Sera hashé côté serveur
  action: boolean;
  dateCreation?: Date | string;
  dateExpiration?: Date | string;
}

export interface Province {
  _id: string;
  nom: string;
  code?: string;
}

// Interface pour les statistiques du personnel
export interface PersonnelStats {
  total: number;
  parCategorie: {
    scientifique: number;
    administratif: number;
    academique: number;
    ouvrier: number;
  };
  parSexe: {
    M: number;
    F: number;
  };
  avecAutorisations: number;
  sansAutorisations: number;
  nouveaux: number; // Ajoutés dans les 30 derniers jours
  actifs: number;
}

// Interface pour les filtres
export interface PersonnelFilters {
  search?: string;
  categorie?: Personnel['categorie'];
  sexe?: Personnel['sexe'];
  province?: string;
  hasAutorisation?: string;
  ageMin?: number;
  ageMax?: number;
}

// Interface pour la création d'un personnel
export interface CreatePersonnelData {
  matricule: string;
  nom: string;
  post_nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sexe: 'M' | 'F';
  adresse?: string;
  nationalite: string;
  lieu_naissance: string;
  date_naissance: Date | string;
  province: string; // ObjectId de la province
  categorie: Personnel['categorie'];
  grade?: string;
  niveau?: string;
  photo?: string;
  documents?: Omit<PersonnelDocument, '_id'>[];
  autorisations?: Omit<Autorisation, '_id'>[];
}

// Interface pour la mise à jour d'un personnel
export interface UpdatePersonnelData extends Partial<CreatePersonnelData> {
  _id?: never; // Empêche la modification de l'ID
}

// Interface pour la réponse API
export interface PersonnelApiResponse {
  success: boolean;
  message?: string;
  data?: Personnel | Personnel[];
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  error?: string;
}

// Interface pour la réponse des statistiques
export interface PersonnelStatsApiResponse {
  success: boolean;
  data?: {
    totalUsers: number;
    usersByCategory: Array<{ _id: string; count: number }>;
    usersWithAutorisations: number;
    usersWithoutAutorisations: number;
  };
  error?: string;
}
