export interface Etudiant {
    _id?: string;
    nom: string;
    post_nom: string;
    prenom: string;
    matricule: string;
    sexe: string;
    email: string;
    telephone: string;
    nationalite: string;
    lieu_naissance: string;
    date_naissance: Date;
    photo?: string;
    dateCreation?: Date;
    dateModification?: Date;
    actif?: boolean;
    // Propriétés virtuelles
    nomComplet?: string;
    age?: number;
    parcours?: Parcour[];
    dernierParcours: Parcour
}

export interface Parcour {
    anneeId: any;
    cycleId: any;
    dateInscription: string;
    decision: string;
    etablissementId: any;
    faculteDetails: any;
    faculteId: string;
    id: string;
    niveau: any;
    pourcentage: number;
    _id: string;
}