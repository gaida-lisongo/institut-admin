
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { Etudiant } from "@/types/etudiant";
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CDF'
    }).format(amount);
};

interface SideBarPaymentProps {
    product: Product;
    etudiants: Etudiant[];
    stats: {
        totalPayments: number;
        totalPaymentsAmount: number;
        totalPaymentsOk: number;
        totalPaymentsPending: number;
    };
}

const SideBarPayment = ({product, etudiants, stats}: SideBarPaymentProps) => {

    return (
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6">
                <div className="mb-6">
                    {/* <Link
                        href="/paiements"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Link> */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Détails du produit
                    </h1>
                </div>

                <div className="space-y-6">
                    {/* Tranche */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Tranche</p>
                                <h2 className="text-xl font-bold">{product.tranche}</h2>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/20">
                            <p className="text-sm text-blue-100 mb-1">Montant</p>
                            <p className="text-3xl font-bold">{formatCurrency(product.montant)}</p>
                        </div>
                    </div>

                    {/* Classe Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Classe</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {product.classeId?.niveau}
                                </p>
                            </div>
                        </div>

                        {/* Année Scolaire */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Année académique</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {product.anneeId?.debut} - {product.anneeId?.fin}
                                </p>
                            </div>
                        </div>

                        {/* Nombre d'étudiants */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Étudiants inscrits</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {etudiants.length}
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transactions</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {stats?.totalPayments}
                            </p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Montatnt</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {stats?.totalPaymentsAmount}
                            </p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">En cours</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {stats?.totalPaymentsPending}
                            </p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Completés</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {stats?.totalPaymentsOk}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default SideBarPayment
