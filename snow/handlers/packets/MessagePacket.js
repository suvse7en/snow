const XTPacket = require('./XTPacket');

class MessagePacket extends XTPacket {
    handle() {
        const packet = this.params[3];
        if (packet === "m#sm") {
            const message = this.params[6];
            this.sendToRoom('sm', [this.client.data.id, message]);
        }
    }
}

module.exports = MessagePacket;