"use client";

import React, { useState } from 'react';
import { Unite } from '@/services/UniteService';
import { Cours } from '@/services/CoursService';

interface UniteCardProps {
  unite: Unite;
  onEdit: (unite: Unite) => void;
  onViewCours: (unite: Unite) => void;
}

const UniteCard: React.FC<UniteCardProps> = ({ unite, onEdit, onViewCours }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeColor = (type: string) => {
    return type === 'Obigatoire' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getResponsableNames = () => {
    return unite.responsable.map((resp, index) => {
      if (typeof resp.anneeId === 'object') {
        return `${resp.anneeId.debut}-${resp.anneeId.fin}`;
      }
      return `Année ${index + 1}`;
    }).join(', ');
  };

  const coursCount = Array.isArray(unite.cours) ? unite.cours.length : 0;

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {unite.descripteur.designation}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Code: {unite.descripteur.code}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(unite.descripteur.type)}`}>
              {unite.descripteur.type}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {unite.descripteur.credit}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">crédits</div>
        </div>
      </div>

      {/* Mention */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          {unite.descripteur.mention}
        </span>
      </div>

      {/* Années de responsabilité */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Années:</span> {getResponsableNames()}
        </p>
      </div>

      {/* Objectifs (preview) */}
      {unite.descripteur.objectif.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            <span className="font-medium">Objectif:</span> {unite.descripteur.objectif[0]}
            {unite.descripteur.objectif.length > 1 && '...'}
          </p>
        </div>
      )}

      {/* Cours associés */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cours associés
          </span>
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {coursCount} cours
          </span>
        </div>
      </div>

      {/* Ressources */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {unite.ressources.length} ressources
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {unite.bibliographie.length} références
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => onEdit(unite)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Éditer
        </button>
        {/* <button
          onClick={() => onViewCours(unite)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Cours
        </button> */}
      </div>
    </div>
  );
};

export default UniteCard;
