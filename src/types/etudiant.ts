export interface Etudiant {
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
}