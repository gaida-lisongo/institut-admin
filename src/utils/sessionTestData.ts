import { Session, Question, Cours } from '@/types/session';

export const sampleSessions: Session[] = [
  {
    _id: '1',
    designation: 'Interrogation Chapitre 1 - Les fonctions',
    statut: 'active',
    coursId: '1',
    maximum: 20,
    questions: [
      {
        _id: '1',
        enonce: ['Quelle est la définition d\'une fonction mathématique ?'],
        choix: [
          'Une relation qui associe à chaque élément d\'un ensemble de départ au plus un élément d\'un ensemble d\'arrivée',
          'Une relation qui associe à chaque élément d\'un ensemble de départ exactement un élément d\'un ensemble d\'arrivée',
          'Une relation quelconque entre deux ensembles',
          'Une équation avec une inconnue'
        ],
        reponse: 1,
        pts: 5
      },
      {
        _id: '2',
        enonce: ['Soit f(x) = 2x + 3', 'Calculer f(4)'],
        choix: ['8', '11', '12', '7'],
        reponse: 1,
        pts: 3
      },
      {
        _id: '3',
        enonce: ['Quelle est l\'image de 0 par la fonction f(x) = x² - 1 ?'],
        choix: ['-1', '0', '1', '2'],
        reponse: 0,
        pts: 2
      }
    ]
  },
  {
    _id: '2',
    designation: 'Quiz - Grammaire française',
    statut: 'brouillon',
    coursId: '2',
    maximum: 15,
    questions: [
      {
        _id: '4',
        enonce: ['Quelle est la nature du mot "rapidement" dans la phrase :', '"Il court rapidement"'],
        choix: ['Adjectif', 'Adverbe', 'Nom', 'Verbe'],
        reponse: 1,
        pts: 3
      },
      {
        _id: '5',
        enonce: ['Conjuguez le verbe "aller" à la première personne du singulier du futur simple'],
        choix: ['Je vais', 'J\'irai', 'J\'allais', 'Je suis allé'],
        reponse: 1,
        pts: 4
      }
    ]
  },
  {
    _id: '3',
    designation: 'Contrôle - La Révolution française',
    statut: 'terminee',
    coursId: '3',
    maximum: 25,
    questions: [
      {
        _id: '6',
        enonce: ['En quelle année a commencé la Révolution française ?'],
        choix: ['1788', '1789', '1790', '1791'],
        reponse: 1,
        pts: 2
      },
      {
        _id: '7',
        enonce: ['Qui était le roi de France au début de la Révolution ?'],
        choix: ['Louis XIV', 'Louis XV', 'Louis XVI', 'Louis XVIII'],
        reponse: 2,
        pts: 3
      },
      {
        _id: '8',
        enonce: ['Quelle est la devise de la République française ?'],
        choix: [
          'Liberté, Égalité, Fraternité',
          'Honneur et Patrie',
          'Dieu et mon Droit',
          'Un pour tous, tous pour un'
        ],
        reponse: 0,
        pts: 2
      }
    ]
  }
];

export const initializeSessionTestData = () => {
  console.log('Données de test sessions disponibles:', {
    sessions: sampleSessions.length,
    totalQuestions: sampleSessions.reduce((total, session) => total + session.questions.length, 0)
  });
};
