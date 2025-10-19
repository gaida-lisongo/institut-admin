"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { Loader, Search, Users, ChevronLeft, ChevronRight, Building2, Calendar, GraduationCap } from "lucide-react";
import { EtablissementPopulated } from "@/types/etablissement";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Classe } from "@/types/systemes";
import { useSystemeStore } from "@/stores/systemeStore";
import { Etudiant, Parcour } from "@/types/etudiant";
import { useAnneeStore } from "@/stores/anneeStore";
import { Annee } from "@/types/annee";
import { fetchEtudiants } from "../paiements/PaiementsListModern";

interface EtudiantsListProps {
  etablissement: EtablissementPopulated;
  onParcoursView?: (parcours: Parcour[], etudiantName: string) => void;
}

export default function EtudiantsList({ etablissement, onParcoursView }: EtudiantsListProps) {
  const { systemes, fetchSystemes, loading } = useSystemeStore();
  const { annees, fetchAnnees } = useAnneeStore();
  
  // États pour la recherche et pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // États pour les dropdowns
  const [isAnneeDropdownOpen, setIsAnneeDropdownOpen] = useState(false);
  const [isClasseDropdownOpen, setIsClasseDropdownOpen] = useState(false);
  
  // États pour les données
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  const [totalEtudiants, setTotalEtudiants] = useState(0);
  const [serverSearchTerm, setServerSearchTerm] = useState("");

  // Chargement initial des données
  useEffect(() => {
    fetchAnnees();
    fetchSystemes();
  }, []);

  // Extraction des classes depuis les systèmes
  useEffect(() => {
    if (systemes && systemes.length > 0) {
      const allClasses: Classe[] = [];
      systemes.forEach((systeme) => {
        if (systeme.cycles) {
          systeme.cycles.forEach((cycle) => {
            if (cycle.classes) {
              cycle.classes.forEach((classe) => {
                allClasses.push(classe);
              });
            }
          });
        }
      });
      setClasses(allClasses);
    }
  }, [systemes]);

  // Sélection automatique de la première année et classe
  useEffect(() => {
    if (annees.length > 0 && !selectedAnnee) {
      setSelectedAnnee(annees[0]);
    }
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [annees, classes, selectedAnnee, selectedClass]);

  // Fonction pour fetch les étudiants avec pagination côté serveur
  const fetchEtudiantsWithPagination = async (page: number = 1, search: string = "") => {
    if (!selectedClass || !selectedAnnee) return;
    
    setLoadingEtudiants(true);
    try {
      // Utiliser la fonction fetchEtudiants existante avec tous les paramètres
      const response = await fetchEtudiants(
        selectedClass._id, 
        selectedAnnee._id, 
        page, 
        itemsPerPage, 
        search
      );
      
      if (response) {
        console.log("Liste des étudiants (page ", page, ")", response);
        
        // Gérer différents formats de réponse
        if (Array.isArray(response)) {
          // Si c'est un tableau simple (ancien format)
          setEtudiants(response);
          setTotalEtudiants(response.length);
        } else if (response.etudiants && response.total !== undefined) {
          // Si c'est un objet avec pagination
          setEtudiants(response.etudiants);
          setTotalEtudiants(response.total);
        } else {
          // Fallback
          setEtudiants(response.data || response || []);
          setTotalEtudiants(response.total || (response.data ? response.data.length : 0));
        }
      } else {
        setEtudiants([]);
        setTotalEtudiants(0);
      }
    } catch (error) {
      console.error('Erreur lors du fetch des étudiants:', error);
      setEtudiants([]);
      setTotalEtudiants(0);
    } finally {
      setLoadingEtudiants(false);
    }
  };

  // Fetch des étudiants quand la classe, l'année ou la page change
  useEffect(() => {
    if (selectedClass && selectedAnnee) {
      fetchEtudiantsWithPagination(currentPage, serverSearchTerm);
    }
  }, [selectedClass, selectedAnnee, currentPage, serverSearchTerm]);

  // Pagination côté serveur
  const totalPages = Math.ceil(totalEtudiants / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEtudiants);
  const currentEtudiants = etudiants; // Les étudiants sont déjà paginés côté serveur

  // Debounce pour la recherche côté serveur
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setServerSearchTerm(searchTerm);
      setCurrentPage(1); // Réinitialiser à la page 1 lors d'une nouvelle recherche
    }, 500); // Délai de 500ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handlers
  const handleParcoursView = (parcours: Parcour[], etudiantName: string) => {
    console.log("Parcours", parcours);
    if (onParcoursView) {
      onParcoursView(parcours, etudiantName);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAnneeSelect = (annee: Annee) => {
    setSelectedAnnee(annee);
    setIsAnneeDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleClasseSelect = (classe: Classe) => {
    setSelectedClass(classe);
    setIsClasseDropdownOpen(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec informations de l'établissement */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {etablissement?.designation}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {etablissement?.sigle} • {etablissement?.reference}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de navigation avec sélecteurs */}
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Sélecteur d'année académique */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsAnneeDropdownOpen(!isAnneeDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Calendar className="w-4 h-4" />
                {selectedAnnee ? `${selectedAnnee.debut} - ${selectedAnnee.fin}` : "Sélectionner une année"}
                <MoreDotIcon className="w-4 h-4" />
              </button>
              <Dropdown
                isOpen={isAnneeDropdownOpen}
                onClose={() => setIsAnneeDropdownOpen(false)}
                className="w-56 p-2"
              >
                {annees.map((annee) => (
                  <DropdownItem
                    key={annee._id}
                    onItemClick={() => handleAnneeSelect(annee)}
                    className={`flex w-full font-normal text-left rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300 ${
                      selectedAnnee?._id === annee._id 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{annee.debut} - {annee.fin}</div>
                      <div className="text-xs opacity-75">{annee.description}</div>
                    </div>
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Sélecteur de classe */}
            <div className="relative">
              <button
                onClick={() => setIsClasseDropdownOpen(!isClasseDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <GraduationCap className="w-4 h-4" />
                {selectedClass ? `${selectedClass.niveau} (${selectedClass.credit} crédits)` : "Sélectionner une classe"}
                <MoreDotIcon className="w-4 h-4" />
              </button>
              <Dropdown
                isOpen={isClasseDropdownOpen}
                onClose={() => setIsClasseDropdownOpen(false)}
                className="w-64 p-2"
              >
                {classes.map((classe, index) => (
                  <DropdownItem
                    key={index}
                    onItemClick={() => handleClasseSelect(classe)}
                    className={`flex w-full font-normal text-left rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300 ${
                      selectedClass?._id === classe._id 
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{classe.niveau}</div>
                      <div className="text-xs opacity-75">{classe.credit} crédits</div>
                    </div>
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{totalEtudiants} étudiant{totalEtudiants > 1 ? 's' : ''} au total</span>
            {selectedClass && (
              <Badge color="info">
                {selectedClass.niveau}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Table des étudiants */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Liste des Étudiants
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} sur {totalPages} • {itemsPerPage} étudiants par page • {totalEtudiants} au total
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, origine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loadingEtudiants ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-500">Chargement des étudiants...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="min-w-[280px]">Étudiant</TableCell>
                  <TableCell className="min-w-[150px]">Origine</TableCell>
                  <TableCell className="min-w-[120px]">Sexe</TableCell>
                  <TableCell className="min-w-[100px]">Âge</TableCell>
                  <TableCell className="min-w-[150px] text-center">Parcours</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEtudiants.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-12 text-gray-500 dark:text-gray-400">
                      {searchTerm ? "Aucun étudiant trouvé pour cette recherche" : "Aucun étudiant inscrit dans cette classe"}
                    </TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                  </TableRow>
                ) : (
                  currentEtudiants.map((etudiant, idx) => (
                    <TableRow key={etudiant._id || idx}>
                      {/* Colonne 1: Étudiant */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                            {etudiant.photo ? (
                              <Image
                                src={etudiant.photo}
                                alt={etudiant.nomComplet || "Étudiant"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                                {etudiant.nomComplet?.charAt(0) || etudiant.nom?.charAt(0) || 'E'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {etudiant.nomComplet || `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {etudiant.matricule || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Colonne 2: Origine */}
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {etudiant.nationalite || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {etudiant.lieu_naissance || "N/A"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Colonne 3: Sexe */}
                      <TableCell>
                        <Badge
                          color={etudiant.sexe === "Masculin" ? "success" : "warning"}
                        >
                          {etudiant.sexe || "N/A"}
                        </Badge>
                      </TableCell>

                      {/* Colonne 4: Âge */}
                      <TableCell>
                        <Badge
                          color={etudiant.age && etudiant.age >= 18 ? "success" : "warning"}
                        >
                          {etudiant.age ? `${etudiant.age} ans` : "N/A"}
                        </Badge>
                      </TableCell>

                      {/* Colonne 5: Parcours */}
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleParcoursView(
                            etudiant?.parcours || [], 
                            etudiant.nomComplet || `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}` || "Étudiant"
                          )}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          <Users className="h-4 w-4" />
                          <span className="hidden sm:inline">Voir</span>
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                            {etudiant?.parcours?.length || 0}
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {startIndex + 1} à {endIndex} sur{" "}
              {totalEtudiants} étudiant{totalEtudiants > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
