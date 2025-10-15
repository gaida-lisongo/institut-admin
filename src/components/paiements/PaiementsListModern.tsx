"use client";

import { useEffect, useState } from "react";
import { Etudiant } from "@/types/etudiant";
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { generateInvoicePdf } from "@/utils/pdfGenerator";
import { 
    XCircle,
    ArrowLeft,
    Loader2
} from "lucide-react";
import Link from "next/link";
import StudentPaymentGrid from "./StudentPaymentGrid";
import PaiementValidator from "./PaiementValidator";

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

interface PaymentStatus {
    etudiantId: string;
    status: 'PAID' | 'PENDING' | 'UNPAID';
    amount?: number;
    date?: string;
}

interface PaiementsListModernProps {
    product: Product;
    view?: 'commande' | 'paiement';
    stats?: {
        totalPayments: number;
        totalPaymentsAmount: number;
        totalPaymentsOk: number;
        totalPaymentsPending: number;
        totalPaymentsNo: number;
    };
    isModal?: boolean;
    onClose?: () => void;
}

export interface EtudiantWithPayments {
    _id: string;
    nomComplet: string;
    photo?: string;
    matricule: string;
    nationalte: string;
    lieu_naissance: string;
    sexe: string;
    date_naissance: string;
    payments: {
        _id: string;
        status: 'OK' | 'PENDING' | 'NO';
        amount: number;
        orderNumber: string;
        produitId: string;
        createdAt: string;
        updatedAt: string;
    }[];
}


interface PaymentResponse {
    etudiant: EtudiantWithPayments;
}

const PaiementsListModern = ({ product, view = 'paiement', stats, isModal = false, onClose }: PaiementsListModernProps) => {
    const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedPayment, setSelectedPayment] = useState<EtudiantWithPayments | null>(null);

    const fetchEtudiants = async (classeId: string, anneeId: string) => {
        try {
            const request = await fetch(`${API_URL}/etudiants/inscrits/classe/${classeId}/${anneeId}`);
            const response = await request.json();
            if (response.success) {
                return response.data;
            } else {
                console.error('Error fetching students:', response.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            return [];
        }
    };

    const generateOrderNumber = () => {
        const timestamp = new Date().getTime();
        return timestamp.toString().slice(-9);
    };

    const handleCommande = async (etudiant: any) => {
        console.log('Commande de paiement de', etudiant);
        console.log('Current Product:', product);

        try {
            const orderNumber = `INV-${generateOrderNumber()}`;
            const request = await fetch(`${API_URL}/finance/payment/${product._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    etudiantId: etudiant._id,
                    orderNumber,
                    amount: product.montant,
                    currency: 'CDF'
                })
            });

            const response = await request.json();

            if (response.success) {
                console.log('Commande de paiement réussie', response);
                await generateInvoicePdf(etudiant, product, orderNumber);
                
                // Mettre à jour le statut local
                setPaymentStatuses(prev => prev.map(ps => 
                    ps.etudiantId === etudiant._id 
                        ? { ...ps, status: 'PENDING' as const, date: new Date().toISOString() }
                        : ps
                ));
            } else {
                await generateInvoicePdf(etudiant, product, orderNumber);
                throw new Error(response.error || 'Erreur lors de la commande');
            }
        } catch (error) {
            console.error("Erreur lors de la commande de paiement", error);
            alert("Erreur lors de la génération de la commande. Veuillez réessayer.");
        }
    };

    const handlePaiement = async (etudiant: any) => {

        try {
            const request = await fetch(`${API_URL}/finance/payments/etudiant/${etudiant._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const response = await request.json();

            if (response.success) {
                console.log('Commande de paiement réussie', response);
                const { etudiant } = response.data;
                setSelectedPayment(etudiant);
            } else {
                console.error('Erreur lors de la commande de paiement', response);
            }
        } catch (error) {
            console.error("Erreur lors de la commande de paiement", error);
        }
    };

    const updatePaymentStatus = async (paymentId: string, status: 'OK' | 'PENDING' | 'NO') => {
        try {
            const request = await fetch(`${API_URL}/finance/payment/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const response = await request.json();

            if (response.success) {
                console.log('Statut de paiement mis à jour', response);
                await handleRefresh();
                setSelectedPayment(null);
            } else {
                console.error('Erreur lors de la mise à jour du statut de paiement', response);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de paiement', error);
        }
    };

    const handleAction = async (etudiant: Etudiant, action: 'commande' | 'paiement') => {
        if (action === 'commande') {
            await handleCommande(etudiant);
        } else {
            await handlePaiement(etudiant);
        }
    };

    const handleViewDetails = (etudiant: Etudiant) => {
        console.log('Voir détails de', etudiant);
        // Ici vous pouvez ouvrir un modal avec les détails de l'étudiant
    };

    const handleRefresh = async () => {
        if (!product?.classeId?._id || !product?.anneeId?._id) return;
        
        setRefreshing(true);
        try {
            const data = await fetchEtudiants(product.classeId._id, product.anneeId._id);
            setEtudiants(data || []);
            
            // Régénérer des statuts de paiement aléatoires pour la démo
            const statuses: PaymentStatus[] = (data || []).map((etudiant: any) => ({
                etudiantId: etudiant._id,
                status: Math.random() > 0.6 ? 'PAID' : Math.random() > 0.5 ? 'PENDING' : 'UNPAID',
                amount: Math.random() > 0.5 ? product.montant : undefined,
                date: Math.random() > 0.5 ? new Date().toISOString() : undefined
            }));
            setPaymentStatuses(statuses);
        } catch (error) {
            console.error('Erreur lors de l\'actualisation:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderSwith = () => {        
        return selectedPayment ? (
                    <PaiementValidator
                        payment={selectedPayment}
                        onChange={updatePaymentStatus}
                        onReturn={() => setSelectedPayment(null)}
                    />
                ) : (
                    <StudentPaymentGrid
                        etudiants={etudiants}
                        product={product}
                        paymentStatuses={paymentStatuses}
                        mode={view}
                        onAction={handleAction}
                        onViewDetails={handleViewDetails}
                        loading={refreshing}
                        onRefresh={handleRefresh}
                        stats={stats}
                        onCheck={handlePaiement}
                    />
                )
    }

    useEffect(() => {
        const loadData = async () => {
            if (product && product.classeId?._id && product.anneeId?._id) {
                setLoading(true);
                try {
                    const data = await fetchEtudiants(product.classeId._id, product.anneeId._id);
                    setEtudiants(data || []);
                    
                    // Générer des statuts de paiement aléatoires pour la démo
                    const statuses: PaymentStatus[] = (data || []).map((etudiant: any) => ({
                        etudiantId: etudiant._id,
                        status: Math.random() > 0.6 ? 'PAID' : Math.random() > 0.5 ? 'PENDING' : 'UNPAID',
                        amount: Math.random() > 0.5 ? product.montant : undefined,
                        date: Math.random() > 0.5 ? new Date().toISOString() : undefined
                    }));
                    setPaymentStatuses(statuses);
                } catch (error) {
                    console.error('Error fetching etudiants:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Produit introuvable
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Le produit demandé n'existe pas ou a été supprimé.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des étudiants...</p>
                </div>
            </div>
        );
    }

    if (isModal) {
        return (
            <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {view === 'commande' ? 'Gestion des commandes' : 'Gestion des paiements'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Tranche "{product.tranche}" - {product.classeId?.niveau}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>
                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {renderSwith()}
                </div>
                
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {view === 'paiement' && <Link
                            href={`/paiements/${product.etabId._id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {view === 'commande' ? 'Gestion des commandes' : 'Gestion des paiements'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Tranche "{product.tranche}" - {product.classeId?.niveau} ({product.anneeId?.debut}-{product.anneeId?.fin})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grille des étudiants */}
                {renderSwith()}
            </div>
        </main>
    );
};

export default PaiementsListModern;
