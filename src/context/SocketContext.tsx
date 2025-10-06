'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnectAttempts: 0,
  emit: () => {},
  on: () => {},
  off: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;
    
    // URL du serveur Socket.IO (à adapter selon votre configuration)
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://server-interro.he-section.site';

    // Créer la connexion Socket.IO avec configuration optimisée
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: false, // Réutiliser la connexion existante si possible
      reconnection: true,
      reconnectionAttempts: Infinity, // Tentatives infinies
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      autoConnect: true,
      upgrade: true,
      rememberUpgrade: true, // Se souvenir du transport le plus efficace
    });

    // Événements de connexion améliorés
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      setIsReconnecting(false);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Le serveur a forcé la déconnexion, reconnexion manuelle nécessaire
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      setIsReconnecting(true);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      setIsReconnecting(false);
      
      // Émettre un événement personnalisé pour notifier la reconnexion
      setTimeout(() => {
        socketInstance.emit('client_reconnected', {
          timestamp: new Date().toISOString(),
          previousAttempts: attemptNumber
        });
      }, 100);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Erreur de reconnexion Socket.IO:', error);
      setConnectionError(error.message);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Échec de toutes les tentatives de reconnexion');
      setConnectionError('Impossible de se reconnecter au serveur');
      setIsReconnecting(false);
    });

    // Événements personnalisés pour les épreuves
    socketInstance.on('epreuve:started', (data) => {
      console.log('🎯 Épreuve démarrée:', data);
    });

    socketInstance.on('epreuve:time_warning', (data) => {
      console.log('⏰ Avertissement temps:', data);
    });

    socketInstance.on('epreuve:force_submit', (data) => {
      console.log('⏱️ Soumission forcée:', data);
    });

    socketInstance.on('epreuve:updated', (data) => {
      console.log('📝 Épreuve mise à jour:', data);
    });

    setSocket(socketInstance);

    // Nettoyage à la déconnexion
    return () => {
      console.log('🧹 Nettoyage Socket.IO');
      socketInstance.disconnect();
    };
  }, []);

  // Fonctions helper pour simplifier l'utilisation
  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      console.log('📤 Émission événement:', event, data);
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Tentative d\'émission sans connexion:', event);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      console.log('👂 Écoute événement:', event);
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      console.log('🔇 Arrêt écoute événement:', event);
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
