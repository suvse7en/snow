const XTPacket = require('./XTPacket');

class ClothingPacket extends XTPacket {
    static ITEM_TYPES = {
        'uph': 'head',
        'upf': 'face',
        'upn': 'neck',
        'upb': 'body',
        'upa': 'hands',
        'upe': 'feet',
        'upp': 'photo',
        'upl': 'pin',
        'upc': 'colour'
    };

    async handle() {
        const packet = this.params[3];
        
        if (packet.startsWith('s#up')) {
            try {
                const itemId = Number(this.params[5]);
                const itemType = ClothingPacket.ITEM_TYPES[packet.slice(2)];
                
                if (itemType) {
                    await this.client.clothing.updateClientItem(itemType, itemId);
                    this.sendToRoom(packet.slice(2), [this.client.data.id, itemId]);
                } else {
                    this.sendToClient('e', [402]);
                }
            } catch (error) {
                console.error('Error updating clothing:', error);
                this.sendToClient('e', [500]);
            }
        }
    }
}

module.exports = ClothingPacket;