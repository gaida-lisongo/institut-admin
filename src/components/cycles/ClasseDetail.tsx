"use client";

import { Annee } from "@/services/AnneeService";
import { Classe, Cycle } from "@/services/CycleService";

interface ClasseProps {
    cycle: Cycle;
    classe: Classe;
    annee: Annee;
    onBack: () => void;
}

const ClasseDetail = ({cycle, classe, annee, onBack}: ClasseProps) => {
    return (
        <div>
            <button onClick={onBack}>Back</button>
            <h1>Classe Detail</h1>
            <p>{cycle.designation}</p>
            <p>{classe.designation}</p>
            <p>{annee.debut}</p>
            <p>{annee.fin}</p>
        </div>
    )
}

export default ClasseDetail;

