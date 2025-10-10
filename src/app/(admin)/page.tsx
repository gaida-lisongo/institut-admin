import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title: "Tableau de Bord - Administration Institut | Système de Gestion Académique",
  description: "Tableau de bord principal pour la gestion administrative de l'institut. Suivi des personnels, étudiants, inscriptions et statistiques académiques en temps réel.",
  keywords: [
    "administration institut",
    "gestion académique", 
    "tableau de bord",
    "personnels",
    "étudiants",
    "inscriptions",
    "statistiques",
    "DRH",
    "gestion établissement"
  ],
  authors: [{ name: "Institut Admin Team" }],
  creator: "Institut Administration System",
  publisher: "Institut Supérieur",
  robots: {
    index: false, // Pas d'indexation pour les pages admin
    follow: false,
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" }
  ],
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      {/* <div className="col-span-12">
        <StatisticsChart />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div> */}

      <div className="col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
