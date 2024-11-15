const XTPacket = require('./XTPacket');

class BuddyPacket extends XTPacket {
    handle() {
        const packet = this.params[3];
        if (packet === "b#gb") {
            this.sendToClient('gb', ["%"]);
        }
    }
}

module.exports = BuddyPacket;