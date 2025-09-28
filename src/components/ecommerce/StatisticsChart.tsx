"use client";
import React, { useEffect } from "react";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import useAuthStore from "@/stores/authStore";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const { menuData } = useAuthStore();
  const [tabsSelected, setTabsSelected] = React.useState<string[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<string>("");
  const [data, setData] = React.useState<{
    annee: string;
    items: {
      variable: string;
      value: number;
    }[];
  }[]>([]);

  useEffect(() => {
    if (menuData) {
      const { charges } = menuData?.courses;

      let annees: string[] = [];
      
      charges?.forEach(charge => {
        console.log("Liste des années => ", annees);
        if (!annees.includes(`${charge.annee.debut.toString()}-${charge.annee.fin.toString()}`)) {
          annees.push(`${charge.annee.debut.toString()}-${charge.annee.fin.toString()}`);
        }
      });

      setTabsSelected(annees);
      setSelectedYear(annees[0] || ""); // Sélectionner la première année par défaut

      let chartsData: {
        annee: string;
        items: {
          variable: string;
          value: number;
        }[];
      }[] = [];

      annees.forEach((annee) => {
        let coursData: { variable: string; value: number }[] = [];
        
        charges?.forEach(charge => {
          if(charge.annee.debut <= parseInt(annee.split("-")[0]) && charge.annee.fin >= parseInt(annee.split("-")[1])) {
            coursData.push({
              variable: charge.cours.titre,
              value: charge.fiches.length,
            });
          }
        });
        
        chartsData.push({
          annee,
          items: coursData,
        });
      });
      
      setData(chartsData);
    }
  }, [menuData]);

  // Filtrer les données par année sélectionnée
  const selectedYearData = data.find(item => item.annee === selectedYear);
  const categories = selectedYearData?.items.map(item => item.variable) || [];
  const studentsData = selectedYearData?.items.map(item => item.value) || [];

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"], // Custom colors for the chart
    chart: {
      fontFamily: "Satoshi, sans-serif", // Custom font family
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2], // Stroke width for each series
      curve: "straight", // Curve type
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        format: "dd MMM yyyy", // Format for x-axis tooltip
      },
    },
    xaxis: {
      type: "category", // Category-based x-axis
      categories: categories.length > 0 ? categories : ["Aucun cours"],
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        rotate: -45, // Rotation pour les longs noms de cours
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Étudiants inscrits",
      data: studentsData.length > 0 ? studentsData : [0],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Mes étudiants
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution des étudiants par cours
          </p>
        </div>
        {tabsSelected.length > 0 && <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab 
            annees={tabsSelected} 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
