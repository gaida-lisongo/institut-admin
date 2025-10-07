import { Annee } from '@/types/annee';

export const fakeAnnees: Annee[] = [
  {
    _id: '1',
    debut: 2024,
    fin: 2025,
    description: 'Année académique 2024-2025',
    statut: 'active',
    dateCreation: new Date('2024-01-15'),
    dateModification: new Date('2024-09-01'),
    calendrier: [
      {
        evenement: 'Rentrée académique',
        date: new Date('2024-09-15'),
        description: 'Début des cours pour tous les niveaux',
        type: 'rentree'
      },
      {
        evenement: 'Examens du 1er semestre',
        date: new Date('2024-12-10'),
        description: 'Session d\'examens de fin du premier semestre',
        type: 'examen'
      },
      {
        evenement: 'Vacances de Noël',
        date: new Date('2024-12-20'),
        description: 'Pause académique de fin d\'année',
        type: 'vacances'
      },
      {
        evenement: 'Reprise des cours',
        date: new Date('2025-01-08'),
        description: 'Début du second semestre',
        type: 'rentree'
      },
      {
        evenement: 'Journée portes ouvertes',
        date: new Date('2025-03-15'),
        description: 'Présentation de l\'institut aux futurs étudiants',
        type: 'evenement'
      },
      {
        evenement: 'Examens finaux',
        date: new Date('2025-06-01'),
        description: 'Session d\'examens de fin d\'année',
        type: 'examen'
      },
      {
        evenement: 'Remise des diplômes',
        date: new Date('2025-07-15'),
        description: 'Cérémonie de graduation',
        type: 'evenement'
      }
    ],
    fraisAcademiques: [
      {
        fraisId: 'frais_1',
        montant: 500000,
        obligatoire: true,
        dateEcheance: new Date('2024-10-15')
      },
      {
        fraisId: 'frais_2',
        montant: 250000,
        obligatoire: true,
        dateEcheance: new Date('2025-02-15')
      }
    ]
  },
  {
    _id: '2',
    debut: 2023,
    fin: 2024,
    description: 'Année académique 2023-2024',
    statut: 'terminee',
    dateCreation: new Date('2023-01-10'),
    dateModification: new Date('2024-07-30'),
    calendrier: [
      {
        evenement: 'Rentrée académique',
        date: new Date('2023-09-18'),
        description: 'Début des cours pour tous les niveaux',
        type: 'rentree'
      },
      {
        evenement: 'Examens du 1er semestre',
        date: new Date('2023-12-15'),
        description: 'Session d\'examens de fin du premier semestre',
        type: 'examen'
      },
      {
        evenement: 'Vacances de Noël',
        date: new Date('2023-12-25'),
        description: 'Pause académique de fin d\'année',
        type: 'vacances'
      },
      {
        evenement: 'Reprise des cours',
        date: new Date('2024-01-10'),
        description: 'Début du second semestre',
        type: 'rentree'
      },
      {
        evenement: 'Examens finaux',
        date: new Date('2024-06-05'),
        description: 'Session d\'examens de fin d\'année',
        type: 'examen'
      },
      {
        evenement: 'Remise des diplômes',
        date: new Date('2024-07-20'),
        description: 'Cérémonie de graduation',
        type: 'evenement'
      }
    ],
    fraisAcademiques: [
      {
        fraisId: 'frais_3',
        montant: 450000,
        obligatoire: true,
        dateEcheance: new Date('2023-10-20')
      },
      {
        fraisId: 'frais_4',
        montant: 200000,
        obligatoire: true,
        dateEcheance: new Date('2024-02-20')
      }
    ]
  },
  {
    _id: '3',
    debut: 2025,
    fin: 2026,
    description: 'Année académique 2025-2026',
    statut: 'planifiee',
    dateCreation: new Date('2024-05-01'),
    dateModification: new Date('2024-05-01'),
    calendrier: [
      {
        evenement: 'Rentrée académique',
        date: new Date('2025-09-20'),
        description: 'Début des cours pour tous les niveaux',
        type: 'rentree'
      },
      {
        evenement: 'Examens du 1er semestre',
        date: new Date('2025-12-12'),
        description: 'Session d\'examens de fin du premier semestre',
        type: 'examen'
      },
      {
        evenement: 'Vacances de Noël',
        date: new Date('2025-12-22'),
        description: 'Pause académique de fin d\'année',
        type: 'vacances'
      },
      {
        evenement: 'Reprise des cours',
        date: new Date('2026-01-12'),
        description: 'Début du second semestre',
        type: 'rentree'
      },
      {
        evenement: 'Examens finaux',
        date: new Date('2026-06-08'),
        description: 'Session d\'examens de fin d\'année',
        type: 'examen'
      }
    ],
    fraisAcademiques: [
      {
        fraisId: 'frais_5',
        montant: 550000,
        obligatoire: true,
        dateEcheance: new Date('2025-10-10')
      }
    ]
  },
  {
    _id: '4',
    debut: 2022,
    fin: 2023,
    description: 'Année académique 2022-2023',
    statut: 'terminee',
    dateCreation: new Date('2022-01-05'),
    dateModification: new Date('2023-07-25'),
    calendrier: [
      {
        evenement: 'Rentrée académique',
        date: new Date('2022-09-12'),
        description: 'Début des cours pour tous les niveaux',
        type: 'rentree'
      },
      {
        evenement: 'Examens du 1er semestre',
        date: new Date('2022-12-08'),
        description: 'Session d\'examens de fin du premier semestre',
        type: 'examen'
      },
      {
        evenement: 'Vacances de Noël',
        date: new Date('2022-12-18'),
        description: 'Pause académique de fin d\'année',
        type: 'vacances'
      },
      {
        evenement: 'Reprise des cours',
        date: new Date('2023-01-05'),
        description: 'Début du second semestre',
        type: 'rentree'
      },
      {
        evenement: 'Examens finaux',
        date: new Date('2023-06-02'),
        description: 'Session d\'examens de fin d\'année',
        type: 'examen'
      },
      {
        evenement: 'Remise des diplômes',
        date: new Date('2023-07-18'),
        description: 'Cérémonie de graduation',
        type: 'evenement'
      }
    ],
    fraisAcademiques: [
      {
        fraisId: 'frais_6',
        montant: 400000,
        obligatoire: true,
        dateEcheance: new Date('2022-10-25')
      },
      {
        fraisId: 'frais_7',
        montant: 180000,
        obligatoire: false,
        dateEcheance: new Date('2023-02-25')
      }
    ]
  }
];
