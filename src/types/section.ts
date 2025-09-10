// Types basés sur le schéma MongoDB
export interface Offre {
  icon: string;
  titre: string;
  description: string;
}

export interface Activity {
  titre: string;
  date_activity: Date;
  description: string;
}

export interface Calendrier {
  annee: string;
  current: boolean;
  activities: Activity[];
}

export interface Alumn {
  photo: string;
  nom: string;
  titre: string;
  description: string;
}

export interface Event {
  photo: string;
  titre: string;
  description: string;
}

export interface Galery {
  annee: string;
  current: boolean;
  events: Event[];
}

export interface AgendaEvent {
  date_event: Date;
  titre: string;
  description: string;
}

export interface Agenda {
  annee: string;
  current: boolean;
  events: AgendaEvent[];
}

export interface Mission {
  titre: string;
  description: string;
}

export interface History {
  date_event: Date;
  titre: string;
  description: string;
}

export interface Team {
  photo: string;
  nom: string;
  grade: string;
  fonction: string;
}

export interface MotChef {
  photo?: string;
  description?: string;
}

export interface Description {
  sigle: string;
  designation: string;
  devise: string;
  objectif: string;
  images: string[];
  motChef?: MotChef;
}

export interface Contact {
  addresse: string;
  telephone: string;
  email: string;
  www: string; // Rendre obligatoire au lieu d'optionnel
}

export interface Section {
  _id?: string;
  description: Description;
  offres: Offre[];
  calendrier: Calendrier[];
  alumni: Alumn[];
  galery: Galery[];
  agenda: Agenda[];
  missions: Mission[];
  history: History[];
  team: Team[];
  valeurs: string[];
  contact: Contact;
  createdAt?: string;
  updatedAt?: string;
}

// Type pour le formulaire de création/modification (sans _id, createdAt, updatedAt)
export type CreateSectionData = Omit<Section, '_id' | 'createdAt' | 'updatedAt'>;

// Type pour les mises à jour partielles
export type UpdateSectionData = Partial<Omit<Section, '_id' | 'createdAt' | 'updatedAt'>>;