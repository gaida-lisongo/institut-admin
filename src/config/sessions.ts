// Configuration pour le système de sessions

export const SESSION_CONFIG = {
  // Nombre minimum de choix par question
  MIN_CHOICES: 2,
  // Nombre maximum de choix par question
  MAX_CHOICES: 8,
  // Points minimum par question
  MIN_POINTS: 0.5,
  // Points maximum par question
  MAX_POINTS: 20,
  // Nombre maximum de lignes d'énoncé
  MAX_ENONCE_LINES: 10,
} as const;

// Messages de validation
export const SESSION_VALIDATION_MESSAGES = {
  EMPTY_DESIGNATION: 'Le nom de la session est obligatoire',
  EMPTY_COURS: 'Veuillez sélectionner un cours',
  EMPTY_ENONCE: 'Veuillez saisir au moins une ligne d\'énoncé',
  INSUFFICIENT_CHOICES: 'Veuillez saisir au moins 2 choix de réponse',
  INVALID_ANSWER_INDEX: 'L\'index de la bonne réponse est invalide',
  INVALID_POINTS: 'Le nombre de points doit être supérieur à 0',
  TOO_MANY_CHOICES: `Nombre maximum de choix : ${SESSION_CONFIG.MAX_CHOICES}`,
  TOO_MANY_ENONCE_LINES: `Nombre maximum de lignes d'énoncé : ${SESSION_CONFIG.MAX_ENONCE_LINES}`,
} as const;

// Configuration des statuts
export const STATUT_COLORS = {
  brouillon: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-200',
    icon: 'text-gray-600 dark:text-gray-400'
  },
  active: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400'
  },
  terminee: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  archivee: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400'
  }
} as const;

// Types de questions (pour futures extensions)
export const QUESTION_TYPES = {
  QCM: 'qcm',
  VRAI_FAUX: 'vrai_faux',
  TEXTE_LIBRE: 'texte_libre',
  NUMERIQUE: 'numerique'
} as const;

// Niveaux de difficulté (pour futures extensions)
export const DIFFICULTY_LEVELS = {
  FACILE: { value: 'facile', label: 'Facile', color: 'green' },
  MOYEN: { value: 'moyen', label: 'Moyen', color: 'yellow' },
  DIFFICILE: { value: 'difficile', label: 'Difficile', color: 'red' }
} as const;
