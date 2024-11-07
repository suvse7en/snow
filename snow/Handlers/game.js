const db = require('../db'); 

const Room = require('../room');
const roomsInfo = require('../data/rooms');
const Client = require('../client');
const { param } = require('express/lib/request');
class Game {

    rooms = {};
  
    constructor() {
        this.setupRooms();
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

    handleDisconnect(socket) {
        const client = socket.client;

        client.leaveRoom();
    }

    handleXTMessage(message, socket) {
	
	    const params = message.split("%");
        
	    const client = socket.client;

	    const header = params[3]; 
        
        switch(header) {
            case "j#js": {
                client.sendXtMessage('js', [1, 0, client.data.rank >= 3 ? 1 : 0]);
                client.sendXtMessage('lp', [client.getPlayerString(), client.data.coins, 0, 1440, 1200000000000, 1, 4, 1, " ", 7]);
                client.joinRoom(100, this.rooms);
                break;
            }
            case "u#sp": {
                const x = params[5];
                const y = params[6];

                client.x = x;
                client.y = y;

                client.room.sendXtMessage('sp', [client.data.id, x, y]);
                break;
            }
            case "u#sf": {
                const frame = params[5];

                client.frame = frame;

                client.room.sendXtMessage('sf', [client.data.id, frame]);
                break;
            }
            case "u#sa": {
                const frame = params[5];

                client.room.sendXtMessage('sa', [client.data.id, frame])
                break;
            }
            case "m#sm": {
                const message = params[6];

                client.room.sendXtMessage('sm', [client.data.id, message])
                break;
            }
            case "u#h": {
                client.sendXtMessage('h', [])
                break;
            }
            case "u#sb": {
                const x = params[5];
                const y = params[6];

                client.x = x;
                client.y = y;

                client.room.sendXtMessage('sb', [client.data.id, x, y]);
                break;
            }
            case "u#se": {
                const emote = params[5];

                client.room.sendXtMessage('se', [client.data.id, emote]);
                break;
            }
            case "u#ss": {
                const message = params[5];

                client.room.sendXtMessage('ss', [client.data.id, message]);
                break;
            }
            case "j#jr": {
                const roomId = params[5];
                const x = params[6];
                const y = params[7];

                client.joinRoom(roomId, this.rooms, x, y);
                break;
            }
            case "i#ai": {
                const itemId = params[5];
                
                !isNaN(itemId) && client.addItem(itemId);
                break;

            }
            case "i#gi": {
                const items = client.getItems();
                const formattedItems = Array.isArray(items) ? items.join("%") : "";

                client.sendXtMessage('gi', [formattedItems]);
                break;
            }
        }
    }
}

module.exports = Game;

