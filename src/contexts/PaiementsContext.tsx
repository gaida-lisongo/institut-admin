"use client";

import { Etablissement } from "@/types/etablissement";
import { Frais } from "@/types/frais";
import { Annee } from "@/types/annee";
import { createContext, useContext, ReactNode } from "react";

interface PaiementsContextType {
  etablissement: Etablissement | null;
  selectedFrais: Frais | null;
  selectedAnnee: Annee | null;
  allFrais: Frais[];
  allAnnees: Annee[];
  setSelectedFrais: (frais: Frais | null) => void;
  setSelectedAnnee: (annee: Annee | null) => void;
  isLoading: boolean;
}

const PaiementsContext = createContext<PaiementsContextType | undefined>(undefined);

export const usePaiementsContext = () => {
  const context = useContext(PaiementsContext);
  if (!context) {
    throw new Error('usePaiementsContext must be used within a PaiementsProvider');
  }
  return context;
};

interface PaiementsProviderProps {
  children: ReactNode;
  value: PaiementsContextType;
}

export const PaiementsProvider = ({ children, value }: PaiementsProviderProps) => {
  return (
    <PaiementsContext.Provider value={value}>
      {children}
    </PaiementsContext.Provider>
  );
};
