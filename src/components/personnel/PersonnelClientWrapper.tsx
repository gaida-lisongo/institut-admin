"use client";

import React from 'react';
import PersonnelDataWrapper from './PersonnelDataWrapper';

interface PersonnelClientWrapperProps {
  children: React.ReactNode;
}

// Client Component wrapper - Encapsule toute la logique client
const PersonnelClientWrapper: React.FC<PersonnelClientWrapperProps> = ({ children }) => {
  return (
    <PersonnelDataWrapper>
      {children}
    </PersonnelDataWrapper>
  );
};

export default PersonnelClientWrapper;
