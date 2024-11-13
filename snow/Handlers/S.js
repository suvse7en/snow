const Room = require('../room');
const roomsInfo = require('../data/rooms');

class GameManager {
    #rooms = new Map();
    #clients = new Map();

    constructor() {
        this.setupRooms();
    }

    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    setupRooms() {
        for(let [roomId, info] of Object.entries(roomsInfo)) {
            this.#rooms.set(Number(roomId), new Room({
                id: roomId,
                name: info.name,
                game: info.game
            }));
        }
    }

    getRoom(roomId) {
        return this.#rooms.get(Number(roomId));
    }

    addClient(client) {
        this.#clients.set(client.data.id, client);
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
}

module.exports = GameManager;