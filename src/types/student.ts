export interface Etudiant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  sexe: string;
  classeId: string;
}

export interface Classe {
  _id: string;
  nom: string;
  niveau: string;
}

export interface EtudiantWithClasse extends Etudiant {
  classe?: Classe;
}
