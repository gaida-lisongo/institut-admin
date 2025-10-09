"use client";
import React, { useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { usePersonnelStats } from "@/stores/personnelStore";

export const EcommerceMetrics = () => {
  const { stats, loadPersonnelStats } = usePersonnelStats();
  console.log("Detail personnels : ",  stats);

  useEffect(() => {
    loadPersonnelStats();
  }, []);
  
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
              PAS
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {
                [
                  "scientifique",
                  "academique"
                ].reduce((total, categorie) => {
                  return total + stats?.parCategorie[categorie] || 0;
                }, 0)
              }
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {
              stats?.total && ([
                "scientifique",
                "academique"
              ].reduce((total, categorie) => {
                return total + stats?.parCategorie[categorie] || 0;
              }, 0)) * 100/(stats?.total)
            }
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              PATO
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {
                [
                  "administratif",
                  "ouvrier"
                ].reduce((total, categorie) => {
                  return total + stats?.parCategorie[categorie] || 0;
                }, 0)
              }
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            {
              stats?.total && ([
                "administratif",
                "ouvrier"
              ].reduce((total, categorie) => {
                return total + stats?.parCategorie[categorie] || 0;
              }, 0)) * 100/(stats?.total)
            }
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
