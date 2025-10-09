"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useEffect, useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { usePersonnelStore } from "@/stores/personnelStore";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const filters : {
  type: string;
  value: string;
  description: string;
}[] = [
  {
    type: "DG",
    value: "Directeur Général",
    description: "Gestionnaire d'un établissement d'enseignement supérieur supérieur"
  },
  {
    type: "SGACAD",
    value: "Secrétaire Général Académique",
    description: "Gestionnaire académique d'un établissement d'enseignement supérieur supérieur",
  },
  {
    type: "SGAD",
    value: "Secrétaire Général Administratif",
    description: "Gestionnaire administratif d'un établissement d'enseignement supérieur supérieur",
  },
  {
    type: "SGR",
    value: "Secrétaire Général à la Recherche",
    description: "Gestionnaire à la recherche d'un établissement d'enseignement supérieur supérieur",
  },
  {
    type: "AB",
    value: "Administrateur du Budget",
    description: "Administrateur du budget d'un établissement d'enseignement supérieur supérieur",
  },
  {
    type: "DRH",
    value: "Personnels",
    description: "Gestion des Personnels des établissements d'enseignement supérieur supérieur",
  },
  {
    type: "ADMIN",
    value: "Gestion Etablissement",
    description: "Gestionnaire des établissements d'enseignement supérieur supérieur",
  },
  {
    type: "FIN",
    value: "Gestion Finance",
    description: "Gestionnaire des finances des établissements d'enseignement supérieur supérieur",
  },
];

export default function MonthlyTarget() {
  const [filter, setFilter] = useState<{
    type: string;
    value: string;
    description: string;
  }>(filters[0]);

  const [data, setData] = useState<number>(0);
  const { personnels, loadPersonnels, isLoading } = usePersonnelStore();
  const [series, setSeries] = useState<number[]>([]);
  // const series = [75.55];
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
          margin: 5, // margin is in pixels
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

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    loadPersonnels();
  }, []);

  useEffect(() => {
    const filteredPersonnels = personnels.filter(
      (personnel) => personnel.autorisations?.some((a) => a.type === filter.type)
    );

    setData(filteredPersonnels.length);
  }, [personnels, filter]);

  useEffect(() => {
    setSeries([personnels.length > 0 ? Number((data * 100 / personnels.length).toFixed(2)) : 0]);
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {filter.type}
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              {filter.value}
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
            {
              filters.map((filter) => (
                <DropdownItem
                  key={filter.type}
                  tag="a"
                  onItemClick={() => {
                    setFilter(filter);
                    closeDropdown();
                  }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {filter.value}
                </DropdownItem>
              ))
            }
              {/* <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem> */}
            </Dropdown>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Total {data}
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {filter.description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Masculin
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {personnels.filter((personnel) => personnel.sexe === "M").length}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Symbole masculin (Mars) */}
              <circle cx="6" cy="10" r="3.5" stroke="#2563eb" strokeWidth="1.5" fill="none"/>
              <path d="M9 7L12.5 3.5M12.5 3.5H10M12.5 3.5V6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Féminin 
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {personnels.filter((personnel) => personnel.sexe === "F").length}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Symbole féminin (Vénus) */}
              <circle cx="8" cy="6" r="3.5" stroke="#ec4899" strokeWidth="1.5" fill="none"/>
              <path d="M8 9.5V13M6 11H10" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Cinquantenaire
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {personnels.filter((personnel) => personnel.age >= 50).length}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Icône d'âge/calendrier */}
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
              <path d="M5 1V4M11 1V4M2 7H14" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <text x="8" y="11" fontSize="6" textAnchor="middle" fill="#f59e0b" fontWeight="bold">50</text>
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
}
