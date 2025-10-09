"use client";
import React from 'react';
import PersonnelClientWrapper from '@/components/personnel/PersonnelClientWrapper';


interface PersonnelLayoutProps {
  children: React.ReactNode;
}

// Server Component - Layout simple
const PersonnelLayout: React.FC<PersonnelLayoutProps> = ({ children }) => {
  return (
    <PersonnelClientWrapper>
      {children}
    </PersonnelClientWrapper>
  );
};

export default PersonnelLayout;