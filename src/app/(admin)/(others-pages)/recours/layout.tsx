import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Recours | Institut Admin',
  description: 'Interface de gestion et traitement des recours étudiants pour les agents et responsables pédagogiques.',
  keywords: ['recours', 'étudiants', 'notes', 'gestion', 'traitement', 'pédagogie'],
  openGraph: {
    title: 'Gestion des Recours - Institut Admin',
    description: 'Plateforme de gestion des recours étudiants avec suivi et traitement en temps réel.',
    type: 'website',
  },
};

export default function RecoursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}