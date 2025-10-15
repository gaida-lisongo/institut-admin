"use client";

import { usePaiementsContext } from "@/contexts/PaiementsContext";
import { useSystemeStore } from "@/stores/systemeStore";
import { Annee } from "@/types/annee";
import { Frais } from "@/types/frais";
import { Classe, Systeme } from "@/types/systemes";
import { Building2, CreditCard, Calendar, Users, DollarSign, Plus, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import ProductModal from "@/components/paiements/ProductModal";
import ProductDataTable from "@/components/paiements/ProductDataTable";
import { PaiementsListModern } from "@/components/paiements";

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
    fraisId: any;
    etabId: any;
    anneeId: any;
    classeId: any;
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
                        currency: 'CDF',
                        etudiant: payment.etudiant || null,
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

    const printReport = async () => {
        try {
            // Import ExcelJS dynamiquement
            const ExcelJS = await import('exceljs');
            
            // Créer un nouveau workbook
            const workbook = new ExcelJS.Workbook();
            
            // Préparer les données
            const transactionsOK: any[] = [];
            let soldeOK = 0;
            const transactionsPENDING: any[] = [];
            let soldePENDING = 0;
            const transactionsNO: any[] = [];
            let soldeNO = 0;
            const allTransactions: any[] = [];
            
            // Résumé par produit
            const productSummary: any[] = [];

            products.forEach((product: any) => {
                let productOK = 0;
                let productPENDING = 0;
                let productNO = 0;
                let productTotal = 0;

                product.payments.forEach((payment: any) => {
                    const enrichedPayment = {
                        ...payment,
                        productId: product._id,
                        productTranche: product.tranche,
                        productMontant: product.montant,
                        fraisId: product.fraisId,
                        classeId: product.classeId
                    };

                    allTransactions.push(enrichedPayment);
                    productTotal += payment.amount;

                    if (payment.status === 'OK') {
                        transactionsOK.push(enrichedPayment);
                        soldeOK += payment.amount;
                        productOK += payment.amount;
                    } else if (payment.status === 'PENDING') {
                        transactionsPENDING.push(enrichedPayment);
                        soldePENDING += payment.amount;
                        productPENDING += payment.amount;
                    } else if (payment.status === 'NO') {
                        transactionsNO.push(enrichedPayment);
                        soldeNO += payment.amount;
                        productNO += payment.amount;
                    }
                });

                productSummary.push({
                    productId: product._id,
                    tranche: product.tranche,
                    montantUnitaire: product.montant,
                    totalPaiements: product.payments.length,
                    montantTotal: productTotal,
                    montantOK: productOK,
                    montantPENDING: productPENDING,
                    montantNO: productNO,
                    tauxRecouvrement: productTotal > 0 ? ((productOK / productTotal) * 100).toFixed(2) + '%' : '0%'
                });
            });

            // FEUILLE 1: SYNTHÈSE
            const syntheseSheet = workbook.addWorksheet('Synthèse');
            
            // En-tête de la synthèse
            syntheseSheet.mergeCells('A1:F1');
            syntheseSheet.getCell('A1').value = 'RAPPORT FINANCIER - SYNTHÈSE';
            syntheseSheet.getCell('A1').font = { bold: true, size: 16 };
            syntheseSheet.getCell('A1').alignment = { horizontal: 'center' };
            
            // Informations contextuelles
            syntheseSheet.getCell('A3').value = 'Établissement:';
            syntheseSheet.getCell('B3').value = etablissement?.designation || 'N/A';
            syntheseSheet.getCell('A4').value = 'Année Académique:';
            syntheseSheet.getCell('B4').value = selectedAnnee ? `${selectedAnnee.debut}-${selectedAnnee.fin}` : 'N/A';
            syntheseSheet.getCell('A5').value = 'Classe:';
            syntheseSheet.getCell('B5').value = selectedClasse?.niveau || 'N/A';
            syntheseSheet.getCell('A6').value = 'Frais:';
            syntheseSheet.getCell('B6').value = selectedFrais?.designation || 'Tous les frais';
            syntheseSheet.getCell('A7').value = 'Date du rapport:';
            syntheseSheet.getCell('B7').value = new Date().toLocaleDateString('fr-FR');

            // Résumé global
            syntheseSheet.getCell('A9').value = 'RÉSUMÉ GLOBAL';
            syntheseSheet.getCell('A9').font = { bold: true, size: 14 };
            
            syntheseSheet.getCell('A11').value = 'Statut';
            syntheseSheet.getCell('B11').value = 'Nombre de transactions';
            syntheseSheet.getCell('C11').value = 'Montant total';
            syntheseSheet.getCell('D11').value = 'Pourcentage';
            
            // Style de l'en-tête
            ['A11', 'B11', 'C11', 'D11'].forEach(cell => {
                syntheseSheet.getCell(cell).font = { bold: true };
                syntheseSheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
            });

            const totalTransactions = allTransactions.length;
            const totalMontant = soldeOK + soldePENDING + soldeNO;

            // Données du résumé
            syntheseSheet.getCell('A12').value = 'PAYÉ (OK)';
            syntheseSheet.getCell('B12').value = transactionsOK.length;
            syntheseSheet.getCell('C12').value = soldeOK;
            syntheseSheet.getCell('D12').value = totalMontant > 0 ? ((soldeOK / totalMontant) * 100).toFixed(2) + '%' : '0%';
            syntheseSheet.getCell('A12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };

            syntheseSheet.getCell('A13').value = 'EN ATTENTE (PENDING)';
            syntheseSheet.getCell('B13').value = transactionsPENDING.length;
            syntheseSheet.getCell('C13').value = soldePENDING;
            syntheseSheet.getCell('D13').value = totalMontant > 0 ? ((soldePENDING / totalMontant) * 100).toFixed(2) + '%' : '0%';
            syntheseSheet.getCell('A13').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } };

            syntheseSheet.getCell('A14').value = 'NON PAYÉ (NO)';
            syntheseSheet.getCell('B14').value = transactionsNO.length;
            syntheseSheet.getCell('C14').value = soldeNO;
            syntheseSheet.getCell('D14').value = totalMontant > 0 ? ((soldeNO / totalMontant) * 100).toFixed(2) + '%' : '0%';
            syntheseSheet.getCell('A14').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };

            syntheseSheet.getCell('A15').value = 'TOTAL';
            syntheseSheet.getCell('B15').value = totalTransactions;
            syntheseSheet.getCell('C15').value = totalMontant;
            syntheseSheet.getCell('D15').value = '100%';
            syntheseSheet.getCell('A15').font = { bold: true };

            // Ajuster les largeurs des colonnes
            syntheseSheet.getColumn('A').width = 20;
            syntheseSheet.getColumn('B').width = 20;
            syntheseSheet.getColumn('C').width = 15;
            syntheseSheet.getColumn('D').width = 15;

            // FEUILLE 2: RÉSUMÉ PAR PRODUIT
            const produitSheet = workbook.addWorksheet('Résumé par Produit');
            
            // En-tête
            produitSheet.mergeCells('A1:I1');
            produitSheet.getCell('A1').value = 'RÉSUMÉ PAR PRODUIT';
            produitSheet.getCell('A1').font = { bold: true, size: 16 };
            produitSheet.getCell('A1').alignment = { horizontal: 'center' };

            // Headers du tableau
            const productHeaders = ['ID Produit', 'Tranche', 'Montant Unitaire', 'Total Paiements', 'Montant Total', 'Montant OK', 'Montant PENDING', 'Montant NO', 'Taux Recouvrement'];
            productHeaders.forEach((header, index) => {
                const cell = produitSheet.getCell(3, index + 1);
                cell.value = header;
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
            });

            // Données des produits
            productSummary.forEach((product, index) => {
                const row = index + 4;
                produitSheet.getCell(row, 1).value = product.productId;
                produitSheet.getCell(row, 2).value = product.tranche;
                produitSheet.getCell(row, 3).value = product.montantUnitaire;
                produitSheet.getCell(row, 4).value = product.totalPaiements;
                produitSheet.getCell(row, 5).value = product.montantTotal;
                produitSheet.getCell(row, 6).value = product.montantOK;
                produitSheet.getCell(row, 7).value = product.montantPENDING;
                produitSheet.getCell(row, 8).value = product.montantNO;
                produitSheet.getCell(row, 9).value = product.tauxRecouvrement;
            });

            // Ajuster les largeurs
            for (let i = 1; i <= 9; i++) {
                produitSheet.getColumn(i).width = 15;
            }

            // FEUILLE 3: TOUS LES PAIEMENTS
            const paiementsSheet = workbook.addWorksheet('Tous les Paiements');
            
            // En-tête
            paiementsSheet.mergeCells('A1:H1');
            paiementsSheet.getCell('A1').value = 'LISTE COMPLÈTE DES PAIEMENTS';
            paiementsSheet.getCell('A1').font = { bold: true, size: 16 };
            paiementsSheet.getCell('A1').alignment = { horizontal: 'center' };

            // Headers du tableau
            const paymentHeaders = ['ID Étudiant', 'Statut', 'Montant', 'Numéro Commande', 'Devise', 'ID Produit', 'Tranche', 'Montant Produit'];
            paymentHeaders.forEach((header, index) => {
                const cell = paiementsSheet.getCell(3, index + 1);
                cell.value = header;
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
            });

            // Données des paiements
            allTransactions.forEach((payment, index) => {
                console.log("Current payment : ", payment);
                const row = index + 4;
                paiementsSheet.getCell(row, 1).value = payment.etudiant?.nomComplet;
                //Taille de la cellule au contenu
                paiementsSheet.getCell(row, 1).alignment = { 
                    wrapText: true,
                    horizontal: 'center',
                };
                paiementsSheet.getCell(row, 2).value = payment.status;
                paiementsSheet.getCell(row, 3).value = payment.amount;
                paiementsSheet.getCell(row, 4).value = payment.orderNumber || '';
                paiementsSheet.getCell(row, 5).value = 'CDF';
                paiementsSheet.getCell(row, 6).value = payment.productId;
                paiementsSheet.getCell(row, 7).value = payment.productTranche;
                paiementsSheet.getCell(row, 8).value = payment.productMontant;

                // Colorier selon le statut
                const statusCell = paiementsSheet.getCell(row, 2);
                if (payment.status === 'OK') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
                } else if (payment.status === 'PENDING') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } };
                } else if (payment.status === 'NO') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
                }
            });

            // Ajuster les largeurs
            for (let i = 1; i <= 8; i++) {
                paiementsSheet.getColumn(i).width = 15;
            }

            // Générer le nom du fichier
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `Rapport_Financier_${selectedClasse?.niveau || 'Classe'}_${timestamp}.xlsx`;

            // Télécharger le fichier
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);

            alert('Rapport généré avec succès !');

        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
        }
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
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleCreateProduct}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nouveau Produit
                                </button>
                                <button 
                                    onClick={printReport}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Rapport Excel
                                </button>
                            </div>
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
