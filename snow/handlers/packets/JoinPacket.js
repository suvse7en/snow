const Room = require('../Room');
const XTPacket = require('./XTPacket');

class JoinPacket extends XTPacket {

    constructor(params, client, gameHandler) {
        super(params, client, gameHandler);
    }

    handle() {
        const packet = this.params[3];
        switch(packet) {
            case "j#js": {
                console.log(this.client.data.rank >= 3 ? 1 : 0);
                this.sendToClient('js', [1, 0, this.client.data.rank >= 3 ? 1 : 0]);
                this.sendToClient('lp', [this.client.getPlayerString(), this.client.data.coins, 0, 1440, 1200000000000, 1, 4, 1, " ", 7]);
                this.client.joinRoom(100, this.gameHandler.getRooms());
                break;
            }
            case "j#jr": {
                console.log(this.client.getPlayerString());
                const roomId = this.params[5];
                const x = this.params[6];
                const y = this.params[7];
                this.client.joinRoom(roomId, x, y);
                break;
            }

            case "j#jp": {
                
                const roomId = parseInt(this.params[5]);
                const roomType = parseInt(this.params[6]) ?? '';
                const x = 330; // Default x position
                const y = 300; // Default y position

                const playerId = roomId - 1000;
                
                // Create the room if it doesn't exist
                if (!this.gameHandler.getRoom(roomId)) {
                    this.gameHandler.createIglooRoom(roomId);
                }

                console.log(this.gameHandler.getRoom(roomId));
                
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