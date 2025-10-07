export interface EvenementCalendrier {
  evenement: string;
  date: Date;
  description: string;
  photo?: string;
  type: 'rentree' | 'examen' | 'vacances' | 'evenement' | 'autre';
}

export interface FraisAcademique {
  fraisId: string;
  montant: number;
  obligatoire: boolean;
  dateEcheance?: Date;
}

export interface Annee {
  _id: string;
  debut: number;
  fin: number;
  description: string;
  statut: 'active' | 'terminee' | 'planifiee';
  dateCreation: Date;
  dateModification: Date;
  calendrier?: EvenementCalendrier[];
  fraisAcademiques?: FraisAcademique[];
}

export interface AnneeFormData {
  debut: number;
  fin: number;
  description: string;
  statut: 'active' | 'terminee' | 'planifiee';
  calendrier?: EvenementCalendrier[];
  fraisAcademiques?: FraisAcademique[];
}
