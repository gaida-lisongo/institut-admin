import type { Metadata } from "next";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      <div className="col-span-12">
        {/* <StatisticsChart /> */}
        {/* <MonthlyTarget /> */}
        <RecentOrders />
      </div>
    </div>
  );
}
