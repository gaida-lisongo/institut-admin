"use client";

import React, { useMemo } from 'react';
import { GraduationCap, Book, Award, Users, Calendar } from 'lucide-react';
import { Classe, Cycle } from '@/services/CycleService';
import useSemestreStore from '@/stores/semestreStore';
import { useUniteStore } from '@/stores/uniteStore';

interface ClasseBannerProps {
  classe: Classe;
  cycle: Cycle;
  section?: any;
}

const ClasseBanner: React.FC<ClasseBannerProps> = ({ classe, cycle, section }) => {
  const { semestres } = useSemestreStore();
  const { unites } = useUniteStore();

  // Filtrer les semestres de cette classe
  const classeSemestres = semestres.filter(s => classe.semestres.includes(s._id || ''));

  // Calculer les statistiques
  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalUnites = 0;
    let totalInscriptions = 0;

    classeSemestres.forEach(semestre => {
      totalInscriptions += semestre.insription?.length || 0;
      semestre.unites.forEach(uniteId => {
        const unite = unites.find(u => u._id === uniteId);
        if (unite) {
          totalCredits += unite.descripteur?.credit || 0;
          totalUnites++;
        }
      });
    });

    return {
      semestres: classeSemestres.length,
      credits: totalCredits,
      unites: totalUnites,
      inscriptions: totalInscriptions
    };
  }, [classeSemestres, unites]);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{classe.designation}</h1>
            <p className="text-blue-100 text-sm">{classe.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-sm">Cycle: {cycle.designation}</p>
          <p className="text-blue-100 text-sm">Système: {cycle.systeme}</p>
          {section && (
            <p className="text-blue-100 text-sm">Section: {section.description?.sigle}</p>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <span className="text-sm text-blue-200">Semestres</span>
          </div>
          <p className="text-2xl font-bold">{stats.semestres}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-yellow-200" />
            <span className="text-sm text-blue-200">Crédits</span>
          </div>
          <p className="text-2xl font-bold">{stats.credits}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Book className="w-5 h-5 text-green-200" />
            <span className="text-sm text-blue-200">Unités</span>
          </div>
          <p className="text-2xl font-bold">{stats.unites}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-200" />
            <span className="text-sm text-blue-200">Inscriptions</span>
          </div>
          <p className="text-2xl font-bold">{stats.inscriptions}</p>
        </div>
      </div>
    </div>
  );
};

export default ClasseBanner;