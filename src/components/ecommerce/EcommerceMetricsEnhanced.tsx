"use client";
import React, { useEffect, useState } from "react";
import { Building2, TrendingUp, TrendingDown, Award, BookOpen } from "lucide-react";
import { useEtablissementStore } from "@/stores/etablissementStore";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: string;
  bgColor: string;
  iconBgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  total,
  color,
  bgColor,
  iconBgColor,
}) => {
  const percentage = total > 0 ? (value * 100) / total : 0;
  const isPositive = percentage >= 50;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Gradient Background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${bgColor}`} />
      
      <div className="relative">
        {/* Icon Container */}
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${iconBgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <div className={color}>
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-orange-500" />
              )}
              <span className={`text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Value */}
          <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </h4>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Progression</span>
              <span>{value} / {total}</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${bgColor}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EcommerceMetricsEnhanced = () => {
  const { etablissements, fetchEtablissements } = useEtablissementStore();
  const [publicCount, setPublicCount] = useState(0);
  const [priveCount, setPriveCount] = useState(0);

  useEffect(() => {
    fetchEtablissements();
  }, [fetchEtablissements]);

  useEffect(() => {
    setPublicCount(etablissements.filter(e => e.categorie === "public").length);
    setPriveCount(etablissements.filter(e => e.categorie === "prive").length);
  }, [etablissements]);

  const totalEtablissements = etablissements.length;

  const metrics = [
    {
      icon: <Building2 className="w-7 h-7" />,
      label: "Établissements Publics",
      value: publicCount,
      total: totalEtablissements,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      iconBgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: <Award className="w-7 h-7" />,
      label: "Établissements Privés",
      value: priveCount,
      total: totalEtablissements,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vue d'ensemble des statistiques institutionnelles
          </p>
        </div>
      </div> */}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};
