import { AppreciationLMD, DecisionJury, SessionType } from "@/types/juryClasseDetail";

/**
 * Calcule la moyenne d'une UE pour un étudiant
 */
export function calculerMoyenneUE(
  notes: { [evaluationCode: string]: number | string },
  sessionType: SessionType
): number {
  if (sessionType === 'principale') {
    const cmi = parseFloat(String(notes['CMI'] || 0));
    const examen = parseFloat(String(notes['EXAMEN'] || 0));
    return (cmi + examen) / 2;
  } else if (sessionType === 'rattrapage') {
    return parseFloat(String(notes['RATT'] || 0));
  } else if (sessionType === 'annuelle') {
    return parseFloat(String(notes['BEST'] || 0));
  }
  return 0;
}

/**
 * Détermine si une UE est validée (moyenne >= 10)
 */
export function isUEValidee(moyenne: number): boolean {
  return moyenne >= 10;
}

/**
 * Calcule la moyenne générale pondérée par les crédits
 */
export function calculerMoyenneGenerale(
  notesParUE: { [uniteId: string]: { moyenne: number; credit: number } }
): number {
  let totalPoints = 0;
  let totalCredits = 0;
  
  Object.values(notesParUE).forEach(({ moyenne, credit }) => {
    totalPoints += moyenne * credit;
    totalCredits += credit;
  });
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/**
 * Calcule le nombre de crédits validés
 */
export function calculerCreditsValides(
  notesParUE: { [uniteId: string]: { moyenne: number; credit: number } }
): number {
  return Object.values(notesParUE)
    .filter(({ moyenne }) => isUEValidee(moyenne))
    .reduce((total, { credit }) => total + credit, 0);
}

/**
 * Détermine l'appréciation LMD basée sur la moyenne générale
 */
export function determinerAppreciation(moyenneGenerale: number): AppreciationLMD {
  if (moyenneGenerale >= 16) return 'A';
  if (moyenneGenerale >= 14) return 'B';
  if (moyenneGenerale >= 12) return 'C';
  if (moyenneGenerale >= 10) return 'D';
  if (moyenneGenerale >= 8) return 'E';
  if (moyenneGenerale >= 6) return 'F';
  return 'G';
}

/**
 * Détermine la décision du jury basée sur le pourcentage de crédits validés
 */
export function determinerDecisionJury(
  pourcentageCredits: number,
  moyenneGenerale: number
): DecisionJury {
  if (pourcentageCredits >= 60 && moyenneGenerale >= 10) {
    return 'ADMIS';
  } else if (pourcentageCredits >= 50 && moyenneGenerale >= 8) {
    return 'REPECHAGE';
  } else {
    return 'DOUBLE';
  }
}

/**
 * Calcule tous les résultats d'un étudiant
 */
export function calculerResultatsEtudiant(
  etudiantId: string,
  notesParUE: { [uniteId: string]: { notes: any; credit: number } },
  sessionType: SessionType
) {
  const resultatsUE: { [uniteId: string]: { moyenne: number; creditValide: boolean } } = {};
  let totalCredits = 0;
  
  // Calculer les moyennes par UE
  Object.entries(notesParUE).forEach(([uniteId, { notes, credit }]) => {
    const moyenne = calculerMoyenneUE(notes, sessionType);
    resultatsUE[uniteId] = {
      moyenne,
      creditValide: isUEValidee(moyenne)
    };
    totalCredits += credit;
  });
  
  // Calculer les totaux
  const moyenneGenerale = calculerMoyenneGenerale(
    Object.fromEntries(
      Object.entries(resultatsUE).map(([uniteId, { moyenne }]) => [
        uniteId,
        { moyenne, credit: notesParUE[uniteId].credit }
      ])
    )
  );
  
  const creditsValides = calculerCreditsValides(
    Object.fromEntries(
      Object.entries(resultatsUE).map(([uniteId, { moyenne }]) => [
        uniteId,
        { moyenne, credit: notesParUE[uniteId].credit }
      ])
    )
  );
  
  const pourcentageCredits = totalCredits > 0 ? (creditsValides / totalCredits) * 100 : 0;
  const appreciation = determinerAppreciation(moyenneGenerale);
  const decision = determinerDecisionJury(pourcentageCredits, moyenneGenerale);
  
  return {
    etudiantId,
    moyenneGenerale,
    totalCredits,
    creditsValides,
    pourcentageCredits,
    appreciation,
    decision,
    notesParUE: Object.fromEntries(
      Object.entries(resultatsUE).map(([uniteId, result]) => [
        uniteId,
        {
          ...result,
          notesParcours: notesParUE[uniteId].notes
        }
      ])
    )
  };
}
