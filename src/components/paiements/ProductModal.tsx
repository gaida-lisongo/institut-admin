"use client";

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Product, ProductFormData } from '@/app/(admin)/(coge)/paiements/[slug]/page';
import { Frais } from '@/types/frais';
import { Annee } from '@/types/annee';
import { Classe } from '@/types/systemes';
import PaiementsListModern from './PaiementsListModern';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product | null;
    mode: 'create' | 'edit' | 'view';
    etabId: string;
    selectedFrais: Frais;
    selectedAnnee: Annee;
    selectedClasse: Classe;
}

const ProductModal = ({
    isOpen,
    onClose,
    onSuccess,
    product,
    mode,
    etabId,
    selectedFrais,
    selectedAnnee,
    selectedClasse
}: ProductModalProps) => {
    const [formData, setFormData] = useState<ProductFormData>({
        fraisId: '',
        etabId: '',
        anneeId: '',
        classeId: '',
        tranche: '',
        montant: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalPaymentsAmount: 0,
        totalPaymentsOk: 0,
        totalPaymentsPending: 0,
        totalPaymentsNo: 0,
    });
    const [produit, setProduit] = useState<Product | null>(null);

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
                
                setProduit(produit);
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
        if (product) {
            fetchProduit(product._id);
        }
    }, [product]);
    
    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setFormData({
                    fraisId: selectedFrais._id,
                    etabId: etabId,
                    anneeId: selectedAnnee._id,
                    classeId: selectedClasse._id,
                    tranche: '',
                    montant: selectedFrais.montant
                });
            } else if (product) {
                setFormData({
                    fraisId: product.fraisId,
                    etabId: product.etabId,
                    anneeId: product.anneeId,
                    classeId: product.classeId,
                    tranche: product.tranche,
                    montant: product.montant
                });
            }
            setError(null);
        }
    }, [isOpen, mode, product, selectedFrais, selectedAnnee, selectedClasse, etabId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.tranche.trim()) {
            setError('La tranche est obligatoire');
            return;
        }

        if (formData.montant <= 0) {
            setError('Le montant doit être supérieur à 0');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const url = mode === 'create' 
                ? `${API_URL}/finance/produit`
                : `${API_URL}/finance/produit/${product?._id}`;
            
            const response = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof ProductFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;
    let renderModal;
    switch (mode) {
        case 'create':
            renderModal = (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Nouveau Produit
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Informations contextuelles */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Frais:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedFrais.designation}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Année:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedAnnee.debut}-{selectedAnnee.fin}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Classe:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClasse.niveau}
                                    </span>
                                </div>
                            </div>

                            {/* Tranche */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tranche *
                                </label>
                                <select
                                    value={formData.tranche}
                                    onChange={(e) => handleChange('tranche', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                    required
                                >
                                    <option value="">Sélectionner une tranche</option>
                                    <option value="1ère Tranche">1ère Tranche</option>
                                    <option value="2ème Tranche">2ème Tranche</option>
                                    <option value="3ème Tranche">3ème Tranche</option>
                                    <option value="Tranche Unique">Tranche Unique</option>
                                    <option value="Tranche Spéciale">Tranche Spéciale</option>
                                </select>
                            </div>

                            {/* Montant */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Montant ($) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.montant}
                                    onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                    required
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Montant de base du frais: {selectedFrais.montant.toLocaleString()} $
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                            
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Créer
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            break;
        case 'edit':
            renderModal = (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Modifier le Produit
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Informations contextuelles */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Frais:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedFrais.designation}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Année:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedAnnee.debut}-{selectedAnnee.fin}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Classe:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClasse.niveau}
                                    </span>
                                </div>
                            </div>

                            {/* Tranche */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tranche *
                                </label>
                                <select
                                    value={formData.tranche}
                                    onChange={(e) => handleChange('tranche', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                    required
                                >
                                    <option value="">Sélectionner une tranche</option>
                                    <option value="1ère Tranche">1ère Tranche</option>
                                    <option value="2ème Tranche">2ème Tranche</option>
                                    <option value="3ème Tranche">3ème Tranche</option>
                                    <option value="Tranche Unique">Tranche Unique</option>
                                    <option value="Tranche Spéciale">Tranche Spéciale</option>
                                </select>
                            </div>

                            {/* Montant */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Montant ($) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.montant}
                                    onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                    required
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Montant de base du frais: {selectedFrais.montant.toLocaleString()} $
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Modifier
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            break;
        default:
            renderModal = (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
                        {produit ? (
                            <PaiementsListModern
                                product={produit}
                                view="paiement"
                                stats={stats}
                                isModal={true}
                                onClose={onClose}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
            break;
    }

    return renderModal;
};

export default ProductModal;
