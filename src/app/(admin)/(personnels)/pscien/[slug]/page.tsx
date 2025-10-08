"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useProvinceStore } from '@/stores/provinceStore';
import UsersCardManager from '@/components/personnel/UsersCardManager';

const PersonnelScientifiqueProvincePage: React.FC = () => {
  const params = useParams();
  const provinceId = params?.slug as string;
  const { provinces } = useProvinceStore();

  // Trouver les informations de la province
  const province = provinces.find(p => p._id === provinceId);

  if (!provinceId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Paramètre manquant
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            L'identifiant de la province est requis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UsersCardManager
        categorie="SCIENTIFIQUE"
        provinceId={provinceId}
        provinceName={province?.designation}
      />
    </div>
  );
};

export default PersonnelScientifiqueProvincePage;
