const Room = require('./Room');
const roomsInfo = require('../data/rooms');
const JoinPacket = require('./packets/JoinPacket');
const UserPacket = require('./packets/UserPacket');
const MessagePacket = require('./packets/MessagePacket');
const InventoryPacket = require('./packets/InventoryPacket');
const ClothingPacket = require('./packets/ClothingPacket');
const BuddyPacket = require('./packets/BuddyPacket');
const IglooPacket = require('./packets/IglooPacket');
const PufflePacket = require('./packets/PufflePacket');
const EpfPacket = require('./packets/EpfPacket');

class Game {
    #rooms = new Map();
    #clients = new Map();
    #clientsByName = [];
    #packetHandlers; 

    constructor() {
        this.game = true;

        this.setUpRooms();
        // Initialize packet handlers in constructor
        this.#packetHandlers = {
            'j': (params, client) => new JoinPacket(params, client, this, this.#rooms),
            'u': (params, client) => new UserPacket(params, client, this),
            'm': (params, client) => new MessagePacket(params, client, this),
            'i': (params, client) => new InventoryPacket(params, client, this),
            's': (params, client) => new ClothingPacket(params, client, this),
            'b': (params, client) => new BuddyPacket(params, client, this, this.#clients),
            'g': (params, client) => new IglooPacket(params, client, this),
            'p': (params, client) => new PufflePacket(params, client, this),
            'f': (params, client) => new EpfPacket(params, client, this)
        };
    }

    setUpRooms() {
        for (let [roomId, info] of Object.entries(roomsInfo)) {
            this.#rooms.set(Number(roomId), new Room({
                id: roomId,
                name: info.name,
                game: info.game
            }));
        }
    }

    addPlayerByName(name){
        this.#clientsByName.push(name);
    }

    getRoom(roomId) {
        return this.#rooms.get(Number(roomId));
    }
    
    getRooms() {
        return this.#rooms;
    }

    addClient(client) {
        this.#clients.set(client.data.id, client);
        this.#clientsByName.push(client.data.name);
        console.log(this.#clientsByName);
    }

    removeClient(clientId) {
        this.#clients.delete(clientId);
    }

    getClient(clientId) {
        return this.#clients.get(clientId);
    }

    getTotalPlayers() {
        return Array.from(this.#clients.values());
    }

    isUserOnline(playerId) {
        return this.#clients.has(Number(playerId));
    }

    handleDisconnect(socket) {
        if (socket.client) {
            socket.client.leaveRoom();
            this.removeClient(socket.client.data.id);
        }
    }

    handleXTMessage(message, socket) {
        if (!socket.client) {
            return;
        }
        try {
            const params = message.split("%");
            const header = params[3];
            const category = header.split('#')[0];
            
            const createHandler = this.#packetHandlers[category];
            
            if (createHandler) {
                const handler = createHandler(params, socket.client);
                handler.handle();
            } 
        } catch (error) {
            console.error('Error handling XT message:', error);
        }
    }

    createIglooRoom(id) {
        this.#rooms.set(id, new Room({
            id: id,
            name: `Igloo ${id - 1000}`,
            game: false
        }));
    }
}

module.exports = Game;