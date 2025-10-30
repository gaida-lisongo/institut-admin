export interface Identite {
    nom: string;
    postNom: string;
    preNom: string;
    sexe: string;
    dateNaissance?: Date;
    lieuNaissance?: string;
    nationalite?: string;
    etatCivil?: string;
    adresse?: string;
    email?: string;
    telephone?: string;
    photo?: string;
}

export interface Autorisation {
    role: string;
    scope: string[];
    isActive: boolean;
}

export interface Parcours {
    dateObtention: Date;
    document: string;
    titre: string;
    url: string;
    isActive: boolean;
}

export interface Agent {
    _id?: string;
    matricule: string;
    secure: string;
    identites: Identite;
    autorisations: Autorisation[];
    parcours: Parcours[];
}
