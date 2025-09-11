"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useTransactionStore } from "../../stores/transactionStore";
import { useCommandeStore } from "../../stores/commandeStore";


export const EcommerceMetrics = () => {
  const { stats: transactionStats } = useTransactionStore();
  const { stats: commandeStats } = useCommandeStore();

  const totalDeposits = transactionStats?.totalDeposits ?? 0;
  const totalWithdraws = transactionStats?.totalWithdraws ?? 0;
  const totalCommandes = commandeStats?.totalCommandes ?? 0;

  // Ratio solde/retrait et solde/commande
  const ratioSoldeRetrait = totalWithdraws > 0 ? (totalDeposits / totalWithdraws).toFixed(2) : "-";
  const ratioSoldeCommande = totalCommandes > 0 ? (totalDeposits / totalCommandes).toFixed(2) : "-";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {/* Dépôts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ArrowUpIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Dépôts</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{totalDeposits}</h4>
          </div>
        </div>
      </div>
      {/* Retraits */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ArrowDownIcon className="text-red-600 size-6 dark:text-red-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Retraits</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{totalWithdraws}</h4>
          </div>
        </div>
      </div>
      {/* Ratio solde/retrait */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ratio solde/retrait</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{ratioSoldeRetrait}</h4>
          </div>
        </div>
      </div>
      {/* Ratio solde/commande */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ratio solde/commande</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{ratioSoldeCommande}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
