"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useGroupeStore } from "@/stores/groupeStore";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface GroupeData {
  _id: string;
  designation: string;
  etudiantIds: any[];
  statut: string;
}

export default function MonthlySalesChart() {
  const { groupesData, isLoading } = useGroupeStore();
  const [data, setData] = useState<GroupeData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Générer les options du graphique basées sur les données des groupes
  const generateChartOptions = (): ApexOptions => {
    const categories = data.map(groupe => groupe.designation);
    
    return {
      colors: ["#465fff"],
      chart: {
        fontFamily: "Inter, sans-serif",
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#fff"],
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#64748b",
            fontSize: "12px",
          },
          rotate: -45,
          maxHeight: 120,
        },
      },
      yaxis: {
        title: {
          text: "Nombre d'étudiants",
          style: {
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "500",
          },
        },
        labels: {
          style: {
            colors: "#64748b",
            fontSize: "14px",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " étudiant" + (val > 1 ? "s" : "");
          },
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 5,
      },
      legend: {
        show: false,
      },
    };
  };

  // Générer les séries de données
  const generateSeries = () => {
    return [
      {
        name: "Étudiants",
        data: data.map(groupe => groupe.etudiantIds.length),
      },
    ];
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (groupesData && groupesData.groupes) {
      const { groupes } = groupesData;
      setData(groupes);
    }
  }, [groupesData, isLoading]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Répartition des Étudiants par Groupe
        </h3>

        {/* <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Voir Plus
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Exporter
            </DropdownItem>
          </Dropdown>
        </div> */}
      </div>

      {/* Affichage conditionnel du graphique */}
      {data.length > 0 ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={generateChartOptions()}
              series={generateSeries()}
              type="bar"
              height={350}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {isLoading ? 'Chargement des données...' : 'Aucune donnée de groupe disponible'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
