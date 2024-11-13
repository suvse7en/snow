const db = require('../db'); 
const Room = require('../room');
const roomsInfo = require('../data/rooms');
const JoinPacket = require('./packets/JoinPacket');
const UserPacket = require('./packets/UserPacket');
const MessagePacket = require('./packets/MessagePacket');
const InventoryPacket = require('./packets/InventoryPacket');
const ClothingPacket = require('./packets/ClothingPacket');
const BuddyPacket = require('./packets/BuddyPacket');


class Game {
    constructor() {
        this.rooms = {};
        this.setupRooms();
        this.packetHandlers = {
            'j': (params, client) => new JoinPacket(params, client, this.rooms), 
            'u': (params, client) => new UserPacket(params, client),
            'm': (params, client) => new MessagePacket(params, client),
            'i': (params, client) => new InventoryPacket(params, client),
            's': (params, client) => new ClothingPacket(params, client),
            'b': (params, client) => new BuddyPacket(params, client)
        };
    }

    setupRooms() {
        for(let roomId in roomsInfo) {
            this.rooms[roomId] = new Room({
                id: roomId,
                name: roomsInfo[roomId].name,
                game: roomsInfo[roomId].game
            });
        }
    }

    getTotalPlayers() {
        const totalPlayers = [];

        for(let roomId in this.rooms){
            const room = this.rooms[roomId];
            totalPlayers.push(room.getClients()); 
        }
        return totalPlayers;
    }
    
    isUserOnline(playerId){
        var playersArray = this.getTotalPlayers();

        for(let playersInRoom in playersArray){

            for(player in playersInRoom){
                if(player == playerId){
                    return true;
                }
            }
    
        }

        return false;

        
    }
    handleDisconnect(socket) {
        socket.client.leaveRoom();
    }

    handleXTMessage(message, socket) {
        const params = message.split("%");
        const header = params[3];
        const category = header.split('#')[0];
        
        const createHandler = this.packetHandlers[category];  

        if (createHandler) {
            const handler = createHandler(params, socket.client);
            handler.handle();
        } else {
            console.log("This packet is not being handled yet: " + message);
            console.log(this.getTotalPlayers());
        }
    }
}

module.exports = Game;