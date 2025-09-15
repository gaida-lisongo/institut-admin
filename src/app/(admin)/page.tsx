import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
// import DataTable from "@/components/ecommerce/DataTable";
// import SectionDataTable from "@/components/ecommerce/SectionDataTable";
// import TransactionManager from "@/components/ecommerce/RecentOrders";
// import CommandeStatistics from "@/components/ecommerce/CommandeStatistics";
// import CategoryOrders from "@/components/ecommerce/CategoryOrders";

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6">
        <EcommerceMetrics />
      </div>

      <div className="col-span-12">

        <MonthlySalesChart />
        {/* <CommandeStatistics /> */}
      </div>

      <div className="col-span-12">
        {/* <SectionDataTable /> */}
        
      </div>
    </div>
  );
}
