"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, DocsIcon, UserIcon } from "@/icons";
import useAuthStore from "@/stores/authStore";

export const EcommerceMetrics = () => {
  const { menuData } = useAuthStore();
  const [inscriptions, setInscriptions] = useState<{
    annee: number;
    items: number;
  }>();
  const [cours, setCours] = useState<{
    annee: number;
    items: number;
  }>({
    annee: new Date().getFullYear(),
    items: 0
  });

  useEffect(() => {
    if (menuData) {
      console.log(menuData);
    }

    const { charges } = menuData?.courses;
    
    let currentAnnee = {
      annee: new Date().getFullYear(),
      items: 0
    };

    let currentCharges = {
      annee: new Date().getFullYear(),
      items: 0
    };

    charges && charges.forEach(charge => {
      const { fiches } = charge;
      if(charge.annee.debut <= currentAnnee.annee && charge.annee.fin >= currentAnnee.annee) {
        currentAnnee.items += fiches.length;
      }

      if(charge.annee.debut <= cours.annee && charge.annee.fin >= cours.annee) {
        currentCharges.items += 1;
      }
    });
    
    setInscriptions(currentAnnee);
    setCours(currentCharges);
  }, [menuData]);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <UserIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Inscriptions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {inscriptions?.items}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {inscriptions?.annee}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DocsIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cours
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {cours?.items}
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            {cours?.annee}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
