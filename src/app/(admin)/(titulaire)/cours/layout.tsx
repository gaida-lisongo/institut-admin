import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Gestion des Cours | Institut Admin",
  description: "Gérez les cours et leurs unités d'enseignement",
};

export default function CoursLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageBreadcrumb pageTitle="Cours" />
      {children}
    </div>
  );
}
