// Configuration des niveaux scolaires
export const NIVEAUX_SCOLAIRES = [
  '6ème',
  '5ème', 
  '4ème',
  '3ème',
  '2nde',
  '1ère',
  'Terminale'
] as const;

export const SEXE_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' }
] as const;

// Classes par défaut par niveau
export const CLASSES_PAR_DEFAUT = [
  { niveau: '6ème', classes: ['6ème A', '6ème B'] },
  { niveau: '5ème', classes: ['5ème A', '5ème B'] },
  { niveau: '4ème', classes: ['4ème A', '4ème B'] },
  { niveau: '3ème', classes: ['3ème A', '3ème B'] },
  { niveau: '2nde', classes: ['2nde A', '2nde B'] },
  { niveau: '1ère', classes: ['1ère S', '1ère ES', '1ère L'] },
  { niveau: 'Terminale', classes: ['Term S', 'Term ES', 'Term L'] }
];

// Configuration CSV
export const CSV_CONFIG = {
  REQUIRED_HEADERS: ['nom', 'prenom', 'email', 'sexe', 'classeId'],
  DELIMITER: ',',
  ENCODING: 'utf-8'
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  CSV_INVALID_FORMAT: 'Format CSV invalide',
  CSV_MISSING_HEADERS: 'Colonnes manquantes dans le fichier CSV',
  CSV_EMPTY_FILE: 'Le fichier CSV est vide',
  EMAIL_INVALID: 'Format d\'email invalide',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  CLASSE_NOT_FOUND: 'Classe introuvable',
  STUDENT_EXISTS: 'Un étudiant avec cet email existe déjà'
} as const;

// Configuration de validation
export const VALIDATION_RULES = {
  nom: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s-']+$/
  },
  prenom: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s-']+$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
} as const;
