import React, { useState } from "react";

const ChartTab: React.FC<{ 
  annees: string[]; 
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}> = ({ annees, selectedYear, onYearChange }) => {
  const [selected, setSelected] = useState<string>(selectedYear || annees[0]);

  const handleYearChange = (annee: string) => {
    setSelected(annee);
    onYearChange?.(annee);
  };

  const getButtonClass = (option: string) =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {annees.map((annee) => (
        <button
          key={annee}
          onClick={() => handleYearChange(annee)}
          className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
            annee
          )}`}
        >
          {annee}
        </button>
      ))}
    </div>
  );
};

export default ChartTab;
