"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Loader } from "lucide-react";
import { ProduitDetail } from "../etablissement/Dashboard";
import { Payment } from "@/app/(admin)/(coge)/paiements/[slug]/page";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ProduitMetricsProps {
  produitsFrais: ProduitDetail[];
}

export default function ProduitMetrics({ produitsFrais }: ProduitMetricsProps) {
  const [selectedProduit, setSelectedProduit] = useState<ProduitDetail | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [metriques, setMetriques] = useState({
    pourcentage: 0,
    totalMontant: 0,
    nombrePaiements: 0,
    totalPaiements: 0
  });

  // Initialiser le premier produit
  useEffect(() => {
    if (produitsFrais.length > 0 && !selectedProduit) {
      setSelectedProduit(produitsFrais[0]);
    }
  }, [produitsFrais, selectedProduit]);

  // Recalculer les métriques quand le produit change
  useEffect(() => {
    if (selectedProduit) {
      console.log("Recalcul pour produit:", selectedProduit._id);
      
      const paiementsOK = selectedProduit.payments?.filter((p: Payment) => p.status === 'OK') || [];
      const totalPaiements = selectedProduit.payments?.length || 0;
      const montantTotal = paiementsOK.length * selectedProduit.montant;
      const pourcentageCalcule = totalPaiements > 0 
        ? Math.round((paiementsOK.length * 100) / totalPaiements)
        : 0;

      const nouvellesMetriques = {
        pourcentage: pourcentageCalcule,
        totalMontant: montantTotal,
        nombrePaiements: paiementsOK.length,
        totalPaiements
      };

      console.log("Nouvelles métriques:", nouvellesMetriques);
      setMetriques(nouvellesMetriques);
    } else {
      setMetriques({
        pourcentage: 0,
        totalMontant: 0,
        nombrePaiements: 0,
        totalPaiements: 0
      });
    }
  }, [selectedProduit]);

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const handleProduitSelect = (produit: ProduitDetail) => {
    console.log("Sélection du produit:", produit._id);
    setSelectedProduit(produit);
    setIsOpen(false);
  };

  if (!selectedProduit) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {selectedProduit.fraisId.designation}
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              {selectedProduit.tranche}
            </p>
          </div>
          <div className="relative inline-block">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              className="w-56 p-2 max-h-80 overflow-y-auto"
            >
              {produitsFrais.map((p) => (
                <DropdownItem
                  key={p._id}
                  onItemClick={() => handleProduitSelect(p)}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{p.fraisId.designation}</div>
                    <div className="text-xs text-gray-400">{p?.tranche}</div>
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
        
        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              key={`chart-${selectedProduit._id}-${metriques.pourcentage}`}
              options={options}
              series={[metriques.pourcentage]}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {metriques.nombrePaiements} Transaction
          </span>
        </div>
        
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {selectedProduit?.fraisId.description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 py-4 sm:gap-10 sm:py-6">
        {/* Montant du produit */}
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Montant Unitaire (CDF)
          </p>
          <p className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {selectedProduit.montant.toLocaleString('fr-FR')}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>
        {/* Nombre de paiements */}
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Solde Collecté (CDF)
          </p>
          <p className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {metriques.nombrePaiements * selectedProduit.montant}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>

        {/* Total des paiements */}
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Solde Cible (CDF)
          </p>
          <p className="flex items-center justify-center gap-2 text-lg font-bold text-gray-800 dark:text-white/90">
            {metriques.totalPaiements * selectedProduit.montant}
          </p>
        </div>
      </div>
    </div>
  );
}
