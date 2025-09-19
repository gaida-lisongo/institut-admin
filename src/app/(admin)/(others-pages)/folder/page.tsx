"use client";

import React, { useEffect, useState } from "react";
import { FolderIcon, DocumentTextIcon, XMarkIcon, UserGroupIcon, GlobeAltIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEtudiantStore } from "@/stores/etudiantStore";
import { Loader } from "lucide-react";


interface DossierInscription {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  annee: string;
  statut: "Validé" | "En attente" | "Rejeté";
  dateDepot: string;
  documents?: string[]; // URLs des documents
}

const fakeDossiers: DossierInscription[] = [
  {
    id: "1",
    nom: "Ngoma",
    prenom: "Jean",
    matricule: "2023A001",
    annee: "2023-2024",
    statut: "Validé",
    dateDepot: "2024-09-01",
    documents: [
      "https://example.com/documents/attestation-ngoma.pdf",
      "https://example.com/documents/photo-ngoma.jpg"
    ]
  },
  {
    id: "2",
    nom: "Mabiala",
    prenom: "Sarah",
    matricule: "2023A002",
    annee: "2023-2024",
    statut: "En attente",
    dateDepot: "2024-09-03",
    documents: [
      "https://example.com/documents/attestation-mabiala.pdf"
    ]
  },
  {
    id: "3",
    nom: "Koumba",
    prenom: "Pierre",
    matricule: "2023A003",
    annee: "2023-2024",
    statut: "Rejeté",
    dateDepot: "2024-09-05",
    documents: []
  },
];

const renderMetrics = (title: string, value: string | number, icon: React.ReactNode) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900 dark:text-white">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default function EtudiantsListPage() {
  const { etudiants, loading, fetchEtudiants } = useEtudiantStore();
  const [selectedEtudiant, setSelectedEtudiant] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEtudiants();
  }, []);

  if (loading) {
    return <Loader className="animate-spin h-6 w-6 text-gray-600 mx-auto my-20" />;
  }

  const filtered = etudiants.sort((a: any, b: any) => a.nom.localeCompare(b.nom)).filter((e: any) =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculs des métriques
  const nationalites = Array.from(new Set(etudiants.map((e: any) => e.nationalite).filter(Boolean)));
  const nbNationalites = nationalites.length;
  const sexes = etudiants.reduce((acc: Record<string, number>, e: any) => {
    if (e.sexe) acc[e.sexe] = (acc[e.sexe] || 0) + 1;
    return acc;
  }, {});
  const ages = etudiants
    .map((e: any) => e.date_naissance ? new Date().getFullYear() - new Date(e.date_naissance).getFullYear() : null)
    .filter((a: number | null) => a !== null) as number[];
  const maxAge = ages.length ? Math.max(...ages) : null;
  const minAge = ages.length ? Math.min(...ages) : null;
  const plusAge = etudiants.find((e: any) => e.date_naissance && (new Date().getFullYear() - new Date(e.date_naissance).getFullYear()) === maxAge);
  const moinsAge = etudiants.find((e: any) => e.date_naissance && (new Date().getFullYear() - new Date(e.date_naissance).getFullYear()) === minAge);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Liste des étudiants</h2>

      {/* Statistiques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div>{renderMetrics("Nationalités", nbNationalites, <GlobeAltIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />)}</div>
        <div>{renderMetrics("Sexe masculin", sexes['M'] || 0, <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />)}</div>
        <div>{renderMetrics("Sexe féminin", sexes['F'] || 0, <UserIcon className="h-8 w-8 text-pink-600 dark:text-pink-400" />)}</div>
        <div>{renderMetrics("Plus âgé", plusAge ? `${plusAge.nom} ${plusAge.prenom}` : "-", <UserGroupIcon className="h-8 w-8 text-green-600 dark:text-green-400" />)}</div>
        <div>{renderMetrics("Moins âgé", moinsAge ? `${moinsAge.nom} ${moinsAge.prenom}` : "-", <UserGroupIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />)}</div>
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom, prénom ou matricule..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 mb-6"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">Aucun étudiant trouvé.</div>
        ) : (
          filtered.map((etudiant: any) => (
            <div key={etudiant._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <div className="flex items-center mb-4">
                {etudiant.photo ? (
                  <img
                    src={etudiant.photo}
                    alt={etudiant.nom + ' ' + etudiant.prenom}
                    className="h-14 w-14 rounded-full object-cover border-2 border-blue-200 mr-3"
                  />
                ) : (
                  <FolderIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                )}
                <div>
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">{etudiant.nom} {etudiant.prenom}</div>
                  <div className="text-sm text-gray-500">Matricule : {etudiant.matricule}</div>
                  <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                    <span>Sexe : <span className="font-semibold text-gray-700 dark:text-gray-200">{etudiant.sexe === 'M' ? 'Masculin' : etudiant.sexe === 'F' ? 'Féminin' : '-'}</span></span>
                    <span>Nationalité : <span className="font-semibold text-gray-700 dark:text-gray-200">{etudiant.nationalite || '-'}</span></span>
                    <span>Lieu de naissance : <span className="font-semibold text-gray-700 dark:text-gray-200">{etudiant.lieu_naissance || '-'}</span></span>
                    <span>Âge : <span className="font-semibold text-gray-700 dark:text-gray-200">{
                      etudiant.date_naissance ?
                        (() => {
                          const d = new Date(etudiant.date_naissance);
                          const now = new Date();
                          let age = now.getFullYear() - d.getFullYear();
                          const m = now.getMonth() - d.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
                          return age;
                        })()
                        : '-'
                    }</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 mb-2">
                <span className="text-xs text-gray-500">Documents : <span className="font-semibold">{Array.isArray(etudiant.documents) ? etudiant.documents.length : 0}</span></span>
              </div>
              <div className="flex-1" />
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() => setSelectedEtudiant(etudiant)}
              >
                Voir les documents
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de consultation des documents */}
      {selectedEtudiant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedEtudiant(null)}
              aria-label="Fermer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Documents de {selectedEtudiant.prenom} {selectedEtudiant.nom}
            </h3>
            {selectedEtudiant.documents && selectedEtudiant.documents.length > 0 ? (
              <ul className="space-y-2">
                {selectedEtudiant.documents.map((url: string, idx: number) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">Aucun document fourni.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}