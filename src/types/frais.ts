// Types pour la gestion des frais

export interface Repartition {
  entite: string;
  quotite: number;
}

export interface Frais {
  _id?: string;
  designation: string;
  categorie: string;
  description: string;
  montant: number;
  etabs: ('public' | 'prive' | 'tous')[];
  repartitions: Repartition[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface FraisInput {
  designation: string;
  categorie: string;
  description: string;
  montant: number;
  etabs?: ('public' | 'prive' | 'tous')[];
  repartitions?: Repartition[];
}

export interface FraisFilters {
  search?: string;
  categorie?: string;
  typeEtab?: 'public' | 'prive' | 'tous';
  montantMin?: number;
  montantMax?: number;
}

export interface FraisPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FraisApiResponse {
  success: boolean;
  data: Frais[];
  pagination?: FraisPagination;
  message?: string;
  errors?: string[];
}

export interface FraisDetailResponse {
  success: boolean;
  data: Frais;
  message?: string;
}

export interface FraisStats {
  total: number;
  parCategorie: Record<string, number>;
  parTypeEtab: Record<string, number>;
  montantTotal: number;
  montantMoyen: number;
}

// Types pour les catégories de frais courantes
export type CategoriesFrais = 
  | 'Inscription'
  | 'Scolarité'
  | 'Examen'
  | 'Laboratoire'
  | 'Bibliothèque'
  | 'Transport'
  | 'Hébergement'
  | 'Restauration'
  | 'Assurance'
  | 'Autre';

// Types pour les établissements
export type TypeEtablissement = 'public' | 'prive' | 'tous';
