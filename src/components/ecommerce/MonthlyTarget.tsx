"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEtablissementStore } from "@/stores/etablissementStore";
import { useFraisStore } from "@/stores/fraisStore";
import { useProvinceStore } from "@/stores/provinceStore";
import { Award, Building2, Loader } from "lucide-react";
import { Etablissement } from "@/types/etablissement";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ProvinceFilter {
  id: string;
  code: string;
  designation: string;
}

interface FraisMetrique {
  type: 'public' | 'prive';
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function MonthlyTarget() {
  const { etablissements, fetchEtablissements, isLoading: isLoadingEtablissements } = useEtablissementStore();
  const { loadFrais, frais, isLoading: isLoadingFrais } = useFraisStore();
  const { provinces, fetchProvinces, loading: isLoadingProvinces } = useProvinceStore();
  
  const [selectedProvince, setSelectedProvince] = useState<ProvinceFilter | null>(null);
  const [etablissementsCount, setEtablissementsCount] = useState(0);
  const [pourcentage, setPourcentage] = useState(0);
  const [fraisMetriques, setFraisMetriques] = useState<FraisMetrique[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    fetchEtablissements();
    loadFrais(1, 1000);
    fetchProvinces();
  }, []);

  // Initialiser la première province
  useEffect(() => {
    if (provinces.length > 0 && !selectedProvince) {
      setSelectedProvince({
        id: provinces[0]._id!,
        code: provinces[0].code,
        designation: provinces[0].designation,
      });
    }
  }, [provinces]);

  // Calculer les établissements de la province sélectionnée
  useEffect(() => {
    if (selectedProvince && etablissements.length > 0) {
      console.log("Current province : ", selectedProvince);
      console.log("Etablissements : ", etablissements);
      const etabsProvince = etablissements.filter(
        (etab: any) => etab.provinceId && typeof etab.provinceId === 'object' 
          ? etab.provinceId._id === selectedProvince.id 
          : etab.provinceId === selectedProvince.id
      );
      
      const count = etabsProvince.length;
      const percentage = etablissements.length > 0 
        ? Number(((count * 100) / etablissements.length).toFixed(2))
        : 0;

      setEtablissementsCount(count);
      setPourcentage(percentage);
    }
  }, [selectedProvince, etablissements]);

  // Calculer les métriques de frais
  useEffect(() => {
    if (frais.length > 0) {
      let montantPublic = 0;
      let montantPrive = 0;

      frais.forEach((f) => {
        if (f.etabs.includes('public')) {
          montantPublic += f.montant;
        }
        if (f.etabs.includes('prive')) {
          montantPrive += f.montant;
        }
      });

      setFraisMetriques([
        {
          type: 'public',
          label: 'Établ. Publics',
          value: montantPublic,
          icon: <Building2 className="w-5 h-5" />,
          color: 'text-green-600',
        },
        {
          type: 'prive',
          label: 'Établ. Privés',
          value: montantPrive,
          icon: <Award className="w-5 h-5" />,
          color: 'text-orange-600',
        },
      ]);
    }
  }, [frais]);
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

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleProvinceSelect = (province: ProvinceFilter) => {
    setSelectedProvince(province);
    closeDropdown();
  };

  if (isLoadingEtablissements || isLoadingFrais || isLoadingProvinces) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!selectedProvince) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {selectedProvince.code}
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              {selectedProvince.designation}
            </p>
          </div>
          <div className="relative inline-block">
            <button 
              onClick={toggleDropdown} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-56 p-2 max-h-80 overflow-y-auto"
            >
              {provinces.map((province) => (
                <DropdownItem
                  key={province._id}
                  onItemClick={() => handleProvinceSelect({
                    id: province._id!,
                    code: province.code,
                    designation: province.designation,
                  })}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{province.code}</div>
                    <div className="text-xs text-gray-400">{province.designation}</div>
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
        
        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={[pourcentage]}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {etablissementsCount} Établ.
          </span>
        </div>
        
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          Distribution des établissements dans la province {selectedProvince.designation}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 py-4 sm:gap-10 sm:py-6">
        {/* Nombre d'établissements */}
        <div className="text-center">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Établissements
          </p>
          <p className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {etablissementsCount}
            <Building2 className="w-5 h-5 text-blue-500" />
          </p>
        </div>

        <div className="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>

        {/* Métriques de frais */}
        {fraisMetriques.map((metrique, index) => (
          <React.Fragment key={metrique.type}>
            <div className="text-center">
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {metrique.label}
              </p>
              <p className={`flex items-center justify-center gap-2 text-lg font-bold ${metrique.color} dark:text-white/90`}>
                {metrique.value.toLocaleString('fr-FR')} $
                {metrique.icon}
              </p>
            </div>
            {index < fraisMetriques.length - 1 && (
              <div className="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
