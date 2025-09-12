import { Agent } from './agent';

export interface Admin {
  _id?: string;
  userId: string | Agent; // ObjectId référençant Agent, ou Agent populé
  role: string;
  quotite: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminWithAgent extends Omit<Admin, 'userId'> {
  userId: Agent; // Toujours un objet Agent complet quand populé
}

export interface AdminMetrics {
  total: number;
  totalQuotite: number;
  averageQuotite: number;
  roleDistribution: {
    [role: string]: number;
  };
}

export interface AdminFilters {
  search?: string;
  role?: string;
  quotiteMin?: number;
  quotiteMax?: number;
}

export interface CreateAdminRequest {
  userId: string;
  role?: string;
  quotite?: number;
}

export interface UpdateAdminRequest {
  role?: string;
  quotite?: number;
}