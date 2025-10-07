export interface Province {
  _id: string;
  designation: string;
  code: string;
  description: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProvinceFormData {
  designation: string;
  code: string;
  description: string;
  photo?: string;
}
