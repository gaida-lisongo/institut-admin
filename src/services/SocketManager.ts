import { Personnel } from "@/types/personnel";
import { io, Socket } from "socket.io-client";
const ServerUrl = "http://192.168.1.68:4000";

export interface Message {
    _id: number;
    senderId: string;
    concerne: string;
    message: string;
    pieces: string[];
    status: "PENDING" | "READ" | "REJECTED";
    dateCreation: string;
    createdAt: string;
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
        roomId: number;
        messageId: number;
    }) {
        console.log('Envoi delete message:', data);
        this.socket.emit("delete_message", data);
    }

    leaveRoom(){
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
        id: number;
        name: string;
        userCount: number
    }[], callback: (any) => void) {

        if(!data.length){
            this.socket.emit("create_room", {name: `DRH-${this.user?._id.toString()}`, userId: this.user?._id.toString()});
            
            callback(data);
        } else {
            const findRoom = data.find((room) => room.name === `DRH-${this.user?._id.toString()}`);
            console.log('Room found:', findRoom);
            if(!findRoom) {
                this.socket.emit("create_room", {name: `DRH-${this.user?._id.toString()}`, userId: this.user?._id.toString()});
                
                callback(data);
            } else {
                this.socket.emit("join_room", {roomId: findRoom.id});
                
                callback(data);
            }
        }
    }

    onRoomCreated(data: {
        roomId: number;
        name: string;
        users: string[]
    }, callback: (any) => void) {
        callback(data);
    }

    onJoinedRoom(data: {
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
