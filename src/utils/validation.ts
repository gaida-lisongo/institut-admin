import { VALIDATION_RULES, ERROR_MESSAGES } from '@/config/education';
import { Etudiant } from '@/types/student';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEtudiant = (etudiant: Omit<Etudiant, '_id'>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validation nom
  if (!etudiant.nom.trim()) {
    errors.push({ field: 'nom', message: ERROR_MESSAGES.REQUIRED_FIELD });
  } else if (etudiant.nom.length < VALIDATION_RULES.nom.minLength) {
    errors.push({ field: 'nom', message: `Le nom doit contenir au moins ${VALIDATION_RULES.nom.minLength} caractères` });
  } else if (etudiant.nom.length > VALIDATION_RULES.nom.maxLength) {
    errors.push({ field: 'nom', message: `Le nom ne peut pas dépasser ${VALIDATION_RULES.nom.maxLength} caractères` });
  } else if (!VALIDATION_RULES.nom.pattern.test(etudiant.nom)) {
    errors.push({ field: 'nom', message: 'Le nom contient des caractères invalides' });
  }

  // Validation prénom
  if (!etudiant.prenom.trim()) {
    errors.push({ field: 'prenom', message: ERROR_MESSAGES.REQUIRED_FIELD });
  } else if (etudiant.prenom.length < VALIDATION_RULES.prenom.minLength) {
    errors.push({ field: 'prenom', message: `Le prénom doit contenir au moins ${VALIDATION_RULES.prenom.minLength} caractères` });
  } else if (etudiant.prenom.length > VALIDATION_RULES.prenom.maxLength) {
    errors.push({ field: 'prenom', message: `Le prénom ne peut pas dépasser ${VALIDATION_RULES.prenom.maxLength} caractères` });
  } else if (!VALIDATION_RULES.prenom.pattern.test(etudiant.prenom)) {
    errors.push({ field: 'prenom', message: 'Le prénom contient des caractères invalides' });
  }

  // Validation email
  if (!etudiant.email.trim()) {
    errors.push({ field: 'email', message: ERROR_MESSAGES.REQUIRED_FIELD });
  } else if (!VALIDATION_RULES.email.pattern.test(etudiant.email)) {
    errors.push({ field: 'email', message: ERROR_MESSAGES.EMAIL_INVALID });
  }

  // Validation sexe
  if (!etudiant.sexe || !['M', 'F'].includes(etudiant.sexe)) {
    errors.push({ field: 'sexe', message: 'Veuillez sélectionner un sexe valide' });
  }

  // Validation classe
  if (!etudiant.classeId.trim()) {
    errors.push({ field: 'classeId', message: 'Veuillez sélectionner une classe' });
  }

  return errors;
};

export const validateCSVHeaders = (headers: string[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  const missingHeaders = ['nom', 'prenom', 'email', 'sexe', 'classeid'].filter(
    required => !normalizedHeaders.includes(required)
  );

  if (missingHeaders.length > 0) {
    errors.push({
      field: 'headers',
      message: `${ERROR_MESSAGES.CSV_MISSING_HEADERS}: ${missingHeaders.join(', ')}`
    });
  }

  return errors;
};

export const validateCSVRow = (row: string[], headers: string[], lineNumber: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (row.length !== headers.length) {
    errors.push({
      field: 'row',
      message: `Ligne ${lineNumber}: nombre de colonnes incorrect (attendu: ${headers.length}, trouvé: ${row.length})`
    });
    return errors;
  }

  // Créer un objet étudiant temporaire pour la validation
  const etudiantData: any = {};
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim().toLowerCase();
    switch (normalizedHeader) {
      case 'nom':
        etudiantData.nom = row[index].trim();
        break;
      case 'prenom':
        etudiantData.prenom = row[index].trim();
        break;
      case 'email':
        etudiantData.email = row[index].trim();
        break;
      case 'sexe':
        etudiantData.sexe = row[index].trim().toUpperCase();
        break;
      case 'classeid':
        etudiantData.classeId = row[index].trim();
        break;
    }
  });

  // Valider les données de l'étudiant
  const validationErrors = validateEtudiant(etudiantData);
  validationErrors.forEach(error => {
    errors.push({
      field: error.field,
      message: `Ligne ${lineNumber}: ${error.message}`
    });
  });

  return errors;
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  return errors.map(error => `• ${error.message}`).join('\n');
};
