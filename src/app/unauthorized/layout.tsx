import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accès Non Autorisé",
  description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
