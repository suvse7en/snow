const XTPacket = require('./XTPacket');

class InventoryPacket extends XTPacket {
    handle() {
        const packet = this.params[3];
        switch(packet) {
            case "i#ai":
                const itemId = this.params[5];
                !isNaN(itemId) && this.client.addItem(itemId);
                break;
                
            case "i#gi":
                const items = this.client.items;
                const formattedItems = Array.isArray(items) ? items.join("%") : "";
                this.sendToClient('gi', [formattedItems]);
                break;
        }
    }
}

module.exports = InventoryPacket;