import React from 'react';
import { Metadata } from 'next';
import PersonnelDataWrapper from '@/components/personnel/PersonnelDataWrapper';

// Métadonnées pour la section personnel
export const metadata: Metadata = {
  title: 'Gestion du Personnel | Institut Admin',
  description: 'Administration et suivi des ressources humaines - Personnel académique, scientifique et administratif',
  keywords: ['personnel', 'ressources humaines', 'gestion', 'administration', 'académique', 'scientifique', 'administratif'],
  openGraph: {
    title: 'Gestion du Personnel',
    description: 'Administration et suivi des ressources humaines',
    type: 'website',
  },
};

interface PersonnelLayoutProps {
  children: React.ReactNode;
}

// Server Component - Layout simple
const PersonnelLayout: React.FC<PersonnelLayoutProps> = ({ children }) => {
  return (
    <PersonnelDataWrapper>
      {children}
    </PersonnelDataWrapper>
  );
};

export default PersonnelLayout;