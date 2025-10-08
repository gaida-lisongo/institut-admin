import { Personnel, PersonnelStats } from '@/types/personnel';

export const fakePersonnelData: Personnel[] = [
  // Personnel Académique
  {
    _id: "acad_001",
    nom: "Mukendi",
    prenom: "Jean-Baptiste",
    email: "j.mukendi@institut.cd",
    telephone: "+243 812 345 678",
    adresse: "123 Avenue Lumumba, Kinshasa",
    dateNaissance: "1985-03-15",
    lieuNaissance: "Kinshasa",
    sexe: "M",
    etatCivil: "Marié(e)",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-1.jpg",
    dateEmbauche: "2015-09-01",
    salaire: 1200000,
    statut: "Actif",
    provinceId: "kinshasa",
    type: "Académique",
    grade: "Professeur Titulaire",
    diplomes: [
      {
        _id: "dip_001",
        intitule: "Doctorat en Mathématiques",
        institution: "Université de Kinshasa",
        anneeObtention: 2010,
        mention: "Très Bien",
        domaine: "Mathématiques Appliquées"
      },
      {
        _id: "dip_002",
        intitule: "Master en Mathématiques",
        institution: "Université de Kinshasa",
        anneeObtention: 2005,
        mention: "Bien",
        domaine: "Mathématiques"
      }
    ],
    experiences: [
      {
        _id: "exp_001",
        poste: "Professeur de Mathématiques",
        entreprise: "Institut Supérieur de Kinshasa",
        dateDebut: "2015-09-01",
        description: "Enseignement des mathématiques avancées",
        enCours: true
      }
    ],
    documents: [
      {
        _id: "doc_001",
        nom: "CV_Mukendi_2024.pdf",
        type: "CV",
        url: "/documents/cv_mukendi.pdf",
        dateUpload: "2024-01-15"
      }
    ],
    createdAt: "2015-09-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "acad_002",
    nom: "Kabamba",
    prenom: "Marie-Claire",
    email: "m.kabamba@institut.cd",
    telephone: "+243 823 456 789",
    adresse: "456 Boulevard du 30 Juin, Lubumbashi",
    dateNaissance: "1982-07-22",
    lieuNaissance: "Lubumbashi",
    sexe: "F",
    etatCivil: "Célibataire",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-2.jpg",
    dateEmbauche: "2018-02-15",
    salaire: 950000,
    statut: "Actif",
    provinceId: "haut_katanga",
    type: "Académique",
    grade: "Professeur Associé",
    diplomes: [
      {
        _id: "dip_003",
        intitule: "Doctorat en Physique",
        institution: "Université de Lubumbashi",
        anneeObtention: 2015,
        mention: "Très Bien",
        domaine: "Physique Théorique"
      }
    ],
    experiences: [
      {
        _id: "exp_002",
        poste: "Professeur de Physique",
        entreprise: "Institut Supérieur de Lubumbashi",
        dateDebut: "2018-02-15",
        description: "Enseignement de la physique théorique et expérimentale",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2018-02-15T00:00:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },

  // Personnel Scientifique
  {
    _id: "sci_001",
    nom: "Tshiamala",
    prenom: "Patrick",
    email: "p.tshiamala@institut.cd",
    telephone: "+243 834 567 890",
    adresse: "789 Avenue Kasavubu, Kananga",
    dateNaissance: "1988-11-08",
    lieuNaissance: "Kananga",
    sexe: "M",
    etatCivil: "Marié(e)",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-3.jpg",
    dateEmbauche: "2020-01-10",
    salaire: 800000,
    statut: "Actif",
    provinceId: "kasai_central",
    type: "Scientifique",
    grade: "Chercheur Senior",
    diplomes: [
      {
        _id: "dip_004",
        intitule: "Master en Informatique",
        institution: "Université de Kinshasa",
        anneeObtention: 2012,
        mention: "Très Bien",
        domaine: "Intelligence Artificielle"
      }
    ],
    experiences: [
      {
        _id: "exp_003",
        poste: "Chercheur en IA",
        entreprise: "Institut de Recherche Scientifique",
        dateDebut: "2020-01-10",
        description: "Recherche en intelligence artificielle et machine learning",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2020-01-10T00:00:00Z",
    updatedAt: "2024-01-05T09:15:00Z"
  },
  {
    _id: "sci_002",
    nom: "Mbuyi",
    prenom: "Esperance",
    email: "e.mbuyi@institut.cd",
    telephone: "+243 845 678 901",
    adresse: "321 Avenue Mobutu, Mbuji-Mayi",
    dateNaissance: "1990-05-14",
    lieuNaissance: "Mbuji-Mayi",
    sexe: "F",
    etatCivil: "Célibataire",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-4.jpg",
    dateEmbauche: "2022-03-01",
    salaire: 650000,
    statut: "Actif",
    provinceId: "kasai_oriental",
    type: "Scientifique",
    grade: "Chercheur Junior",
    diplomes: [
      {
        _id: "dip_005",
        intitule: "Master en Biologie",
        institution: "Université de Mbuji-Mayi",
        anneeObtention: 2018,
        mention: "Bien",
        domaine: "Biologie Moléculaire"
      }
    ],
    experiences: [
      {
        _id: "exp_004",
        poste: "Chercheur en Biologie",
        entreprise: "Laboratoire de Recherche Biologique",
        dateDebut: "2022-03-01",
        description: "Recherche en biologie moléculaire et génétique",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2022-03-01T00:00:00Z",
    updatedAt: "2024-01-12T16:45:00Z"
  },

  // Personnel Administratif
  {
    _id: "admin_001",
    nom: "Ngalula",
    prenom: "Joseph",
    email: "j.ngalula@institut.cd",
    telephone: "+243 856 789 012",
    adresse: "654 Avenue de la Paix, Matadi",
    dateNaissance: "1975-12-03",
    lieuNaissance: "Matadi",
    sexe: "M",
    etatCivil: "Marié(e)",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-5.jpg",
    dateEmbauche: "2010-06-15",
    salaire: 750000,
    statut: "Actif",
    provinceId: "kongo_central",
    type: "Administratif",
    grade: "Directeur Administratif",
    diplomes: [
      {
        _id: "dip_006",
        intitule: "Master en Administration",
        institution: "Université de Kinshasa",
        anneeObtention: 2008,
        mention: "Bien",
        domaine: "Administration Publique"
      }
    ],
    experiences: [
      {
        _id: "exp_005",
        poste: "Directeur Administratif",
        entreprise: "Institut Supérieur",
        dateDebut: "2010-06-15",
        description: "Gestion administrative et financière",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2010-06-15T00:00:00Z",
    updatedAt: "2024-01-08T11:30:00Z"
  },
  {
    _id: "admin_002",
    nom: "Kalala",
    prenom: "Beatrice",
    email: "b.kalala@institut.cd",
    telephone: "+243 867 890 123",
    adresse: "987 Avenue Lumumba, Bukavu",
    dateNaissance: "1983-09-18",
    lieuNaissance: "Bukavu",
    sexe: "F",
    etatCivil: "Divorcé(e)",
    nationalite: "Congolaise",
    photo: "/images/avatars/avatar-6.jpg",
    dateEmbauche: "2016-08-20",
    salaire: 550000,
    statut: "Actif",
    provinceId: "sud_kivu",
    type: "Administratif",
    grade: "Secrétaire Générale",
    diplomes: [
      {
        _id: "dip_007",
        intitule: "Licence en Secrétariat",
        institution: "Institut Supérieur de Bukavu",
        anneeObtention: 2005,
        mention: "Bien",
        domaine: "Secrétariat de Direction"
      }
    ],
    experiences: [
      {
        _id: "exp_006",
        poste: "Secrétaire Générale",
        entreprise: "Institut Supérieur",
        dateDebut: "2016-08-20",
        description: "Coordination administrative et secrétariat de direction",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2016-08-20T00:00:00Z",
    updatedAt: "2024-01-03T13:20:00Z"
  },

  // Personnels supplémentaires pour avoir plus de données
  {
    _id: "acad_003",
    nom: "Ilunga",
    prenom: "David",
    email: "d.ilunga@institut.cd",
    telephone: "+243 878 901 234",
    adresse: "147 Avenue Kabila, Kolwezi",
    dateNaissance: "1979-04-25",
    lieuNaissance: "Kolwezi",
    sexe: "M",
    etatCivil: "Marié(e)",
    nationalite: "Congolaise",
    dateEmbauche: "2012-01-15",
    salaire: 1100000,
    statut: "Actif",
    provinceId: "lualaba",
    type: "Académique",
    grade: "Professeur",
    diplomes: [
      {
        _id: "dip_008",
        intitule: "Doctorat en Chimie",
        institution: "Université de Lubumbashi",
        anneeObtention: 2008,
        mention: "Très Bien",
        domaine: "Chimie Organique"
      }
    ],
    experiences: [
      {
        _id: "exp_007",
        poste: "Professeur de Chimie",
        entreprise: "Institut Supérieur de Kolwezi",
        dateDebut: "2012-01-15",
        description: "Enseignement de la chimie organique et inorganique",
        enCours: true
      }
    ],
    documents: [],
    createdAt: "2012-01-15T00:00:00Z",
    updatedAt: "2024-01-07T15:10:00Z"
  },
  {
    _id: "admin_003",
    nom: "Mwamba",
    prenom: "Grace",
    email: "g.mwamba@institut.cd",
    telephone: "+243 889 012 345",
    adresse: "258 Avenue Tshatshi, Kananga",
    dateNaissance: "1987-01-12",
    lieuNaissance: "Kananga",
    sexe: "F",
    etatCivil: "Célibataire",
    nationalite: "Congolaise",
    dateEmbauche: "2019-05-10",
    salaire: 480000,
    statut: "Inactif",
    provinceId: "kasai_central",
    type: "Administratif",
    grade: "Comptable",
    diplomes: [
      {
        _id: "dip_009",
        intitule: "Licence en Comptabilité",
        institution: "Université de Kananga",
        anneeObtention: 2010,
        mention: "Assez Bien",
        domaine: "Comptabilité et Finance"
      }
    ],
    experiences: [
      {
        _id: "exp_008",
        poste: "Comptable",
        entreprise: "Institut Supérieur",
        dateDebut: "2019-05-10",
        dateFin: "2023-12-31",
        description: "Gestion comptable et financière",
        enCours: false
      }
    ],
    documents: [],
    createdAt: "2019-05-10T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export const generatePersonnelStats = (personnels: Personnel[]): PersonnelStats => {
  const total = personnels.length;
  const actifs = personnels.filter(p => p.statut === 'Actif').length;
  const inactifs = personnels.filter(p => p.statut === 'Inactif').length;
  
  // Nouveaux (embauchés dans les 12 derniers mois)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const nouveaux = personnels.filter(p => new Date(p.dateEmbauche) > oneYearAgo).length;

  // Par type
  const parType = {
    academique: personnels.filter(p => p.type === 'Académique').length,
    scientifique: personnels.filter(p => p.type === 'Scientifique').length,
    administratif: personnels.filter(p => p.type === 'Administratif').length,
  };

  // Par province
  const parProvince: Record<string, number> = {};
  personnels.forEach(p => {
    parProvince[p.provinceId] = (parProvince[p.provinceId] || 0) + 1;
  });

  // Salaire moyen
  const salaireMoyen = personnels.reduce((sum, p) => sum + p.salaire, 0) / total;

  // Âges moyens
  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const ages = personnels.map(p => calculateAge(p.dateNaissance));
  const ageGlobal = ages.reduce((sum, age) => sum + age, 0) / ages.length;

  const agesMoyens = {
    global: ageGlobal,
    parType: {
      'Académique': personnels.filter(p => p.type === 'Académique')
        .map(p => calculateAge(p.dateNaissance))
        .reduce((sum, age, _, arr) => sum + age / arr.length, 0),
      'Scientifique': personnels.filter(p => p.type === 'Scientifique')
        .map(p => calculateAge(p.dateNaissance))
        .reduce((sum, age, _, arr) => sum + age / arr.length, 0),
      'Administratif': personnels.filter(p => p.type === 'Administratif')
        .map(p => calculateAge(p.dateNaissance))
        .reduce((sum, age, _, arr) => sum + age / arr.length, 0),
    }
  };

  return {
    total,
    actifs,
    inactifs,
    nouveaux,
    parType,
    parProvince,
    salaireMoyen,
    agesMoyens
  };
};
