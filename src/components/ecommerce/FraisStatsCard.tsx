"use client";
import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, FileText, PieChart } from "lucide-react";
import { useFraisStore } from "@/stores/fraisStore";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  bgColor,
  iconBgColor,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Gradient Background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${bgColor}`} />
      
      <div className="relative flex items-center gap-4">
        {/* Icon Container */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgColor} transition-transform duration-300 group-hover:scale-110`}>
          <div className={color}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </h4>
        </div>
      </div>
    </div>
  );
};

export const FraisStatsCard = () => {
  const { frais, loadFrais, isLoading } = useFraisStore();
  const [stats, setStats] = useState({
    total: 0,
    montantTotal: 0,
    parCategorie: {} as Record<string, number>,
  });

  useEffect(() => {
    if (frais.length === 0) {
      loadFrais(1, 1000); // Charger tous les frais
    }
  }, []);

  useEffect(() => {
    if (frais.length > 0) {
      const parCategorie: Record<string, number> = {};
      let montantTotal = 0;

      frais.forEach((f) => {
        parCategorie[f.categorie] = (parCategorie[f.categorie] || 0) + 1;
        montantTotal += f.montant;
      });

      setStats({
        total: frais.length,
        montantTotal,
        parCategorie,
      });
    }
  }, [frais]);

  const categorieLabels: Record<string, string> = {
    inscription: "Inscription",
    academique: "Académique",
    diplome: "Diplômes",
    connexe: "Connexe",
  };

  const categorieColors: Record<string, { color: string; bgColor: string; iconBgColor: string }> = {
    inscription: {
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    academique: {
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      iconBgColor: "bg-green-50 dark:bg-green-950/30",
    },
    diplome: {
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    connexe: {
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-gray-200 bg-gray-100 animate-pulse dark:border-gray-800 dark:bg-gray-800/50" />
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: "Total Frais",
      value: stats.total,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      iconBgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Montant Total",
      value: `${stats.montantTotal.toLocaleString('fr-FR')} FC`,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconBgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    ...Object.entries(stats.parCategorie).slice(0, 2).map(([categorie, count]) => ({
      icon: <PieChart className="w-6 h-6" />,
      label: categorieLabels[categorie] || categorie,
      value: `${count} frais`,
      ...categorieColors[categorie],
    })),
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
