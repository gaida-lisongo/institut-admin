import { useCallback, useEffect, useRef } from 'react';
import SocketManager, { Message } from "@/services/SocketManager";
import { Personnel } from "@/types/personnel";

interface UseSocketProps {
    user: Personnel | null;
    onAuth: (data: any) => void;
    onRoomJoined: (data: any) => void;
    onNewMessage: (data: Message) => void;
    onDeleteMessage: (data: Message) => void;
}

export const useSocket = ({
    user,
    onAuth,
    onRoomJoined,
    onNewMessage,
    onDeleteMessage
}: UseSocketProps) => {
    const isInitializedRef = useRef(false);
    const socketManager = SocketManager;

    // Mémoriser les callbacks stables
    const stableOnAuth = useCallback(onAuth, []);
    const stableOnRoomJoined = useCallback(onRoomJoined, []);
    const stableOnNewMessage = useCallback(onNewMessage, []);
    const stableOnDeleteMessage = useCallback(onDeleteMessage, []);

    const initializeSocket = useCallback(() => {
        if (!user || isInitializedRef.current) return;

        console.log('Initialisation socket avec user:', user);
        isInitializedRef.current = true;

        // Connecter et initialiser
        socketManager.connect();
        socketManager.init(user);

        // Configuration des event listeners une seule fois
        socketManager.on('authenticated', (data: { success: boolean, message: string }) => {
            console.log('Event authenticated reçu:', data);
            socketManager.onAuthenticated(data, stableOnAuth);
        });

        socketManager.on('rooms_list', (data: { id: number; name: string; userCount: number }[]) => {
            console.log('Event list_rooms reçu:', data);
            socketManager.onRefreshRoom(data, console.log);
        });

        socketManager.on('room_created', (data) => {
            socketManager.onRoomCreated(data, console.log);
        });

        socketManager.on('room_joined', (data) => {
            socketManager.onJoinedRoom(data, stableOnRoomJoined);
        });

        socketManager.on('user_joined', (data) => {
            console.log("User joined : ", data);
            socketManager.onUserJoined(data, console.log);
        });

        socketManager.on('new_message', (data) => {
            socketManager.onNewMessage(data, stableOnNewMessage);
        });

        socketManager.on('message_deleted', (data) => {
            console.log('Event message_deleted reçu:', data);
            socketManager.onDeleteMessage(data, stableOnDeleteMessage);
        });

        socketManager.on('room_left', (data) => {
            console.log('Event leave_room reçu:', data);
            socketManager.onRoomLeft(data, console.log);
        });

        socketManager.on('connect', () => {
            console.log('Socket connecté');
        });

        socketManager.on('disconnect', () => {
            console.log('Socket déconnecté');
        });

    }, [user, stableOnAuth, stableOnRoomJoined, stableOnNewMessage, stableOnDeleteMessage]);

    const cleanup = useCallback(() => {
        console.log('Nettoyage socket');
        socketManager.leaveRoom();
        socketManager.disconnect();
        socketManager.removeAllListeners();
        isInitializedRef.current = false;
    }, []);

    useEffect(() => {
        if (user) {
            initializeSocket();
        }

        return cleanup;
    }, [user, initializeSocket, cleanup]);

    return {
        socketManager,
        isInitialized: isInitializedRef.current
    };
};
