import type { Metadata, Viewport } from "next";
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthSync from '@/components/auth/AuthSync';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Institut Admin",
    default: "Institut Admin - Système de Gestion Académique"
  },
  description: "Système complet de gestion administrative pour institut supérieur. Gestion des personnels, étudiants, inscriptions, notes et ressources académiques.",
  keywords: [
    "institut supérieur",
    "gestion académique",
    "administration",
    "étudiants",
    "personnels",
    "inscriptions",
    "notes",
    "relevés",
    "DRH",
    "système éducatif"
  ],
  authors: [{ name: "Institut Admin Team" }],
  creator: "Institut Administration System",
  publisher: "Institut Supérieur",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "Institut Admin",
    title: "Institut Admin - Système de Gestion Académique",
    description: "Système complet de gestion administrative pour institut supérieur",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Institut Admin - Système de Gestion Académique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Institut Admin - Système de Gestion Académique",
    description: "Système complet de gestion administrative pour institut supérieur",
    images: ["/images/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthSync />
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
