"use client";

import { usePaiementsContext } from "@/contexts/PaiementsContext";
import { useSystemeStore } from "@/stores/systemeStore";
import { Annee } from "@/types/annee";
import { Frais } from "@/types/frais";
import { Classe, Systeme } from "@/types/systemes";
import { Building2, CreditCard, Calendar, Users, DollarSign, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ProductModal from "@/components/paiements/ProductModal";
import ProductDataTable from "@/components/paiements/ProductDataTable";

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

export interface Payment {
    etudiantId: any;
    status: string;
    amount: number;
    orderNumber?: string;
    currency?: string;
}

export interface Product {
    _id: string;
    fraisId: string;
    etabId: string;
    anneeId: string;
    classeId: string;
    payments: Payment[];
    tranche: string;
    montant: number;
    createdAt?: Date;
    updatedAt?: Date;
    totalPayments: number;
    totalPaymentsAmount: number;
    totalPaymentsPending: number;
    totalPaymentsOk: number;
    totalPaymentsNo: number;
}

export interface ProductFormData {
    fraisId: string;
    etabId: string;
    anneeId: string;
    classeId: string;
    tranche: string;
    montant: number;
}


const PaiementsPage = () => {
    const { 
        etablissement, 
        selectedFrais, 
        selectedAnnee,
        allFrais: frais 
    } = usePaiementsContext();
    
    const { systemes, fetchSystemes } = useSystemeStore();
    
    // États pour la gestion des produits
    const [selectedSysteme, setSelectedSysteme] = useState<Systeme | null>(null);
    const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // États pour le modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (etablissement) {
            fetchSystemes();
        }
    }, [etablissement, fetchSystemes]);

    // Charger les produits quand une classe est sélectionnée OU quand le frais change
    useEffect(() => {
        if (selectedClasse && selectedAnnee && etablissement) {
            loadProducts();
        } else {
            // Réinitialiser les produits si les conditions ne sont pas remplies
            setProducts([]);
        }
    }, [selectedClasse, selectedAnnee, etablissement, selectedFrais]); // Ajout de selectedFrais

    const loadProducts = async () => {
        if (!selectedClasse || !selectedAnnee || !etablissement) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/finance/produits/${etablissement._id}/${selectedAnnee._id}/${selectedClasse._id}`);
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Filtrer les produits par frais sélectionné si un frais est sélectionné
                let filteredProducts = result.data || [];
                
                if (selectedFrais) {
                    filteredProducts = filteredProducts.filter((product: any) => {
                        const productFraisId = typeof product.fraisId === 'string' 
                            ? product.fraisId 
                            : product.fraisId?._id;
                        return productFraisId === selectedFrais._id;
                    });
                }
                
                // Ensure all products have the required numeric properties and valid data
                const processedProducts = filteredProducts.map((product: any) => ({
                    ...product,
                    _id: product._id || '',
                    fraisId: typeof product.fraisId === 'string' ? product.fraisId : product.fraisId?._id || '',
                    etabId: typeof product.etabId === 'string' ? product.etabId : product.etabId?._id || '',
                    anneeId: typeof product.anneeId === 'string' ? product.anneeId : product.anneeId?._id || '',
                    classeId: typeof product.classeId === 'string' ? product.classeId : product.classeId?._id || '',
                    tranche: product.tranche || '',
                    montant: Number(product.montant) || 0,
                    payments: Array.isArray(product.payments) ? product.payments.map((payment: any) => ({
                        etudiantId: typeof payment.etudiantId === 'string' ? payment.etudiantId : payment.etudiantId?._id || '',
                        status: payment.status || '',
                        amount: Number(payment.amount) || 0,
                        orderNumber: payment.orderNumber || '',
                        currency: payment.currency || 'USD'
                    })) : [],
                    totalPayments: Number(product.totalPayments) || 0,
                    totalPaymentsAmount: Number(product.totalPaymentsAmount) || 0,
                    totalPaymentsPending: Number(product.totalPaymentsPending) || 0,
                    totalPaymentsOk: Number(product.totalPaymentsOk) || 0,
                    totalPaymentsNo: Number(product.totalPaymentsNo) || 0,
                    createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
                    updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined
                }));
                
                setProducts(processedProducts);
            } else {
                console.error('Erreur lors du chargement des produits:', result.message);
                setProducts([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fonctions CRUD pour les produits
    const handleCreateProduct = () => {
        setSelectedProduct(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDeleteProduct = async (product: Product) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/finance/produits/${product._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Recharger la liste des produits
                await loadProducts();
                alert('Produit supprimé avec succès');
            } else {
                alert(result.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur de connexion au serveur');
        }
    };

    const handleModalSuccess = () => {
        // Recharger la liste des produits après création/modification
        loadProducts();
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    if (!etablissement) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun établissement sélectionné
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Veuillez sélectionner un établissement pour voir les informations de paiement.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-6 min-h-screen">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
                {/* Section 1: Recherche */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recherche de Produits
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Section 2: Frais et Année */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contexte Actuel
                    </h3>
                    
                    {/* Frais sélectionné */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Frais Académique
                        </label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {selectedFrais ? (
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedFrais.designation}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedFrais.montant.toLocaleString()} $ • {selectedFrais.categorie}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Aucun frais sélectionné
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Année académique */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Année Académique
                        </label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {selectedAnnee ? (
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedAnnee.debut}-{selectedAnnee.fin}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedAnnee.description}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Aucune année sélectionnée
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Sélection Système et Classe */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Sélection de Classe
                    </h3>
                    
                    {/* Sélection du système */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Système d'Enseignement
                        </label>
                        <div className="space-y-2">
                            {systemes.map((systeme) => (
                                <button
                                    key={systeme._id}
                                    onClick={() => {
                                        setSelectedSysteme(systeme);
                                        setSelectedClasse(null); // Reset classe selection
                                    }}
                                    className={`w-full p-3 text-left rounded-md border transition-colors ${
                                        selectedSysteme?._id === systeme._id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                                    }`}
                                >
                                    <p className="font-medium">{systeme.designation}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {systeme.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sélection de la classe */}
                    {selectedSysteme && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Classes Disponibles
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedSysteme.cycles.map((cycle) =>
                                    cycle.classes.map((classe) => (
                                        <button
                                            key={classe._id}
                                            onClick={() => setSelectedClasse(classe)}
                                            className={`w-full p-3 text-left rounded-md border transition-colors ${
                                                selectedClasse?._id === classe._id
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                                            }`}
                                        >
                                            <p className="font-medium">{classe.niveau}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {cycle.designation} • {classe.description}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Zone de contenu principal */}
            <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des Produits
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {selectedClasse 
                                    ? `Produits pour la classe ${selectedClasse.niveau}`
                                    : 'Sélectionnez une classe pour voir les produits'
                                }
                            </p>
                        </div>
                        
                        {selectedClasse && selectedFrais && selectedAnnee && (
                            <button 
                                onClick={handleCreateProduct}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Nouveau Produit
                            </button>
                        )}
                    </div>

                    {/* Contenu des produits */}
                    {selectedClasse ? (
                        <>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <DollarSign className="w-12 h-12 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Aucun produit trouvé
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {selectedFrais 
                                            ? `Aucun produit pour le frais "${selectedFrais.designation}" dans cette classe`
                                            : 'Créez votre premier produit pour cette classe'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <ProductDataTable
                                    products={products}
                                    loading={loading}
                                    onEdit={handleEditProduct}
                                    onView={handleViewProduct}
                                    onDelete={handleDeleteProduct}
                                    searchTerm={searchTerm}
                                    classe={selectedClasse}
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Users className="w-12 h-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Sélectionnez une classe
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choisissez un système d'enseignement et une classe dans la sidebar pour commencer
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal pour la gestion des produits */}
            {selectedClasse && selectedFrais && selectedAnnee && etablissement && (
                <ProductModal
                    isOpen={showModal}
                    onClose={closeModal}
                    onSuccess={handleModalSuccess}
                    product={selectedProduct}
                    mode={modalMode}
                    etabId={etablissement._id}
                    selectedFrais={selectedFrais}
                    selectedAnnee={selectedAnnee}
                    selectedClasse={selectedClasse}
                />
            )}
        </div>
    );
}

export default PaiementsPage;
