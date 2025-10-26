import { Personnel } from "@/types/personnel";
import { io, Socket } from "socket.io-client";
const ServerUrl = "https://server-esursi.he-section.site";

export interface Message {
    _id: string; // Changé de number à string pour MongoDB ObjectId
    senderId: string;
    concerne: string;
    message: string;
    pieces: string[];
    status: "PENDING" | "READ" | "REJECTED";
    dateCreation: string;
    createdAt?: string; // Optionnel car peut ne pas être présent
}

class SocketManager {
    private serverUrl: string;
    private socket: Socket;
    private user: Personnel | null;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
        // Ne pas se connecter automatiquement
        this.socket = io(this.serverUrl, { 
            autoConnect: false,
            transports: ['websocket', 'polling']
        });
        this.user = null;
        
        // Ajouter des logs pour le debug
        this.socket.on('connect', () => {
            console.log('Socket.IO connecté au serveur');
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO déconnecté:', reason);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Erreur de connexion Socket.IO:', error);
        });
    }

    init(user: Personnel) {
        this.user = user;
        console.log('SocketManager init avec user:', user);

        // Attendre que la connexion soit établie avant d'authentifier
        if (this.socket.connected) {
            console.log('Socket déjà connecté, authentification immédiate');
            this.authenticated();
        } else {
            console.log('Socket pas encore connecté, attente...');
            this.socket.once('connect', () => {
                console.log('Socket connecté, envoi authentification');
                this.authenticated();
            });
        }
    }

    connect() {
        if (!this.socket.connected) {
            console.log('Connexion du socket...');
            this.socket.connect();
        }
    }

    on(event: string, callback: (any) => void) {
        this.socket.on(event, callback);
    }

    off(event: string) {
        this.socket.off(event);
    }

    removeAllListeners() {
        this.socket.off('authenticated');
        this.socket.off('connect');
        this.socket.off('disconnect');
        this.socket.off('rooms_list');
        this.socket.off('room_created');
        this.socket.off('room_joined');
        this.socket.off('user_joined');
        this.socket.off('new_message');
        this.socket.off('message_deleted');
    }

    isConnected() {
        return this.socket.connected;
    }

    disconnect() {
        this.socket.disconnect();
    }

    private authenticated() {
        const authData = {
            username: this.user?.nomComplet, 
            userId: this.user?.matricule
        };
        console.log('Envoi authentification:', authData);
        this.socket.emit("authenticate", authData);
    }

    refreshRoom() {
        this.socket.emit("list_rooms");
    }

    newMessage(data: {
        message: string;
        pieces: string[];
        concerne: string;
    }) {
        console.log('Envoi message:', data);
        this.socket.emit("send_message", data);
    }

    deleteMessage(data: {
        roomId: string; // Changé de number à string
        messageId: string; // Changé de number à string
    }) {
        console.log('Envoi delete message:', data);
        this.socket.emit("delete_message", data);
    }

    leaveRoom(){
        console.log('Envoi leave room');
        this.socket.emit('leave_room');
    }

    onAuthenticated(data: {
        success: boolean,
        message: string
    }, callback: (any) => void) {
        if(data.success) {
            this.refreshRoom();
        }

        callback(data);
    }

    onRefreshRoom(data: {
        id: string; // Changé de number à string car MongoDB utilise des ObjectId
        name: string;
        userCount: number
    }[], callback: (any) => void) {

        if(!data.length){
            // Créer une room avec le matricule de l'utilisateur (comme attendu par le backend)
            this.socket.emit("create_room", {name: `DRH-${this.user?.matricule}`, userId: this.user?.matricule});
            
            callback(data);
        } else {
            const findRoom = data.find((room) => room.name === `DRH-${this.user?.matricule}`);
            console.log('Room found:', findRoom);
            if(!findRoom) {
                this.socket.emit("create_room", {name: `DRH-${this.user?.matricule}`, userId: this.user?.matricule});
                
                callback(data);
            } else {
                this.socket.emit("join_room", {roomId: findRoom.id});
                
                callback(data);
            }
        }
    }

    onRoomCreated(data: {
        roomId: string; // Changé de number à string
        name: string;
        users: string[]
    }, callback: (any) => void) {
        // Après création de room, rejoindre automatiquement
        this.socket.emit("join_room", {roomId: data.roomId});
        callback(data);
    }

    onJoinedRoom(data: {
        roomId: string; // Changé de number à string
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
    }, callback: (any) => void) {
        callback(data);
    }

    onUserJoined(data : {
        username: string;
        message: string
    }, callback: (any) => void) {
        callback(data);
    }

    onNewMessage(data : Message, callback: (any) => void) {
        callback(data);
    }

    onDeleteMessage(data : Message, callback: (any) => void){
        callback(data);
    }

    onRoomLeft(data : {
        message : string
    }, callback: (any) => void){
        callback(data);
    }
}

export default  new SocketManager(ServerUrl);
