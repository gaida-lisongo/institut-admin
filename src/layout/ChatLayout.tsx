'use client';
import SocketManager, { Message } from "@/services/SocketManager";
import { useCurrentUser } from "@/stores/personnelStore";
import { useEffect, useState, useRef } from "react";
import AttachmentModal from "@/components/chat/AttachmentModal";

export default function ChatLayout() {
    const {
        currentUser
    } = useCurrentUser();
    const socketManager = SocketManager;
    const [message, setMessage] = useState<string>('Connexion');
    const [isConnected, setIsConnected] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<{
        roomId: number;
        name: string;
        users: {
            _id: string;
            nom: string;
            post_nom: string;
            prenom: string;
            sexe: string;
            photo: string;
            matricule: string;
        }[],
        messages: Message[]
    } | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleAuth = (data : any) => {
        console.log('Auth response:', data);
        if (data.success) {
            setMessage("Authentification Ok");
        } else {
            setMessage(`Erreur auth: ${data.message}`);
        }
    }

    const handleSubmitMessage = (data : {
        message: string,
        pieces: string[],
        concerne: string;
    })=>{

        socketManager.newMessage(data);
    }

    const handleDeleteMessage = (message : Message) => {
        console.log('Delete message:', message);
        console.log('Current room:', currentRoom);
        
        if (!currentRoom) return;

        // Supprimer localement d'abord pour une réaction immédiate
        setCurrentRoom(prev => prev ? {
            ...prev,
            messages: prev.messages.filter(msg => msg._id !== message._id)
        } : null);

        // Envoyer la suppression au serveur
        socketManager.deleteMessage({
            roomId: currentRoom.roomId,
            messageId: message._id
        });
    }

    const renderDeletedMessage = (data: Message) => {
        console.log('Message deleted by server:', data);
        // Supprimer le message de la liste si ce n'est pas déjà fait
        setCurrentRoom(prev => prev ? {
            ...prev,
            messages: prev.messages.filter(msg => msg._id !== data._id)
        } : null);
    }

    const renderNewMessage = (data : Message) => {
        console.log('New message:', data);
        console.log('Current room:', currentRoom);
        
        setCurrentRoom(prev => prev ? {
            ...prev,
            messages: [...prev.messages, {
                ...data,
                dateCreation: new Date().toISOString()
            }]
        } : null);
    }

    // Faire défiler vers le bas quand de nouveaux messages arrivent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (currentRoom && currentRoom.messages.length > 0) {
            scrollToBottom();
        }
    }, [currentRoom?.messages]);

    useEffect(() => {
        // Ne pas initialiser si currentUser n'est pas encore chargé
        if (!currentUser) {
            setMessage('En attente de l\'utilisateur...');
            return;
        }

        console.log('initialisation socket avec user:', currentUser);
        setMessage('Connexion au serveur...');

        // Connecter et initialiser
        socketManager.connect();
        socketManager.init(currentUser);
        setIsConnected(true);
        
        //Ecouteurs
        socketManager.on(
            'authenticated',
            (data: {
                success: boolean,
                message: string
            }) => {
                console.log('Event authenticated reçu:', data);
                socketManager.onAuthenticated(
                    data,
                    handleAuth
                )
            }
        );

        
        socketManager.on(
            'rooms_list',
            (data: {
                id: number;
                name: string;
                userCount: number
            }[]) => {
                console.log('Event list_rooms reçu:', data);
                socketManager.onRefreshRoom(
                    data,
                    console.log
                )
            }
        )

        socketManager.on(
            'room_created',
            (data) =>{ 
                socketManager.onRoomCreated(data, console.log)
            }
        )

        socketManager.on(
            'room_joined',
            function(data){
                socketManager.onJoinedRoom(data, renderRoom)
            }
        )

        socketManager.on(
            'user_joined',
            function(data){
                console.log("User joined : ", data);
                socketManager.onUserJoined(data, console.log)
            }
        )

        socketManager.on(
            'new_message',
            (data) => {
                socketManager.onNewMessage(data, renderNewMessage)
            }
        )

        socketManager.on(
            'message_deleted',
            (data) => {
                console.log('Event message_deleted reçu:', data);
                socketManager.onDeleteMessage(data, console.log)
            }
        )
        // Événement de connexion
        socketManager.on('connect', () => {
            console.log('Socket connecté');
            setMessage('Connecté, authentification...');
        });

        // Événement de déconnexion
        socketManager.on('disconnect', () => {
            console.log('Socket déconnecté');
            setMessage('Déconnecté');
            setIsConnected(false);
        });

        return () => {
            console.log('Nettoyage ChatLayout');
            // Nettoyer les événements pour éviter les doublons
            socketManager.removeAllListeners();
            
            if (isConnected) {
                socketManager.leaveRoom();
                socketManager.disconnect();
                setIsConnected(false);
            }
        };
    }, [currentUser]); // Ajouter currentUser comme dépendance

    const renderRoom = (data: {
        roomId: number;
        name: string;
        users: {
            _id: string;
            nom: string;
            post_nom: string;
            prenom: string;
            sexe: string;
            photo: string;
            matricule: string;
        }[],
        messages: Message[]
    }) => {
        console.log("Room : ", data);
        setCurrentRoom(data);
        setMessage("Chat prêt");
    }

    const getUserInfo = (senderId: string) => {
        if (!currentRoom) return null;
        return currentRoom.users.find(user => user._id === senderId);
    };

    const isMyMessage = (senderId: string) => {
        return senderId === currentUser?._id;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSendMessage = () => {
        console.log("Send message : ", newMessage);
        console.log("User : ", currentUser);

        if ((newMessage.trim() || attachments.length > 0) && currentUser) {
            handleSubmitMessage({
                message: newMessage.trim() || '',
                pieces: attachments,
                concerne: 'DRH'
            });
            setNewMessage('');
            setAttachments([]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleAttachmentsSelected = (newAttachments: string[]) => {
        setAttachments(prev => [...prev, ...newAttachments]);
        setShowAttachmentModal(false);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const getFileNameFromUrl = (url: string) => {
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Fichier';
    };

    const isImageUrl = (url: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    return (
        <>
            {/* Bouton Chat flottant */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {currentRoom && currentRoom.users.length > 1 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            {currentRoom.users.length - 1}
                        </span>
                    )}
                </button>
            )}

            {/* Interface Chat */}
            {isChatOpen && (
                <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl w-96 h-[500px] flex flex-col z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                DRH
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-800 dark:text-white">Chat DRH</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {currentRoom ? `${currentRoom.users.length} utilisateur${currentRoom.users.length > 1 ? 's' : ''}` : message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentRoom && currentRoom.messages.length > 0 ? (
                            currentRoom.messages.map((msg, index) => {
                                const userInfo = getUserInfo(msg.senderId);
                                const isMine = isMyMessage(msg.senderId);
                                
                                return (
                                    <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            isMine 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                                        }`}>
                                            {!isMine && userInfo && (
                                                <div className="flex items-center space-x-2 mb-1">
                                                    {userInfo.photo ? (
                                                        <img src={userInfo.photo} alt="" className="w-6 h-6 rounded-full" />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white">
                                                            {userInfo.nom?.charAt(0)}{userInfo.prenom?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-semibold">
                                                        {userInfo.nom} {userInfo.prenom}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Message texte */}
                                            {msg.message && (
                                                <p className="text-sm">{msg.message}</p>
                                            )}
                                            
                                            {/* Pièces jointes */}
                                            {msg.pieces && msg.pieces.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.pieces.map((piece, pieceIndex) => (
                                                        <div key={pieceIndex}>
                                                            {isImageUrl(piece) ? (
                                                                <div className="relative">
                                                                    <img
                                                                        src={piece}
                                                                        alt="Image"
                                                                        className="max-w-xs max-h-64 rounded-lg cursor-pointer shadow-sm"
                                                                        onClick={() => window.open(piece, '_blank')}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                                                                        <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={piece}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`inline-flex items-center space-x-2 p-3 rounded-lg border max-w-xs ${
                                                                        isMine 
                                                                            ? 'bg-blue-500 border-blue-400 text-white' 
                                                                            : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-white'
                                                                    } hover:shadow-md transition-all duration-200`}
                                                                >
                                                                    <div className={`p-2 rounded ${isMine ? 'bg-blue-400' : 'bg-gray-100 dark:bg-gray-500'}`}>
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">
                                                                            {getFileNameFromUrl(piece)}
                                                                        </p>
                                                                        <p className={`text-xs ${isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                            Cliquez pour ouvrir
                                                                        </p>
                                                                    </div>
                                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {formatTime(msg.createdAt ? msg.createdAt : msg.dateCreation)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                                {currentRoom ? 'Aucun message pour le moment' : 'Connexion en cours...'}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {currentRoom && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            {/* Aperçu des pièces jointes */}
                            {attachments.length > 0 && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {attachments.length} pièce{attachments.length > 1 ? 's' : ''} jointe{attachments.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((attachment, index) => (
                                            <div key={index} className="relative group">
                                                {isImageUrl(attachment) ? (
                                                    <img
                                                        src={attachment}
                                                        alt="Preview"
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded border flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => removeAttachment(index)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowAttachmentModal(true)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        title="Ajouter des pièces jointes"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Tapez votre message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() && attachments.length === 0}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal des pièces jointes */}
            <AttachmentModal
                isOpen={showAttachmentModal}
                onClose={() => setShowAttachmentModal(false)}
                onAttachmentsSelected={handleAttachmentsSelected}
                userId={currentUser?._id}
            />
        </>
    );
}