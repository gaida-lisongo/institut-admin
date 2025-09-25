import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Délibération - Jurys | INBTP",
  description: "Gestion des délibérations et jurys d'évaluation - Institut National du Bâtiment et des Travaux Publics",
  keywords: "délibération, jury, évaluation, notes, étudiants, INBTP",
};

export default function JurysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Délibération - Jurys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion des délibérations et évaluation des étudiants par les jurys
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}