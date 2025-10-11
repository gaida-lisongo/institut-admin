export interface Etablissement {
    _id?: string;
    designation: string;
    sigle: string;
    token?: string;
    logo: string;
    categorie: 'public' | 'prive';
    reference: string;
    description: string;
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
