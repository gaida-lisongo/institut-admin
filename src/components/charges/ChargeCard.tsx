"use client";
import React from "react";
import { ChargeWithDetails } from "@/services/ChargeService";

interface ChargeCardProps {
  charge: ChargeWithDetails;
  onEdit?: (charge: ChargeWithDetails) => void;
  onDelete?: (charge: ChargeWithDetails) => void;
  onViewDetails?: (charge: ChargeWithDetails) => void;
}

export default function ChargeCard({ charge, onEdit, onDelete, onViewDetails }: ChargeCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-lg font-medium">
              📚
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {charge.cours?.titre || "Cours non défini"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {charge.cours?.credit || 0} crédit{(charge.cours?.credit || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Badge de statut */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Actif
        </span>
      </div>

      {/* Informations de l'enseignant */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-gray-500 dark:text-gray-400">👨‍🏫</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enseignant</span>
        </div>
        <div className="ml-6">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {charge.agent ? `${charge.agent.prenom} ${charge.agent.nom}` : "Agent non défini"}
          </p>
          {charge.agent?.grade && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {charge.agent.grade}
            </p>
          )}
        </div>
      </div>

      {/* Informations de l'année */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-gray-500 dark:text-gray-400">📅</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Année académique</span>
        </div>
        <div className="ml-6">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {charge.annee ? `${charge.annee.annee} - ${charge.annee.designation}` : "Année non définie"}
          </p>
        </div>
      </div>

      {/* Description du cours */}
      {charge.cours?.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {charge.cours.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onViewDetails?.(charge)}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Voir détails
        </button>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(charge)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Modifier"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(charge)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}