export interface Offre {
  _id?: string;
  icon: string; // URL de l'image ou nom de l'icône
  titre: string;
  description: string;
  sectionId: string; // ID de la section à laquelle appartient l'offre
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface OffreFormData {
  icon: string;
  titre: string;
  description: string;
  sectionId: string;
}

export interface CreateOffreData {
  icon: string;
  titre: string;
  description: string;
  sectionId: string;
}

export interface UpdateOffreData {
  icon?: string;
  titre?: string;
  description?: string;
  sectionId?: string;
}
