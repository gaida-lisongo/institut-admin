"use client";
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
    XCircle,
    ArrowLeft,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { PaiementsListModern } from "@/components/paiements";

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;


export default function PagePayment() {
    const params = useParams();
    const page = params.slug as string;
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalPaymentsAmount: 0,
        totalPaymentsOk: 0,
        totalPaymentsPending: 0,
        totalPaymentsNo: 0,
    });

    const fetchProduit = async (produitId: string) => {
        try {
            const request = await fetch(`${API_URL}/finance/produit/${produitId}`);
            const response = await request.json();

            if (response.success) {
                const {
                    produit,
                    totalPayments,
                    totalPaymentsAmount,
                    totalPaymentsOk,
                    totalPaymentsPending,
                    totalPaymentsNo,
                } = response.data;
                
                setProduct(produit);
                setStats({
                    totalPayments,
                    totalPaymentsAmount,
                    totalPaymentsOk,
                    totalPaymentsPending,
                    totalPaymentsNo,
                });
                return produit;
            } else {
                console.error('Error fetching product:', response.error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchProduit(page);
            setLoading(false);
        };

        if (page) {
            loadData();
        }
    }, [page]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
                </div>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex h-screen overflow-hidden">
                {/* <SideBarPayment product={product} etudiants={etudiants} stats={stats} /> */}
                <PaiementsListModern product={product} view='commande' stats={stats} />
            </div>
        </div>
    );
}