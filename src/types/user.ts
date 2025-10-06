/**
 * Types pour la gestion des utilisateurs
 */

export interface User {
  _id: string;
  email: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  grade?: string;
  role: string;
  password?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  grade?: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface SignupStepOneData {
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: 'M' | 'F';
}

export interface SignupStepTwoData {
  email: string;
  password: string;
  confirmPassword: string;
  grade?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  nom?: string;
  post_nom?: string;
  prenom?: string;
  sexe?: 'M' | 'F';
  grade?: string;
  role?: string;
  password?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface SignupResponse {
  _id: string;
  error?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface UserResponse {
  success?: boolean;
  message?: string;
  data?: User;
  error?: string;
}

export interface UserState {
  // État de l'utilisateur
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (data: SignupData) => Promise<SignupResponse>;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (id: string, data: UpdateUserData) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<UserResponse>;
  getCurrentUser: () => User | null;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}
