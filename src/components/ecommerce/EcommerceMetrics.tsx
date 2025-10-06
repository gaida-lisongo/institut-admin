"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useGroupeStore, GroupeDetail } from "@/stores/groupeStore";

interface Cours {
  _id: string;
  designation: string;
  [key: string]: any;
}

export const EcommerceMetrics = () => {
  const { groupesData, fetchGroupesData, isLoading } = useGroupeStore();
  const [groupes, setGroupes] = useState<GroupeDetail[]>([]);
  const [cours, setCours] = useState<Cours[]>([]);
  useEffect(() => {
    fetchGroupesData();
  }, []);

  useEffect(() => {
    
    if (!groupesData.groupes && !Array.isArray(groupesData.groupes)) return;
    if (!groupesData.cours && !Array.isArray(groupesData.cours)) return;

    const {
      groupes: dataGroupes,
      cours: dataCours,
    } = groupesData;
    console.log("Detail of groupes :", dataGroupes);
    console.log("Detail of cours :", dataCours);
    setGroupes(dataGroupes);
    setCours(dataCours);
  }, [groupesData]);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Groupes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {groupes.length}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {
              groupes.length ? Math.round(
                groupes.reduce(
                  (total, groupe) => total + groupe.etudiantIds.length,
                  0
                ) / groupes.length
              ) : 0
            } étudiants/groupe
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Cours
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {
                cours.length ? cours.length : 0
              }
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {cours.reduce((total, cours) => total + cours.credit, 0)} crédits
          </Badge>
        </div>
      </div>
      {/* <!--Metric Item End --> */}
    </div>
  );
};
