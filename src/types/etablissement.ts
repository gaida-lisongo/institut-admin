export interface Etablissement {
    _id?: string;
    designation: string;
    sigle: string;
    logo: string;
    categorie: 'public' | 'privee';
    description: string;
    coge: {
        membreId: string;
        role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
    }[];
    provinceId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EtablissementFormData {
    designation: string;
    sigle: string;
    logo: string;
    categorie: 'public' | 'privee';
    description: string;
    coge: {
        membreId: string;
        role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
    }[];
    provinceId: string;
}
