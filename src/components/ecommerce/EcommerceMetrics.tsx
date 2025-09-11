"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useTransactionStore } from "../../stores/transactionStore";
import { useCommandeStore } from "../../stores/commandeStore";




export const EcommerceMetrics = () => {
  const { commandes } = useCommandeStore();
  const totalCommandes = commandes.length;
  const commandesEnAttente = commandes.filter(c => c.statu === 'PENDING').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 md:gap-6">
      {/* Total Commandes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Commandes</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{totalCommandes}</h4>
          </div>
        </div>
      </div>
      {/* Commandes En Attente */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">En attente</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{commandesEnAttente}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
