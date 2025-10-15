"use client";

import { useState } from "react";
import { 
    StudentPaymentCard, 
    StudentPaymentGrid, 
    PaiementsListModern,
    PaymentStatus 
} from "./index";

// Exemple de données mockées
const mockEtudiant = {
    _id: "1",
    nom: "Dupont",
    prenom: "Jean",
    nomComplet: "Jean Dupont",
    matricule: "ETU001",
    nationalite: "Française",
    lieu_naissance: "Paris",
    sexe: "M",
    id: "student-001"
};

const mockProduct = {
    _id: "prod1",
    tranche: "Première tranche",
    montant: 150000,
    classeId: {
        _id: "classe1",
        niveau: "L1 Informatique"
    },
    anneeId: {
        _id: "annee1",
        debut: "2023",
        fin: "2024"
    }
};

const mockPaymentStatus: PaymentStatus = {
    etudiantId: "1",
    status: "PENDING",
    amount: 150000,
    date: new Date().toISOString()
};

const ExampleUsage = () => {
    const [selectedExample, setSelectedExample] = useState<'card' | 'grid' | 'complete'>('card');

    const handleAction = async (etudiant: any, action: 'commande' | 'paiement') => {
        console.log(`Action ${action} pour l'étudiant:`, etudiant);
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`${action} effectuée pour ${etudiant.nomComplet}`);
    };

    const handleViewDetails = (etudiant: any) => {
        console.log('Voir détails:', etudiant);
        alert(`Détails de ${etudiant.nomComplet}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Exemples d'utilisation des composants de paiement
                    </h1>
                    
                    {/* Sélecteur d'exemple */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setSelectedExample('card')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedExample === 'card'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            Carte individuelle
                        </button>
                        <button
                            onClick={() => setSelectedExample('grid')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedExample === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            Grille avec filtres
                        </button>
                        <button
                            onClick={() => setSelectedExample('complete')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedExample === 'complete'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            Composant complet
                        </button>
                    </div>
                </div>

                {/* Exemples */}
                {selectedExample === 'card' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Carte individuelle - Mode Commande
                            </h2>
                            <div className="max-w-md">
                                <StudentPaymentCard
                                    etudiant={mockEtudiant}
                                    product={mockProduct}
                                    paymentStatus={mockPaymentStatus}
                                    mode="commande"
                                    onAction={handleAction}
                                    onViewDetails={handleViewDetails}
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Carte individuelle - Mode Paiement
                            </h2>
                            <div className="max-w-md">
                                <StudentPaymentCard
                                    etudiant={mockEtudiant}
                                    product={mockProduct}
                                    paymentStatus={{...mockPaymentStatus, status: 'UNPAID'}}
                                    mode="paiement"
                                    onAction={handleAction}
                                    onViewDetails={handleViewDetails}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {selectedExample === 'grid' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Grille avec fonctionnalités avancées
                        </h2>
                        <StudentPaymentGrid
                            etudiants={[
                                mockEtudiant,
                                {...mockEtudiant, _id: "2", nom: "Martin", prenom: "Marie", nomComplet: "Marie Martin", matricule: "ETU002"},
                                {...mockEtudiant, _id: "3", nom: "Bernard", prenom: "Paul", nomComplet: "Paul Bernard", matricule: "ETU003"},
                                {...mockEtudiant, _id: "4", nom: "Durand", prenom: "Sophie", nomComplet: "Sophie Durand", matricule: "ETU004"},
                            ]}
                            product={mockProduct}
                            paymentStatuses={[
                                mockPaymentStatus,
                                {etudiantId: "2", status: "PAID", amount: 150000, date: new Date().toISOString()},
                                {etudiantId: "3", status: "UNPAID"},
                                {etudiantId: "4", status: "PENDING", date: new Date().toISOString()},
                            ]}
                            mode="paiement"
                            onAction={handleAction}
                            onViewDetails={handleViewDetails}
                            onRefresh={() => console.log('Refresh clicked')}
                        />
                    </div>
                )}

                {selectedExample === 'complete' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Composant complet avec logique intégrée
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Ce composant intègre toute la logique métier et les appels API.
                                Il nécessite un produit réel pour fonctionner.
                            </p>
                            <code className="block bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm">
                                {`<PaiementsListModern
    product={realProduct}
    view="commande"
/>`}
                            </code>
                        </div>
                    </div>
                )}

                {/* Code d'exemple */}
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Code d'exemple pour {selectedExample === 'card' ? 'la carte' : selectedExample === 'grid' ? 'la grille' : 'le composant complet'}
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>
{selectedExample === 'card' ? `import { StudentPaymentCard } from '@/components/paiements';

<StudentPaymentCard
    etudiant={etudiant}
    product={product}
    paymentStatus={paymentStatus}
    mode="commande" // ou "paiement"
    onAction={handleAction}
    onViewDetails={handleViewDetails}
/>` : selectedExample === 'grid' ? `import { StudentPaymentGrid } from '@/components/paiements';

<StudentPaymentGrid
    etudiants={etudiants}
    product={product}
    paymentStatuses={paymentStatuses}
    mode="paiement"
    onAction={handleAction}
    onViewDetails={handleViewDetails}
    onRefresh={handleRefresh}
/>` : `import { PaiementsListModern } from '@/components/paiements';

<PaiementsListModern
    product={product}
    view="commande" // ou "paiement"
/>`}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ExampleUsage;
