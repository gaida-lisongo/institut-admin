import CryptoJS from 'crypto-js';

/**
 * Utilitaires pour le cryptage des mots de passe
 */
export class PasswordUtils {
  /**
   * Hash un mot de passe avec SHA1
   * @param password Le mot de passe en clair
   * @returns Le hash SHA1 du mot de passe
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA1(password).toString();
  }

  /**
   * Vérifie si un mot de passe correspond à son hash
   * @param password Le mot de passe en clair
   * @param hash Le hash à vérifier
   * @returns true si le mot de passe correspond
   */
  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Génère un mot de passe aléatoire sécurisé
   * @param length Longueur du mot de passe (défaut: 12)
   * @returns Un mot de passe aléatoire
   */
  static generateSecurePassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    // S'assurer qu'il y a au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += lower.charAt(Math.floor(Math.random() * lower.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    result += special.charAt(Math.floor(Math.random() * special.length));
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Mélanger les caractères
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }
}
