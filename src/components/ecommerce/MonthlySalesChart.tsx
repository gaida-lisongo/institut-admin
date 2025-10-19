"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Loader } from "lucide-react";
import { useFraisStore } from "@/stores/fraisStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { ProduitDetail } from "../etablissement/Dashboard";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const variables = [
  {
    label: "Frais d'inscription",
    value: "inscription"
  },
  {
    label: "Frais académique",
    value: "academique"
  },
  {
    label: "Frais des diplômes",
    value: "diplome"
  },
  {
    label: "Frais connexe",
    value: "connexe"
  }
]
// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:4000/api/v1';

interface MonthlySalesChartProps {
  etablissement: string;
  onCurrent: (data: ProduitDetail[]) => void;
}

export default function MonthlySalesChart({ etablissement, onCurrent }: MonthlySalesChartProps) {

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: '11px'
        }
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString('fr-FR')} $`,
      },
    },
  };
  const { frais, loadFrais, isLoading } = useFraisStore();
  const { annees, fetchAnnees } = useAnneeStore();
  const [ description, setDescription ] = useState("");
  const [config, setConfig] = useState(options);
  const [data, setData] = useState({
    data: [],
    name: "Frais"
  });
  const [isOpen, setIsOpen] = useState(false);
  const [graphique, setGraphique] = useState("Frais d'inscription");
  const [anneeId, setAnneeId] = useState("");


  useEffect(() => {
    fetchAnnees();
  }, []);

  useEffect(() => {
    if (annees.length > 0) {
      console.log("All années : ", annees);
      setDescription(annees[0].description);
      setGraphique(annees[0].debut + " - " + annees[0].fin);
      setAnneeId(annees[0]._id);
      // Fetch automatiquement les données de la première année
      fetchDataForYear(annees[0]._id);
    }
  }, [annees]);

  // Fonction pour fetch les données d'une année spécifique
  const fetchDataForYear = async (yearId: string) => {
    if (!yearId || !etablissement) return;
    
    try {
      const req = await fetch(`${API_BASE_URL}/finance/frais/${etablissement}/annee/${yearId}`);
      const res = await req.json();
      console.log("Frais : ", res);
      if (res.success) {
        const fraisDetail : ProduitDetail[] = res.data;
        const categories : string[] = [];
        const seriesData : number[] = [];
        onCurrent(fraisDetail);
        fraisDetail.forEach((f : any) => {
          const currentCategorie = f.fraisId.categorie;

          const index = categories.indexOf(currentCategorie);
          if (index === -1) {
            categories.push(currentCategorie);
            seriesData.push(f.montant * f.totalPayments);
          } else {
            seriesData[index] += f.montant * f.totalPayments;
          }
        });
        setData({
          data: seriesData,
          name: "Frais"
        });
        setConfig({
          ...options,
          xaxis: {
            ...options.xaxis,
            categories: categories,
            labels: {
              rotate: -45,
              rotateAlways: true,
              style: {
                fontSize: '11px'
              }
            }
          },
          tooltip: {
            ...options.tooltip,
            y: {
              formatter: (val: number) => `${val.toLocaleString('fr-FR')} $`
            }
          }
        });
      }
    } catch (error) {
      console.error("Error fetching frais:", error);
    }
  };

  useEffect(() => {
    if (anneeId) {
      console.log("Annee : ", anneeId);
      fetchDataForYear(anneeId);
    }
  }, [anneeId])

  const series = [
    {
      name: data.name,
      data: data.data,
    },
  ];
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSelect = (value: string, categrie: string) => {
    setGraphique(value);
    setDescription(annees.find((a) => a._id === categrie)?.description || "");
    setAnneeId(categrie);
    setIsOpen(false);
    // Les données seront fetchées automatiquement par le useEffect qui écoute anneeId
  };

  useEffect(() => {
    loadFrais();
  }, []);


  if (isLoading || !etablissement) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {graphique}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-48 p-2"
          >
          {
            annees && annees.map((item, index) => (
              <DropdownItem
                key={index}
                onItemClick={() => handleSelect(`${item.debut} - ${item.fin}`, item._id)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                {item.debut} - {item.fin}
              </DropdownItem>
            ))
          }
          </Dropdown>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-center">Aucun frais trouvé pour cette catégorie</p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={config}
              series={series}
              type="bar"
              height={220}
            />
          </div>
        </div>
      )}
    </div>
  );
}
