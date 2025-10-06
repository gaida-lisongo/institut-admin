import crypto from 'crypto';

/**
 * Utilitaires pour la gestion des mots de passe avec cryptage SHA256
 */

/**
 * Crypte un mot de passe avec SHA256
 * @param password - Le mot de passe en clair
 * @returns Le mot de passe crypté en SHA256
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Vérifie si un mot de passe en clair correspond au mot de passe crypté
 * @param plainPassword - Le mot de passe en clair à vérifier
 * @param hashedPassword - Le mot de passe crypté stocké
 * @returns true si les mots de passe correspondent, false sinon
 */
export const verifyPassword = (plainPassword: string, hashedPassword: string): boolean => {
  const hashedPlainPassword = hashPassword(plainPassword);
  return hashedPlainPassword === hashedPassword;
};

/**
 * Valide et crypte un nouveau mot de passe si l'ancien correspond
 * @param currentPassword - Le mot de passe actuel saisi par l'utilisateur
 * @param storedPassword - Le mot de passe crypté stocké en base
 * @param newPassword - Le nouveau mot de passe à crypter
 * @returns Object avec success (boolean) et hashedPassword (string) ou error (string)
 */
export const validateAndHashNewPassword = (
  currentPassword: string,
  storedPassword: string,
  newPassword: string
): { success: boolean; hashedPassword?: string; error?: string } => {
  console.log("currentPassword :", currentPassword);
  console.log("storedPassword :", storedPassword);
  console.log("newPassword :", newPassword);
  // Vérifier si le mot de passe actuel correspond
  if (!verifyPassword(currentPassword, storedPassword)) {
    return {
      success: false,
      error: 'Le mot de passe actuel est incorrect'
    };
  }

  // Valider le nouveau mot de passe
  if (newPassword.length < 6) {
    return {
      success: false,
      error: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
    };
  }

  // Crypter le nouveau mot de passe
  const hashedPassword = hashPassword(newPassword);
  console.log("hashedPassword :", hashedPassword);
  return {
    success: true,
    hashedPassword
  };
};
