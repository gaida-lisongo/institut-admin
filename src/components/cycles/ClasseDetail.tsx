"use client";

import EtudiantsDataTable from "./EtudiantsDataTable";
import { Annee } from "@/services/AnneeService";
import { Classe, Cycle } from "@/services/CycleService";

interface ClasseProps {
  cycle: Cycle;
  classe: Classe;
  annee: Annee;
  onBack: () => void;
}

const ClasseDetail = ({ cycle, classe, annee, onBack }: ClasseProps) => {
  return (
    <EtudiantsDataTable 
      cycle={cycle}
      classe={classe}
      annee={annee}
      onBack={onBack}
    />
  );
};

export default ClasseDetail;
