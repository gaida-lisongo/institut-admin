import { ClasseDetailResponse, FicheEvaluation, SemestreDetail, SessionType } from "@/types/juryClasseDetail";

// Local copies of the shapes expected by GrilleDocument
interface UniteEnseignement {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  cours?: {
    titre: string;
    coursId: string;
    credit: number;
  }[];
}

interface Etudiant {
  _id: string;
  nom: string;
  postnom: string;
  prenom: string;
  matricule: string;
  notes?: {
    [uniteId: string]: {
      ecue: string;
      note: number;
    }[];
  };
}

interface SemestreData {
  _id: string;
  designation: string;
  unites: UniteEnseignement[];
  etudiants: Etudiant[];
}

interface ClasseData {
  _id: string;
  designation: string;
  semestre1?: SemestreData;
  semestre2?: SemestreData;
}

export interface GrilleDocumentData {
  classe: ClasseData;
  semestre?: SemestreData;
  anneeAcademique: string;
  sessionType?: SessionType;
}

function mapSemestre(s: SemestreDetail, sessionType: SessionType): SemestreData {
  console.log("=== DEBUG MAPPER ===");
  console.log("SemestreDetail reçu:", s);
  console.log("Unites dans semestre:", s.unites?.length || 0);
  console.log("Etudiants dans semestre:", s.etudiants?.length || 0);
  
  const mapped = {
    _id: s.semestreId,
    designation: s.designation,
    unites: (s.unites || []).map((u) => {
      console.log("Mapping unite:", u.code, u.designation);
      return {
        _id: u.uniteId,
        code: u.code,
        designation: u.designation,
        credit: u.credit,
        cours: (u.cours || []).map((c) => ({
          titre: c.titre,
          coursId: c.coursId,
          credit: c.credit
        })),
      };
    }),
    etudiants: (s.etudiants || []).map((e) => ({
      _id: e._id,
      nom: e.nom,
      postnom: e.post_nom, // rename to fit GrilleDocument expectation
      prenom: e.prenom,
      matricule: e.matricule,
      // Extraire les notes depuis les fiches des cours
      notes: extractNotesFromFiches(e._id, s.unites, sessionType),
    })),
  };
  
  console.log("Semestre mappé:", mapped);
  console.log("Unites mappées:", mapped.unites.length);
  return mapped;
}

/**
 * Extrait les notes d'un étudiant depuis les fiches des cours
 */
function extractNotesFromFiches(
  etudiantId: string, 
  unites: any[], 
  sessionType: SessionType
): { [uniteId: string]: { ecue: string; note: number }[] } {
  let notes: { [uniteId: string]: { ecue: string; note: number }[] } = {};
  
  unites.forEach((unite) => {
    console.log('====DEBUG MAPPING NOTE====');
    console.log('etudiantId', etudiantId)
    console.log('unite', unite)
    let ecues: {
      ecue: string;
      note: number;
    }[] = [];
    unite.cours?.forEach((cours: any) => {
      console.log('cours', cours)
      const ficheEtudiant = cours.fiches?.find((f: any) => f.etudiantId?._id === etudiantId);
      console.log('ficheEtudiant', ficheEtudiant)
      console.log('begin notes', notes)
      if (ficheEtudiant) {
        if (sessionType === 'principale') {
          ecues.push({
            ecue: cours.coursId,
            note: parseFloat(ficheEtudiant.cmi || 0) + parseFloat(ficheEtudiant.examen || 0)
          });
        } else if (sessionType === 'rattrapage') {
          ecues.push({
            ecue: cours.coursId,
            note: parseFloat(ficheEtudiant.rattrapage || 0)
          });
        } else if (sessionType === 'annuelle') {
          const sTotal = parseFloat(ficheEtudiant.cmi || 0) + parseFloat(ficheEtudiant.examen || 0);
          const rTotal = parseFloat(ficheEtudiant.rattrapage || 0);
          ecues.push({
            ecue: cours.coursId,
            note: rTotal > sTotal ? rTotal : sTotal
          });
        }
        console.log('current notes', notes)
      }
    });
    notes[unite.uniteId] = ecues;
    console.log('end notes in current unite', notes)
    });
  
  console.log('end notes', notes)
  return notes;
}

/**
 * Build the data model for GrilleDocument from API response.
 * SessionType determines which data to include and how to process it.
 */
export function toGrilleDocumentData(
  api: ClasseDetailResponse,
  anneeAcademique: string,
  sessionType: SessionType,
  semestreId?: string
): GrilleDocumentData {
  console.log("=== DEBUG toGrilleDocumentData ===");
  console.log("API Response:", api);
  console.log("SessionType:", sessionType);
  
  const semestres = api.data.semestres || [];
  console.log("Semestres trouvés:", semestres.length);
  semestres.forEach((s, i) => {
    console.log(`Semestre ${i}:`, s.designation, "Unites:", s.unites?.length || 0);
  });
  
  const semestre1Src = semestreId
    ? semestres.find((s) => s.semestreId === semestreId) || semestres[0]
    : semestres[0];
  const semestre2Src = semestres.length > 1 ? semestres[1] : undefined;

  const classe: ClasseData = {
    _id: api.data.classeId,
    designation: api.data.designation,
  };

  if (sessionType === 'principale' || sessionType === 'rattrapage') {
    if (semestre1Src) {
      classe.semestre1 = mapSemestre(semestre1Src, sessionType);
    }
    return {
      classe,
      semestre: classe.semestre1,
      anneeAcademique,
      sessionType,
    };
  }

  // Pour la grille annuelle, on inclut tous les semestres
  if (semestre1Src) classe.semestre1 = mapSemestre(semestre1Src, sessionType);
  if (semestre2Src) classe.semestre2 = mapSemestre(semestre2Src, sessionType);
  return {
    classe,
    anneeAcademique,
    sessionType,
  };
}
