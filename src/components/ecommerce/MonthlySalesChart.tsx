"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useProvinceStore } from "@/stores/provinceStore";
import { Loader } from "lucide-react";
import { usePersonnelStore } from "@/stores/personnelStore";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const { provinces, loading, fetchProvinces } = useProvinceStore();
  const { personnels, loadPersonnels } = usePersonnelStore();

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
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const [config, setConfig] = useState(options);
  const [data, setData] = useState({
    data: [],
    name: "Personnel"
  });

  const series = [
    {
      name: data.name,
      data: data.data,
    },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [graphique, setGraphique] = useState("Personnel Académique et Scientifique");

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSelect = (value: string, categories: string[]) => {
    console.log('Selected value:', value);
    setGraphique(value);
    const seriesData = [];

    provinces.map((province) => {
      console.log("Province : ", province);
      console.log("Data personnels :", personnels);

      const allPersonnels =personnels.filter((p: any) => p.province._id === province._id);
      console.log("All personnels : ", allPersonnels);
      let totalProvince = 0;

      categories.map(function(categorie){
        console.log("Categorie : ", categorie);
        allPersonnels.forEach(p => {
          console.log("Personnel : ", p);
          totalProvince += p.categorie.toLowerCase() === categorie.toLowerCase() ? 1 : 0;
        });
      })
      console.log("Total province : ", totalProvince);
      seriesData.push(personnels.length > 0 ? Math.round(totalProvince * 100 / personnels.length) : 0);
    });
    console.log("Series data : ", seriesData);
    setData({
      data: seriesData,
      name: "Personnel"
    });
    setIsOpen(false);
  };

  useEffect(() => {
    fetchProvinces();
    loadPersonnels();
  }, []);

  useEffect(() => {
    console.log("Provinces : ", provinces);
    if (provinces.length > 0) {
      const categories = provinces.map((province) => province.code);
      console.log("Categories : ", categories);
      setConfig({
        ...options,
        xaxis: {
          categories,
        },
      });
      handleSelect("Personnel Académique et Scientifique", ["academique", "scientifique"]);
    }
  }, [provinces]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {graphique}
        </h3>

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
            [
              {
                label: "PAS",
                value: "Personnel Académique et Scientifique",
                onClick: () => handleSelect("Personnel Académique et Scientifique", ["academique", "scientifique"])
              },
              {
                label: "PATO",
                value: "Personnel Administratif, Technique et Ouvrier",
                onClick: () => handleSelect("Personnel Administratif, Technique et Ouvrier", ["administratif", "technique", "ouvrier"])
              }
            ].map((item, index) => (
              <DropdownItem
                key={index}
                onItemClick={item.onClick}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                {item.label}
              </DropdownItem>
            ))
          }
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={config}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
