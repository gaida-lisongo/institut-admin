"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useUniteStore } from "@/stores/uniteStore";
import { useCoursStore } from "@/stores/coursStore";
import { useChargeStore } from "@/stores/chargeStore";
import { useAnneeStore } from "@/stores/anneeStore";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface UniteData {
  code: string;
  pending: number;
  ok: number;
  no: number;
}

export default function MonthlySalesChart() {
  const { unites, loading, fetchUnites } = useUniteStore();
  const { charges, loading: chargesLoading, fetchCharges } = useChargeStore();
  const { annees, isLoading: anneesLoading, fetchAnnees } = useAnneeStore();
  const [selectedAnnee, setSelectedAnnee] = useState<string | null>(null);
  const [data, setData] = useState<UniteData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Calcul des données pour le graphique
  const chartData = {
    categories: data.map(item => item.code),
    series: [
      {
        name: "Pending",
        data: data.map(item => item.pending),
        color: "#fbbf24"
      },
      {
        name: "OK",
        data: data.map(item => item.ok),
        color: "#10b981"
      },
      {
        name: "No",
        data: data.map(item => item.no),
        color: "#ef4444"
      }
    ]
  };

  const options: ApexOptions = {
    colors: chartData.series.map(s => s.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
        dataLabels: {
          position: 'top',
        }
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '12px',
        }
      }
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      markers: {
        size: 6,
      }
    },
    yaxis: {
      title: {
        text: "Nombre de charges",
        style: {
          fontSize: '14px',
          fontWeight: 600,
        }
      },
      labels: {
        formatter: (val: number) => Math.round(val).toString(),
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: '#e5e7eb',
    },
    fill: {
      opacity: 0.8,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} charge(s)`,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "70%"
            }
          }
        }
      }
    ]
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    fetchUnites();
    fetchCharges();
    fetchAnnees();
  }, [fetchUnites, fetchCharges, fetchAnnees]);

  useEffect(() => {
    if (annees.length > 0 && !selectedAnnee) {
      setSelectedAnnee(annees[0]._id || '');
    }
  }, [annees, selectedAnnee]);

  useEffect(() => {
    if (selectedAnnee && unites.length > 0 && charges.length > 0) {
      handleAnneeSelect(selectedAnnee);
    }
  }, [selectedAnnee, unites, charges]);

  const fetchChargeStatus = (coursId: string, anneeId: string) => {
    const chargeItem = charges.find((c) => 
      c.coursId._id === coursId && c.anneeId._id === anneeId
    );
    return chargeItem ? chargeItem.status : 'pending'; // Default à pending si pas trouvé
  };

  const handleAnneeSelect = (anneeId: string) => {
    console.log("Processing data for anneeId:", anneeId);

    const unitesData: UniteData[] = unites.map((unite) => {
      // Compter les statuts pour tous les cours de cette unité
      const statusCounts = {
        pending: 0,
        ok: 0,
        no: 0
      };

      unite.cours.forEach((coursId) => {
        const status = fetchChargeStatus(coursId, anneeId);
        statusCounts[status as keyof typeof statusCounts]++;
      });

      return {
        code: unite.descripteur?.code || 'N/A',
        pending: statusCounts.pending,
        ok: statusCounts.ok,
        no: statusCounts.no,
      };
    });

    // Filtrer les unités qui ont au moins un cours
    const filteredData = unitesData.filter(item => 
      item.pending > 0 || item.ok > 0 || item.no > 0
    );

    console.log("Chart data:", filteredData);
    setData(filteredData);
  };

  const selectedAnneeDetails = annees.find(a => a._id === selectedAnnee);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            État des Charges par Unité
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Année académique: {selectedAnneeDetails ? 
              `${selectedAnneeDetails.debut} - ${selectedAnneeDetails.fin}` : 
              'Non sélectionnée'
            }
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="dropdown-toggle p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={anneesLoading}
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            {annees.map((annee) => (
              <DropdownItem
                key={annee._id}
                onItemClick={() => {                  
                  setSelectedAnnee(annee._id || null);
                  closeDropdown();
                }}
                className={`flex w-full font-normal text-left rounded-lg px-3 py-2 transition-colors ${
                  selectedAnnee === annee._id 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
                }`}
              >
                {annee.debut} - {annee.fin}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {data.reduce((sum, item) => sum + item.pending, 0)}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-green-600 dark:text-green-400 text-sm font-medium">OK</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {data.reduce((sum, item) => sum + item.ok, 0)}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="text-red-600 dark:text-red-400 text-sm font-medium">No</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {data.reduce((sum, item) => sum + item.no, 0)}
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {(loading || chargesLoading || anneesLoading) && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des données...</span>
        </div>
      )}

      {/* Graphique */}
      {!loading && !chargesLoading && !anneesLoading && data.length > 0 && (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={chartData.series}
              type="bar"
              height={350}
            />
          </div>
        </div>
      )}

      {/* Message si pas de données */}
      {!loading && !chargesLoading && !anneesLoading && data.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Aucune donnée disponible pour cette année académique</p>
          </div>
        </div>
      )}
    </div>
  );
}
