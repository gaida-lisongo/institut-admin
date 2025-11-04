"use client";

import EtudiantsDataTable from "./EtudiantsDataTable";
import { Annee } from "@/services/AnneeService";
import { Classe, Cycle } from "@/services/CycleService";
import { Section, useSectionStore } from "@/stores/sectionStore";
import { useEffect, useState } from "react";

interface ClasseProps {
  cycle: Cycle;
  classe: Classe;
  annee: Annee;
  sectionId: string;
  onBack: () => void;
}

const ClasseDetail = ({ cycle, classe, annee, sectionId, onBack }: ClasseProps) => {
  const { sections } = useSectionStore();
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    const sectionData = sections.find(s => s._id === sectionId)
    if (sectionData) {
      setSection(sectionData)
    }
  }, [sectionId]);

  if (!section) {
    return <div>Section non trouvée</div>;
  }

  return (
    <EtudiantsDataTable 
      cycle={cycle}
      classe={classe}
      annee={annee}
      section={section}
      onBack={onBack}
    />
  );
};

export default ClasseDetail;
