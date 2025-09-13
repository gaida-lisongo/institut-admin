import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Institut Admin - Gestion des sites',
  description: 'Plateforme d\'administration complète pour la gestion des sections, étudiants, offres, agendas, galeries et équipes de l\'institut. Interface moderne et intuitive pour une gestion efficace de tous les aspects administratifs.',
  keywords: 'institut, administration, gestion, étudiants, sections, offres, agenda, galerie, équipe',
  authors: [{ name: 'Institut Admin Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/images/logo/inbtp.png',
    shortcut: '/images/logo/inbtp.png',
    apple: '/images/logo/inbtp.png',
  },
  openGraph: {
    title: 'Institut Admin - Système de Gestion',
    description: 'Plateforme d\'administration complète pour la gestion des sections, étudiants, offres, agendas, galeries et équipes de l\'institut.',
    type: 'website',
    images: [
      {
        url: '/images/logo/inbtp.png',
        width: 1200,
        height: 630,
        alt: 'Institut Admin Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Institut Admin - Système de Gestion',
    description: 'Plateforme d\'administration complète pour la gestion des sections, étudiants, offres, agendas, galeries et équipes de l\'institut.',
    images: ['/images/logo/inbtp.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${outfit.className} dark:bg-gray-900`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
