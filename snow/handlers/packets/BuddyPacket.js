const XTPacket = require('./XTPacket');

class BuddyPacket extends XTPacket {
    async handle() {
        const packet = this.params[3];

        switch(packet){
            case "b#gb":
                const buddyString = await this.client.buddyList.getBuddies(this.client);
                this.sendToClient(packet.slice(2), [this.client.data.id, buddyString]);
                break;
        }
        
    }
}

module.exports = BuddyPacket;