import { ClasseDetailResponse, SemestreDetail } from "@/types/juryClasseDetail";

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
      [evaluationCode: string]: number | string;
    };
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
}

function mapSemestre(s: SemestreDetail): SemestreData {
  return {
    _id: s.semestreId,
    designation: s.designation,
    unites: (s.unites || []).map((u) => ({
      _id: u.uniteId,
      code: u.code,
      designation: u.designation,
      credit: u.credit,
      cours: (u.cours || []).map((c) => ({
        titre: c.titre,
        coursId: c.coursId,
        credit: c.credit,
      })),
    })),
    etudiants: (s.etudiants || []).map((e) => ({
      _id: e._id,
      nom: e.nom,
      postnom: e.post_nom, // rename to fit GrilleDocument expectation
      prenom: e.prenom,
      matricule: e.matricule,
      // Notes are not provided by the API here; keep empty structure for now
      notes: {},
    })),
  };
}

/**
 * Build the data model for GrilleDocument from API response.
 * If option is 'single', only the first semestre is included unless `semestreId` is provided to target a specific one.
 */
export function toGrilleDocumentData(
  api: ClasseDetailResponse,
  anneeAcademique: string,
  option: 'single' | 'double',
  semestreId?: string
): GrilleDocumentData {
  const semestres = api.data.semestres || [];
  const semestre1Src = semestreId
    ? semestres.find((s) => s.semestreId === semestreId) || semestres[0]
    : semestres[0];
  const semestre2Src = semestres.length > 1 ? semestres[1] : undefined;

  const classe: ClasseData = {
    _id: api.data.classeId,
    designation: api.data.designation,
  };

  if (option === 'single') {
    if (semestre1Src) {
      classe.semestre1 = mapSemestre(semestre1Src);
    }
    return {
      classe,
      semestre: classe.semestre1,
      anneeAcademique,
    };
  }

  // double
  if (semestre1Src) classe.semestre1 = mapSemestre(semestre1Src);
  if (semestre2Src) classe.semestre2 = mapSemestre(semestre2Src);

  return {
    classe,
    anneeAcademique,
  };
}
