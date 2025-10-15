"use client";
import { generateCommandePdf, generateInvoice, generateInvoicePdf } from "@/utils/pdfGenerator";
import { useEffect, useState } from "react";
import { Etudiant } from "@/types/etudiant";
import { Frais } from "@/types/frais";
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { 
    DollarSign, 
    Calendar, 
    GraduationCap, 
    Users, 
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    Download,
    CreditCard,
    User,
    Mail,
    Phone,
    Hash,
    Building,
    BookOpen,
    Loader2
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;
interface PaymentStatus {
    etudiantId: string;
    status: 'PAID' | 'PENDING' | 'UNPAID';
    amount?: number;
    date?: string;
}

const PaiementsList = ({ product, view }: { product: Product, view?: 'commande' | 'paiement' }) => {
    const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'UNPAID'>('ALL');
    const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);

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

    const handlePayement = async (etudiant: Etudiant) => {
        console.log('Payement de', etudiant);

    }

    const generateOrderNumber = ()=> {
        const timesTamp = new Date().getTime();
        return timesTamp.toString().slice(-9)
    }
    
    const commandePayment = async (etudiant: any) => {
        console.log('Commande de paiement de', etudiant);
        console.log('Current Product :  ', product);

        try {

            const orderNumber = `INV-${generateOrderNumber()}`
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

            console.log('Commande de paiement réussie', response);
            await generateInvoicePdf(etudiant, product, orderNumber);

        } catch (error) {
            console.log("error during command payment", error);
        }
    }
    

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CDF'
        }).format(amount);
    };
    useEffect(() => {
        if (product && product.classeId?._id && product.anneeId?._id) {
            fetchEtudiants(product.classeId._id, product.anneeId._id)
                .then((data) => {
                    setEtudiants(data || []);
                    
                    // Générer des statuts de paiement aléatoires pour la démo
                    const statuses: PaymentStatus[] = (data || []).map((etudiant: any) => ({
                        etudiantId: etudiant._id,
                        status: Math.random() > 0.5 ? 'PAID' : Math.random() > 0.5 ? 'PENDING' : 'UNPAID',
                        amount: Math.random() > 0.5 ? product.montant : undefined,
                        date: Math.random() > 0.5 ? new Date().toISOString() : undefined
                    }));
                    setPaymentStatuses(statuses);
                })
                .catch((error) => {
                    console.error('Error fetching etudiants:', error);
                });
        }
    }, [product]);

    const getPaymentStatus = (etudiantId: string) => {
        return paymentStatuses.find(ps => ps.etudiantId === etudiantId);
    };

    const filteredEtudiants = etudiants.filter((etudiant : any) => {
        const matchesSearch = 
            etudiant.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            etudiant.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            etudiant.matricule?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'ALL') return matchesSearch;

        const status = getPaymentStatus(etudiant._id);
        return matchesSearch && status?.status === filterStatus;
    });

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
        <main className="flex-1 overflow-auto">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Liste des étudiants
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gestion des paiements pour la tranche "{product.tranche}"
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            <select
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="PAID">Payés</option>
                                <option value="PENDING">En attente</option>
                                <option value="UNPAID">Non payés</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEtudiants.map((etudiant : any) => {
                        const paymentStatus = getPaymentStatus(etudiant._id);
                        
                        return (
                            <div 
                                key={etudiant._id} 
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Student Header */}
                                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                                {etudiant?.nomComplet}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {etudiant.matricule}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                ID: {etudiant.id}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {etudiant.prenom?.charAt(0)}{etudiant.nom?.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Details */}
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {etudiant.nationalite}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {etudiant.lieu_naissance}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {etudiant.sexe}
                                        </span>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Montant à payer
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(product.montant)}
                                            </span>
                                        </div>

                                        {paymentStatus?.date && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Date de paiement
                                                </span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {new Date(paymentStatus.date).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                    {
                                        view === 'commande' ? (
                                        <button 
                                            onClick={() => commandePayment(etudiant)}   
                                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Bon de commande
                                        </button>
                                            
                                        ) : (
                                        <button 
                                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            onClick={() => handlePayement(etudiant)}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Paiement
                                        </button>                                            
                                        )
                                    }
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredEtudiants.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun étudiant trouvé
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Aucun étudiant ne correspond à vos critères de recherche.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterStatus("ALL");
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default PaiementsList;
