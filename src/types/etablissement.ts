import { Personnel } from "./personnel";

export interface Faculte {
    _id?: string;
    nom: string;
    description: string;
    equipe?: [{
        userId: Personnel;
        role: string;
    }];
    enseignants?: [{
        userId: Personnel;
        role: string;
    }];
    logo?: string;
}

export interface Patrimoine {
    _id?: string;
    designation: string;
    quantite: string;
    photo?: string;
}

export interface Administratif {
    _id?: string;
    userId: Personnel | string;
    role: string;
}

// Types pour les données de formulaire
export interface FaculteFormData {
    nom: string;
    description: string;
    equipe?: {
        userId: string;
        role: string;
    }[];
    enseignants?: {
        userId: string;
        role: string;
    }[];
    logo?: string;
}

export interface PatrimoineFormData {
    designation: string;
    quantite: string;
    photo?: string;
}

export interface AdministratifFormData {
    userId: string;
    role: string;
}

export interface Etablissement {
    _id?: string;
    designation: string;
    sigle: string;
    token?: string;
    logo: string;
    categorie: 'public' | 'prive';
    reference: string;
    description: string;
    facultes?: Faculte[];
    patrimoines?: Patrimoine[];
    administratifs?: Administratif[];
    coge: {
        membreId: string;
        role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
    }[];
    provinceId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface pour les données populées (récupérées du backend)
export interface EtablissementPopulated {
    _id?: string;
    designation: string;
    sigle: string;
    logo: string;
    categorie: 'public' | 'prive';
    reference: string;
    description: string;
    coge: {
        membreId: {
            _id: string;
            nom: string;
            prenom: string;
            email: string;
            matricule?: string;
        } | string;
        role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
        _id?: string;
    }[];
    facultes?: Faculte[];
    patrimoines?: Patrimoine[];
    administratifs?: Administratif[];
    provinceId: {
        _id: string;
        nom?: string;
    } | string;
    createdAt?: Date;
    updatedAt?: Date;
    token?: string;
    __v?: number;
}

export interface EtablissementFormData {
    designation: string;
    sigle: string;
    logo: string;
    categorie: 'public' | 'prive';
    reference: string;
    description: string;
    coge: {
        membreId: string;
        role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
    }[];
    provinceId: string;
}
