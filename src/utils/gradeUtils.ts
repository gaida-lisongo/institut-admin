import { 
  Personnel, 
  GradeAdministratifOuvrier, 
  GradeAcademique, 
  GradeScientifique,
  GradePersonnel 
} from '@/types/personnel';

// Définition des grades avec leurs descriptions et niveaux de formation requis
export const GRADES_ADMINISTRATIF_OUVRIER: Record<GradeAdministratifOuvrier, { 
  label: string; 
  description: string; 
  niveauFormation: string;
  ordre: number;
}> = {
  'AGA1': {
    label: 'Agent d\'Administration de 1ère classe',
    description: 'Agent d\'Administration de 1ère classe',
    niveauFormation: 'Humanités (6ème)',
    ordre: 1
  },
  'AGA2': {
    label: 'Agent d\'Administration de 2ème classe',
    description: 'Agent d\'Administration de 2ème classe',
    niveauFormation: 'PPS (Post-Primaire Supérieur)',
    ordre: 2
  },
  'ATA1': {
    label: 'Attaché d\'Administration de 1ère classe',
    description: 'Attaché d\'Administration de 1ère classe',
    niveauFormation: 'Diplôme de 2ème cycle ou supérieur (non doctorat)',
    ordre: 3
  },
  'ATA2': {
    label: 'Attaché d\'Administration de 2ème classe',
    description: 'Attaché d\'Administration de 2ème classe',
    niveauFormation: 'Diplôme de 1er cycle ESU',
    ordre: 4
  },
  'AA1': {
    label: 'Agent Auxiliaire de 1ère classe',
    description: 'Agent Auxiliaire de 1ère classe',
    niveauFormation: 'PP3 (Post-Primaire 3ème année)',
    ordre: 5
  },
  'AA2': {
    label: 'Agent Auxiliaire de 2ème classe',
    description: 'Agent Auxiliaire de 2ème classe',
    niveauFormation: 'PP1 (Post-Primaire 1ère année)',
    ordre: 6
  },
  'CB': {
    label: 'Chef de Bureau',
    description: 'Chef de Bureau (Emploi de commandement)',
    niveauFormation: 'Formation et expérience requises',
    ordre: 7
  },
  'Directeur': {
    label: 'Directeur',
    description: 'Directeur',
    niveauFormation: 'Diplôme du premier cycle minimum',
    ordre: 8
  },
  'CDS': {
    label: 'Chef de Service',
    description: 'Chef de Service',
    niveauFormation: 'Diplôme de deuxième cycle et de docteur',
    ordre: 9
  }
};

export const GRADES_SCIENTIFIQUE: Record<GradeScientifique, { 
  label: string; 
  description: string; 
  niveauFormation: string;
  ordre: number;
}> = {
  'CPP': {
    label: 'Chargé des Pratiques Professionnelles',
    description: 'Chargé des Pratiques Professionnelles',
    niveauFormation: 'Diplôme de 2ème cycle + expérience professionnelle',
    ordre: 1
  },
  'ASS': {
    label: 'Assistant',
    description: 'Assistant',
    niveauFormation: 'Diplôme de 2ème cycle minimum',
    ordre: 2
  },
  'CT': {
    label: 'Chef de Travaux',
    description: 'Chef de Travaux',
    niveauFormation: 'Diplôme de 2ème cycle + expérience',
    ordre: 3
  }
};

export const GRADES_ACADEMIQUE: Record<GradeAcademique, { 
  label: string; 
  description: string; 
  niveauFormation: string;
  ordre: number;
}> = {
  'P': {
    label: 'Professeur',
    description: 'Professeur',
    niveauFormation: 'Doctorat + publications scientifiques',
    ordre: 1
  },
  'PO': {
    label: 'Professeur Ordinaire',
    description: 'Professeur Ordinaire',
    niveauFormation: 'Doctorat + ouvrage scientifique ou promotion thèse',
    ordre: 2
  },
  'PA': {
    label: 'Professeur Associé',
    description: 'Professeur Associé',
    niveauFormation: 'Doctorat + travaux scientifiques',
    ordre: 3
  },
  'PE': {
    label: 'Professeur Émérite',
    description: 'Professeur Émérite',
    niveauFormation: 'Doctorat + carrière académique distinguée',
    ordre: 4
  }
};

// Fonction pour obtenir les grades disponibles selon la catégorie
export const getGradesByCategorie = (categorie: string): Array<{
  value: GradePersonnel;
  label: string;
  description: string;
  niveauFormation: string;
  ordre: number;
}> => {
  switch (categorie) {
    case 'ADMINISTRATIF':
    case 'OUVRIER':
      return Object.entries(GRADES_ADMINISTRATIF_OUVRIER).map(([value, info]) => ({
        value: value as GradeAdministratifOuvrier,
        ...info
      })).sort((a, b) => a.ordre - b.ordre);
    
    case 'ACADÉMIQUE':
      return Object.entries(GRADES_ACADEMIQUE).map(([value, info]) => ({
        value: value as GradeAcademique,
        ...info
      })).sort((a, b) => a.ordre - b.ordre);
    
    case 'SCIENTIFIQUE':
      return Object.entries(GRADES_SCIENTIFIQUE).map(([value, info]) => ({
        value: value as GradeScientifique,
        ...info
      })).sort((a, b) => a.ordre - b.ordre);
    
    default:
      return [];
  }
};

// Fonction pour obtenir le label d'un grade
export const getGradeLabel = (grade: GradePersonnel | undefined, categorie: Personnel['categorie']): string => {
  if (!grade) return 'Aucun grade';
  
  const grades = getGradesByCategorie(categorie);
  const gradeInfo = grades.find(g => g.value === grade);
  return gradeInfo?.label || grade;
};

// Fonction pour obtenir la description d'un grade
export const getGradeDescription = (grade: GradePersonnel | undefined, categorie: Personnel['categorie']): string => {
  if (!grade) return 'Aucune description';
  
  const grades = getGradesByCategorie(categorie);
  const gradeInfo = grades.find(g => g.value === grade);
  return gradeInfo?.description || grade;
};

// Fonction pour obtenir le niveau de formation requis pour un grade
export const getGradeNiveauFormation = (grade: GradePersonnel | undefined, categorie: Personnel['categorie']): string => {
  if (!grade) return 'Non spécifié';
  
  const grades = getGradesByCategorie(categorie);
  const gradeInfo = grades.find(g => g.value === grade);
  return gradeInfo?.niveauFormation || 'Non spécifié';
};

// Fonction pour valider si un grade est compatible avec une catégorie
export const isGradeValidForCategorie = (grade: GradePersonnel, categorie: Personnel['categorie']): boolean => {
  const grades = getGradesByCategorie(categorie);
  return grades.some(g => g.value === grade);
};

// Fonction pour obtenir le grade suivant dans la hiérarchie
export const getNextGrade = (currentGrade: GradePersonnel | undefined, categorie: Personnel['categorie']): GradePersonnel | null => {
  if (!currentGrade) return null;
  
  const grades = getGradesByCategorie(categorie);
  const currentGradeInfo = grades.find(g => g.value === currentGrade);
  
  if (!currentGradeInfo) return null;
  
  const nextGrade = grades.find(g => g.ordre === currentGradeInfo.ordre + 1);
  return nextGrade?.value || null;
};

// Fonction pour obtenir le grade précédent dans la hiérarchie
export const getPreviousGrade = (currentGrade: GradePersonnel | undefined, categorie: Personnel['categorie']): GradePersonnel | null => {
  if (!currentGrade) return null;
  
  const grades = getGradesByCategorie(categorie);
  const currentGradeInfo = grades.find(g => g.value === currentGrade);
  
  if (!currentGradeInfo) return null;
  
  const previousGrade = grades.find(g => g.ordre === currentGradeInfo.ordre - 1);
  return previousGrade?.value || null;
};
