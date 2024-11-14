const Room = require('../../room');
const XTPacket = require('./XTPacket');

class JoinPacket extends XTPacket {

    constructor(params, client, rooms) {
        super(params, client);
        this.rooms = rooms;
    }

    handle() {
        const packet = this.params[3];
        switch(packet) {
            case "j#js":
                this.sendToClient('js', [1, 0, this.client.data.rank >= 3 ? 1 : 0]);
                this.sendToClient('lp', [this.client.getPlayerString(), this.client.data.coins, 0, 1440, 1200000000000, 1, 4, 1, " ", 7]);
                this.client.joinRoom(100, this.rooms);
                break;
                
            case "j#jr":
                const roomId = this.params[5];
                const x = this.params[6];
                const y = this.params[7];
                this.client.joinRoom(roomId, this.rooms, x, y);
                break;
        }
    }
}

module.exports = JoinPacket;