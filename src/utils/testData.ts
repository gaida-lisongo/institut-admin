import { Etudiant, Classe } from '@/types/student';

export const sampleClasses: Classe[] = [
  { _id: '1', nom: '6ème A', niveau: '6ème' },
  { _id: '2', nom: '6ème B', niveau: '6ème' },
  { _id: '3', nom: '5ème A', niveau: '5ème' },
  { _id: '4', nom: '5ème B', niveau: '5ème' },
  { _id: '5', nom: '4ème A', niveau: '4ème' },
  { _id: '6', nom: '4ème B', niveau: '4ème' },
  { _id: '7', nom: '3ème A', niveau: '3ème' },
  { _id: '8', nom: '3ème B', niveau: '3ème' },
];

export const sampleEtudiants: Etudiant[] = [
  {
    _id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    sexe: 'M',
    classeId: '1'
  },
  {
    _id: '2',
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@email.com',
    sexe: 'F',
    classeId: '1'
  },
  {
    _id: '3',
    nom: 'Durand',
    prenom: 'Pierre',
    email: 'pierre.durand@email.com',
    sexe: 'M',
    classeId: '2'
  },
  {
    _id: '4',
    nom: 'Moreau',
    prenom: 'Sophie',
    email: 'sophie.moreau@email.com',
    sexe: 'F',
    classeId: '2'
  },
  {
    _id: '5',
    nom: 'Petit',
    prenom: 'Lucas',
    email: 'lucas.petit@email.com',
    sexe: 'M',
    classeId: '3'
  },
  {
    _id: '6',
    nom: 'Bernard',
    prenom: 'Emma',
    email: 'emma.bernard@email.com',
    sexe: 'F',
    classeId: '3'
  },
  {
    _id: '7',
    nom: 'Rousseau',
    prenom: 'Thomas',
    email: 'thomas.rousseau@email.com',
    sexe: 'M',
    classeId: '4'
  },
  {
    _id: '8',
    nom: 'Leroy',
    prenom: 'Camille',
    email: 'camille.leroy@email.com',
    sexe: 'F',
    classeId: '4'
  },
  {
    _id: '9',
    nom: 'Garcia',
    prenom: 'Antoine',
    email: 'antoine.garcia@email.com',
    sexe: 'M',
    classeId: '5'
  },
  {
    _id: '10',
    nom: 'Roux',
    prenom: 'Léa',
    email: 'lea.roux@email.com',
    sexe: 'F',
    classeId: '5'
  }
];

export const sampleCSV = `nom,prenom,email,sexe,classeId
Dupont,Jean,jean.dupont@email.com,M,1
Martin,Marie,marie.martin@email.com,F,1
Durand,Pierre,pierre.durand@email.com,M,2
Moreau,Sophie,sophie.moreau@email.com,F,2
Petit,Lucas,lucas.petit@email.com,M,3
Bernard,Emma,emma.bernard@email.com,F,3`;

// Fonction utilitaire pour initialiser des données de test
export const initializeTestData = () => {
  // Cette fonction peut être utilisée pour peupler les stores avec des données de test
  console.log('Données de test disponibles:', {
    classes: sampleClasses.length,
    etudiants: sampleEtudiants.length
  });
};
