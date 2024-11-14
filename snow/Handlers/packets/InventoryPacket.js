// handlers/packets/InventoryPacket.js
const XTPacket = require('./XTPacket');

class InventoryPacket extends XTPacket {
    async handle() {
        const packet = this.params[3];
        
        switch(packet) {
            case 'i#gi':
                const items = this.client.inventory.getItems();
                const formattedItems = items.join('%');
                this.client.sendXtMessage('gi', [formattedItems]);
                break;
                
            case 'i#ai':  // Add item
                const itemId = Number(this.params[5]);
                this.handleAddItem(itemId);
                break;
                
            case 'i#uic': // Update item/clothing
                const itemType = this.params[5];
                const updateItemId = Number(this.params[6]);
                this.handleUpdateItem(itemType, updateItemId);
                break;
                
        }
    }

    async handleAddItem(itemId) {
        await this.client.inventory.addItem(itemId);
    }

    async handleUpdateItem(itemType, itemId) {
        try {
            await this.client.inventory.updateClientItem(itemType, itemId);
        } catch (error) {
            console.error('Error updating item:', error);
            this.sendToClient('e', [402]);
        }
    }
}

module.exports = InventoryPacket;