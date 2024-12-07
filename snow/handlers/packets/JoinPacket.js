const Room = require('../Room');
const XTPacket = require('./XTPacket');

class JoinPacket extends XTPacket {

    constructor(params, client, gameHandler, rooms) {
        super(params, client, gameHandler);
        this.rooms = rooms;
    }

    handle() {
        const packet = this.params[3];
        switch(packet) {
            case "j#js":
                console.log(this.client.data.rank >= 3 ? 1 : 0);
                this.sendToClient('js', [1, 0, this.client.data.rank >= 3 ? 1 : 0]);
                this.sendToClient('lp', [this.client.getPlayerString(), this.client.data.coins, 0, 1440, 1200000000000, 1, 4, 1, " ", 7]);
                this.client.joinRoom(100, this.rooms);
                break;
                
            case "j#jr":
                console.log(this.client.getPlayerString());
                const roomId = this.params[5];
                const x = this.params[6];
                const y = this.params[7];
                this.client.joinRoom(roomId, x, y);
                break;
            case "j#jp": {
                const playerId = parseInt(this.params[4]);
                const roomId = playerId + 1000; // External ID calculation
                const roomType = this.params[5] || 0; // Adding roomType parameter
                const x = 330; // Default x position
                const y = 300; // Default y position
                
                // Create the room if it doesn't exist
                if (!this.rooms.get(roomId)) {
                    this.rooms.set(roomId, new Room({
                        id: roomId,
                        name: `igloo:${playerId}`,
                        game: false
                    }));
                }
                
                // Send join confirmation matching PHP packet structure
                this.sendToClient('jp', [playerId, playerId, roomId, roomType]);
                
                // Make them join the room
                this.client.joinRoom(roomId, x, y);
                break;
            }
        }
    }
}

module.exports = JoinPacket;