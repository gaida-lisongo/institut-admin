/**
 * Utility functions for authentication and token management
 */

/**
 * Checks if a token exists in localStorage
 * @returns {boolean} True if token exists, false otherwise
 */
export const hasToken = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side rendering check
    return false;
  }
  
  const token = localStorage.getItem('token');
  return token !== null && token !== undefined && token.trim() !== '';
};

/**
 * Gets the token from localStorage
 * @returns {string | null} The token if it exists, null otherwise
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
};

/**
 * Removes the token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('token');
};

/**
 * Sets the token in localStorage
 * @param {string} token - The token to store
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem('token', token);
};

/**
 * Redirects to home page if token exists, otherwise redirects to signin
 * @param {() => void} redirectToHome - Function to redirect to home page
 * @param {() => void} redirectToSignin - Function to redirect to signin page
 */
export const redirectBasedOnToken = (
  redirectToHome: () => void,
  redirectToSignin: () => void
): void => {
  if (hasToken()) {
    redirectToHome();
  } else {
    redirectToSignin();
  }
};
