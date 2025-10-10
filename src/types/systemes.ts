export interface Classe {
    _id?: string;
    niveau: string;
    credit: number;
    description: string[];
    semestres: {
        _id?: string;
        designation: string;
        credit: number;
        description: string[];
    }[];
    photo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ClasseFormData {
    niveau: string;
    credit: number;
    description: string[];
    semestres: {
        designation: string;
        credit: number;
        description: string[];
    }[];
    photo?: string;
}

export interface Cycle {
    _id?: string;
    designation: string;
    description: string[];
    classes: Classe[];
    photo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CycleFormData {
    designation: string;
    description: string[];
    classes: Classe[];
    photo?: string;
}

export interface Systeme {
    _id?: string;
    designation: string;
    description: string[];
    cycles: Cycle[];
    photo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SystemeFormData {
    designation: string;
    description: string[];
    cycles: Cycle[];
    photo?: string;
}
