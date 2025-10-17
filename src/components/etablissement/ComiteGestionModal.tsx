"use client";
import React, { useEffect, useState } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, Award, Briefcase } from "lucide-react";
import { usePersonnelStore } from "@/stores/personnelStore";
import { Personnel } from "@/types/personnel";

interface ComiteMembre {
  membreId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string
  };
  role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
  
}

interface ComiteGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  comite: ComiteMembre[];
  etablissementName: string;
}

const roleLabels: Record<string, string> = {
  DG: "Directeur Général",
  SGACAD: "Secrétaire Général Académique",
  SGAD: "Secrétaire Général Administratif",
  SGR: "Secrétaire Général à la Recherche",
  AB: "Administrateur du Budget",
};

const roleColors: Record<string, string> = {
  DG: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  SGACAD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SGAD: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SGR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  AB: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export const ComiteGestionModal: React.FC<ComiteGestionModalProps> = ({
  isOpen,
  onClose,
  comite,
  etablissementName,
}) => {
  const { personnels, loadPersonnels } = usePersonnelStore();
  const [membresDetails, setMembresDetails] = useState<(Personnel & { role: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (isOpen && personnels.length === 0) {
      loadPersonnels();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && comite.length > 0 && personnels.length > 0) {
      setIsLoading(true);
      const details = comite
        .map((membre) => {
          const personnel = personnels.find((p) => p._id === membre.membreId._id);
          if (personnel) {
            return { ...personnel, role: membre.role };
          }
          return null;
        })
        // .filter((m): m is Personnel & { role: string } => m !== null);
      
      setMembresDetails(details);
      setIsLoading(false);
    }
  }, [isOpen, comite, personnels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comité de Gestion
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {etablissementName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : membresDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <User className="mb-4 h-16 w-16 opacity-50" />
              <p className="text-center">Aucun membre du comité de gestion trouvé</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {membresDetails.map((membre, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/50"
                >
                  {/* Badge de rôle */}
                  <div className="">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        roleColors[membre.role]
                      }`}
                    >
                      {roleLabels[membre.role]}
                    </span>
                  </div>

                  {/* Photo et nom */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                      {membre.photo ? (
                        <img
                          src={membre.photo}
                          alt={membre.nomComplet}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                          {membre.nom?.charAt(0)}
                          {membre.prenom?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {membre.nomComplet}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {membre.matricule}
                      </p>
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="mt-6 space-y-3">
                    {/* Email */}
                    {membre.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                          {membre.email}
                        </span>
                      </div>
                    )}

                    {/* Téléphone */}
                    {membre.telephone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {membre.telephone}
                        </span>
                      </div>
                    )}

                    {/* Catégorie */}
                    {membre.categorie && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {membre.categorie}
                        </span>
                      </div>
                    )}

                    {/* Grade */}
                    {membre.grade && (
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {membre.grade}
                        </span>
                      </div>
                    )}

                    {/* Province */}
                    {membre.province && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {typeof membre.province === 'string'
                            ? membre.province
                            : membre.province.designation}
                        </span>
                      </div>
                    )}

                    {/* Sexe */}
                    {membre.sexe && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {membre.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        </span>
                      </div>
                    )}

                    {/* Âge */}
                    {membre.age && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {membre.age} ans
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
