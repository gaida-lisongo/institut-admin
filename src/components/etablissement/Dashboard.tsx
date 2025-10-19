"use client";
import React, { useEffect, useState } from "react";
import ProduitMetrics from "@/components/ecommerce/ProduitMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import EtudiantsList from "@/components/etudiants/EtudiantsList";
import { ParcoursModal } from "@/components/etudiants/ParcoursModal";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { EcommerceMetricsEnhanced } from "@/components/ecommerce/EcommerceMetricsEnhanced";
import EtablissementNavBar from "@/components/etablissement/EtablissementNavBar";
import { Etablissement, EtablissementPopulated } from "@/types/etablissement";
import { Frais, FraisDetailResponse } from "@/types/frais";
import { Annee } from "@/types/annee";
import { Classe } from "@/types/systemes";
import { Payment } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { Parcour } from "@/types/etudiant";

export interface ProduitDetail {
    _id: string;
    fraisId: Frais;
    anneeId: Annee;
    classeId: Classe;
    etabId: Etablissement;
    payments: Payment[];
    totalPayments: number;
    montant: number;
    tranche: string;
}

export default function Dashboard() {
  const [etablissement, setEtablissement] = useState<EtablissementPopulated | null>(null);
  const [agents, setAgents] = useState<{
    enseignants: number;
    administratifs: number
  }>({
    enseignants: 0,
    administratifs: 0
  });
  const [frais, setFrais] = useState<ProduitDetail[]>([]);
  const [isParcoursModalOpen, setIsParcoursModalOpen] = useState(false);
  const [selectedParcours, setSelectedParcours] = useState<Parcour[]>([]);
  const [selectedEtudiantName, setSelectedEtudiantName] = useState("");


  useEffect(() => {
    if (etablissement) {
        const enseignants = etablissement.facultes?.map(f => f.enseignants.length).reduce((a, b) => a + b, 0) || 0;
        const administratifs = etablissement.administratifs?.length || 0;
        setAgents({ enseignants, administratifs });
    }
  }, [etablissement]);

  const handleParcoursView = (parcours: Parcour[], etudiantName: string) => {
    setSelectedParcours(parcours);
    setSelectedEtudiantName(etudiantName);
    setIsParcoursModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre de navigation des établissements */}
      <EtablissementNavBar 
        etablissement={etablissement} 
        setEtablissement={setEtablissement}
      />
      
      {/* Contenu principal du dashboard */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 mt-4">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetricsEnhanced agents={agents}/>
            <MonthlySalesChart 
                etablissement={etablissement?._id || ""} 
                onCurrent={setFrais}
            />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <ProduitMetrics produitsFrais={frais}/>
          </div>

          {/* <div className="col-span-12">
            <StatisticsChart />
          </div> */}

          {/* <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
          </div> */}

          <div className="col-span-12">
            {etablissement && (
              <EtudiantsList 
                etablissement={etablissement} 
                onParcoursView={handleParcoursView}
              />
            )}
          </div>
        </div>

        {/* Modal des parcours */}
        <ParcoursModal
          isOpen={isParcoursModalOpen}
          onClose={() => setIsParcoursModalOpen(false)}
          parcours={selectedParcours}
          etudiantName={selectedEtudiantName}
        />
    </div>
  );
}
