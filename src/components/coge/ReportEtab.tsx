"use client";

import { useAuth } from "@/stores/personnelStore";
import { Personnel } from "@/types/personnel";
import { useEffect, useState } from "react";
import { Send, Paperclip, X, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft, Plus, Edit, Trash2, Eye, Download, ExternalLink } from "lucide-react";
import BlobManager from "@/services/BlobManager";

interface Message {
    _id?: string;
    senderId: Personnel;
    concerne: string;
    message: string;
    pieces: string[];
    dateCreation: Date;
    status: "PENDING" | "READ" | "REJECTED";
}

interface Room {
    _id: string;
    name: string;
    users: Personnel[];
    messages: Message[];
}

interface ReportEtabProps {
    etablissementId: string;
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

const ReportEtab = ({ etablissementId }: ReportEtabProps) => {
    const { currentUser } = useAuth();
    
    // États du formulaire
    const [concerne, setConcerne] = useState('');
    const [message, setMessage] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    
    // États des pièces jointes
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    
    // États de l'interface
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    // États pour la gestion des messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isDeletingMessage, setIsDeletingMessage] = useState<string | null>(null);

    const fetchReports = async (id: string) => {
        setIsLoadingMessages(true);
        try {
            const request = await fetch(`${API_URL}/reports/chats/${id}`);
            const response = await request.json();
            
            if(response.success) {
                const data: Message[] = response.data;
                
                // Extraire tous les messages de toutes les rooms
                const allMessages: Message[] = data;
                
                setMessages(allMessages);
                return data;
            }
        } catch (error) {
            console.error('❌ Error fetching report:', error);
            setErrorMessage('Erreur lors du chargement des messages');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const fetchDestinations = async () => {
        setIsLoadingRooms(true);
        try {
            const request = await fetch(`${API_URL}/reports/rooms`);
            const response = await request.json();
            if(response.success) {
                const data: Room[] = response.data;
                setRooms(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
            setErrorMessage('Erreur lors du chargement des destinations');
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const sendReport = async ({
        senderId,
        concerne,
        message,
        pieces,
        roomId
    } : {
        senderId: string;
        concerne: string;
        message: string;
        pieces: string[];
        roomId: string;
    }) => {
        try {
            const request = await fetch(`${API_URL}/reports/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senderId,
                    concerne,
                    message,
                    pieces,
                    roomId
                }),
            });
            const response = await request.json();

            if(response.success) {
                const data : Message = response.data;
                return data;
            }
        } catch (error) {
            console.error('Error sending report:', error);
        }
    };

    const updateMessage = async (id: string, messageData: {
        concerne: string;
        message: string;
        pieces: string[];
    }) => {
        try {
            setIsSending(true);
            const request = await fetch(`${API_URL}/reports/message/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });
            const response = await request.json();
            if(response.success) {
                const data: Message = response.data;
                // Mettre à jour la liste locale
                setMessages(prev => prev.map(msg => msg._id === id ? data : msg));
                setSendStatus('success');
                setView('list');
                setSelectedMessage(null);
                return data;
            }
        } catch (error) {
            console.error('Error updating message:', error);
            setErrorMessage('Erreur lors de la modification du message');
            setSendStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            setIsDeletingMessage(id);
            const request = await fetch(`${API_URL}/reports/message/${id}`, {
                method: 'DELETE',
            });
            const response = await request.json();
            if(response.success) {
                // Supprimer de la liste locale
                setMessages(prev => prev.filter(msg => msg._id !== id));
                return true;
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            setErrorMessage('Erreur lors de la suppression du message');
        } finally {
            setIsDeletingMessage(null);
        }
    };

    // Gestion de l'upload de pièces jointes
    const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation de la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage('La taille du fichier ne doit pas dépasser 10MB');
            setSendStatus('error');
            return;
        }

        try {
            setIsUploadingAttachment(true);
            setUploadProgress(`Upload de ${file.name}...`);

            const result = await BlobManager.createBlob(file, {
                etablissementId,
                type: 'report-attachment',
                userId: currentUser?._id
            });

            if (result.url) {
                setAttachments(prev => [...prev, result.url]);
                setUploadProgress('');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setErrorMessage('Erreur lors de l\'upload du fichier');
            setSendStatus('error');
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    // Suppression d'une pièce jointe
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Envoi du rapport
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser?._id || !selectedRoom || !concerne || !message) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires');
            setSendStatus('error');
            return;
        }

        try {
            setIsSending(true);
            setSendStatus('idle');
            setErrorMessage('');

            const result = await sendReport({
                senderId: currentUser._id,
                concerne,
                message,
                pieces: attachments,
                roomId: selectedRoom
            });

            if (result) {
                setSendStatus('success');
                // Ajouter le nouveau message à la liste
                setMessages(prev => [result, ...prev]);
                // Réinitialiser le formulaire
                setConcerne('');
                setMessage('');
                setAttachments([]);
                setSelectedRoom('');
                
                setTimeout(() => {
                    setSendStatus('idle');
                    setView('list');
                }, 2000);
            } else {
                throw new Error('Échec de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur envoi:', error);
            setErrorMessage('Erreur lors de l\'envoi du rapport');
            setSendStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    // Modification du rapport
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMessage?._id || !concerne || !message) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires');
            setSendStatus('error');
            return;
        }

        const result = await updateMessage(selectedMessage._id, {
            concerne,
            message,
            pieces: attachments
        });

        if (result) {
            // Réinitialiser le formulaire
            setConcerne('');
            setMessage('');
            setAttachments([]);
            setSelectedRoom('');
        }
    };

    // Préparer l'édition d'un message
    const handleEditMessage = (msg: Message) => {
        setSelectedMessage(msg);
        setConcerne(msg.concerne);
        setMessage(msg.message);
        setAttachments(msg.pieces || []);
        setView('edit');
    };

    useEffect(() => {
        if (currentUser?._id) {
            fetchReports(currentUser._id);
            fetchDestinations();
        }
    }, [currentUser]);

    // Vue liste des messages
    if (view === 'list') {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-6 h-6" />
                                    Mes rapports
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Liste de tous vos rapports envoyés
                                </p>
                            </div>
                            <button
                                onClick={() => setView('create')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouveau rapport
                            </button>
                        </div>
                    </div>

                    {/* Liste des messages */}
                    <div className="p-6">

                        {isLoadingMessages ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des messages...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">Aucun rapport envoyé</p>
                                <button
                                    onClick={() => setView('create')}
                                    className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Créer votre premier rapport
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {msg.concerne}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        msg.status === 'READ' 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                            : msg.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                        {msg.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                    {msg.message}
                                                </p>
                                                
                                                {/* Pièces jointes */}
                                                {msg.pieces && msg.pieces.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            <Paperclip className="w-3 h-3" />
                                                            {msg.pieces.length} pièce(s) jointe(s):
                                                        </div>
                                                        <div className="space-y-1">
                                                            {msg.pieces.map((pieceUrl, index) => (
                                                                <div 
                                                                    key={index}
                                                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                                                                >
                                                                    <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                                    <span className="flex-1 truncate text-gray-600 dark:text-gray-400">
                                                                        Pièce jointe {index + 1}
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        <a
                                                                            href={pieceUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                                            title="Ouvrir dans un nouvel onglet"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                        <a
                                                                            href={pieceUrl}
                                                                            download
                                                                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                                            title="Télécharger"
                                                                        >
                                                                            <Download className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(msg.dateCreation).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEditMessage(msg)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => msg._id && deleteMessage(msg._id)}
                                                    disabled={isDeletingMessage === msg._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    {isDeletingMessage === msg._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Vue création/édition de rapport
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setView('list');
                                setSelectedMessage(null);
                                setConcerne('');
                                setMessage('');
                                setAttachments([]);
                                setSelectedRoom('');
                                setSendStatus('idle');
                                setErrorMessage('');
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-6 h-6" />
                                {view === 'edit' ? 'Modifier le rapport' : 'Envoyer un rapport'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {view === 'edit' ? 'Modifiez les informations de votre rapport' : 'Remplissez le formulaire ci-dessous pour envoyer un rapport'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={view === 'edit' ? handleUpdate : handleSubmit} className="p-6 space-y-6">
                    {/* Destination - Uniquement en mode création */}
                    {view === 'create' && (
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Destination <span className="text-red-500">*</span>
                            </label>
                            {isLoadingRooms ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Chargement des destinations...
                                </div>
                            ) : (
                                <select
                                    id="destination"
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Sélectionnez une destination</option>
                                    {rooms.map((room) => (
                                        <option key={room._id} value={room._id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Concerne */}
                    <div>
                        <label htmlFor="concerne" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Concerne <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="concerne"
                            type="text"
                            value={concerne}
                            onChange={(e) => setConcerne(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Objet du rapport"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Détails du rapport..."
                            required
                        />
                    </div>

                    {/* Pièces jointes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pièces jointes
                        </label>
                        
                        {/* Liste des pièces jointes */}
                        {attachments.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {attachments.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                Pièce jointe {index + 1}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bouton d'upload */}
                        <label className="block">
                            <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                {isUploadingAttachment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}</span>
                                    </>
                                ) : (
                                    <>
                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Ajouter une pièce jointe
                                        </span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                onChange={handleAttachmentUpload}
                                className="hidden"
                                disabled={isUploadingAttachment}
                            />
                        </label>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Formats acceptés: PDF, Images, Documents (max 10MB)
                        </p>
                    </div>

                    {/* Messages de statut */}
                    {sendStatus === 'success' && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                                {view === 'edit' ? 'Rapport modifié avec succès !' : 'Rapport envoyé avec succès !'}
                            </span>
                        </div>
                    )}

                    {sendStatus === 'error' && errorMessage && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-300">
                                {errorMessage}
                            </span>
                        </div>
                    )}

                    {/* Bouton d'envoi/modification */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setView('list');
                                setSelectedMessage(null);
                                setConcerne('');
                                setMessage('');
                                setAttachments([]);
                                setSelectedRoom('');
                                setSendStatus('idle');
                                setErrorMessage('');
                            }}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || isUploadingAttachment}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {view === 'edit' ? 'Modification...' : 'Envoi en cours...'}
                                </>
                            ) : (
                                <>
                                    {view === 'edit' ? <Edit className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {view === 'edit' ? 'Modifier le rapport' : 'Envoyer le rapport'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportEtab;