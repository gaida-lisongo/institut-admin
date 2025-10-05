/**
 * Configuration API
 */

// Base URL de l'API depuis les variables d'environnement
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Configuration des endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER: {
    SIGNUP: '/user/signup',
    LOGIN: '/user/login',
    UPDATE: (id: string) => `/user/${id}`,
    DELETE: (id: string) => `/user/${id}`,
  },
} as const;

// Configuration par défaut pour les requêtes
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper pour construire l'URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper pour ajouter le token d'authentification aux headers
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = { ...DEFAULT_HEADERS };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};
