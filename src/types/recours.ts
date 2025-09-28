import { Agent } from "./agent";
import { Etudiant } from "./etudiant";
import { Fiche } from "../services/ChargeService";

export interface Recours {
  _id: string;
  reference: string;
  object: string;
  contenu: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  preuve?: string;
  noteId: string | Fiche;
  etudiantId: string | Etudiant;
  agent?: string | Agent;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RecoursWithDetails {
  _id: string;
  reference: string;
  object: string;
  contenu: string[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  preuve?: string;
  agent?: Agent;
  fiche: {
    _id: string;
    reference?: string;
    cmi?: number;
    examen?: number;
    rattrapage?: number;
    status: "OK" | "PENDING" | "NO";
    chargeId: string;
    author: string;
    logs?: {
      agentId: string;
      justification: string;
    }[];
  };
  etudiant: {
    _id: string;
    nom: string;
    post_nom: string;
    prenom: string;
    matricule: string;
    sexe: 'M' | 'F';
    nationalite: string;
    photo?: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RecoursFormData {
  reference: string;
  object: string;
  contenu: string;
  preuve?: string;
  noteId: string;
  etudiantId: string;
}

export interface RecoursResponse {
  success: boolean;
  message: string;
  data: RecoursWithDetails[];
  count: number;
}
