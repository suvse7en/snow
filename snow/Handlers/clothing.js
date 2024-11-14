const db = require('../db');

class Clothing {
    constructor(client) {
        this.client = client;
        this.inventory = client.inventory;

        this.colour = client.data.colour || 0;
        this.head = client.data.head || 0;
        this.face = client.data.face || 0;
        this.neck = client.data.neck || 0;
        this.body = client.data.body || 0;
        this.hands = client.data.hands || 0;
        this.feet = client.data.feet || 0;
        this.pin = client.data.pin || 0;
        this.photo = client.data.photo || 0;

    }

    async updateClientItem(itemType, itemId) {
        itemId = Number(itemId);
        
        if (isNaN(itemId)) {
            throw new Error(`Item id ${itemId} is not a number!`);
        }
    
        const validTypes = ['head', 'face', 'neck', 'body', 'hands', 'feet', 'photo', 'pin', 'colour'];
        if (!validTypes.includes(itemType)) {
            this.client.sendXtMessage('e', [402]);
            return;
        }

        // Check if player owns the item (except for default items and colors)
        if (itemId > 0 && itemType !== 'colour' && !this.inventory.hasItem(itemId)) {
            this.client.sendXtMessage('e', [402]);
            return;
        }
    
        try {
            // Update client data
            this.client.data[itemType] = itemId;
    
            // Update database
            await db.query(
                `UPDATE ps_users SET ${itemType} = ? WHERE id = ?`,
                [itemId, this.client.data.id]
            );
    
            // If in a room, announce update
            if (this.client.room) {
                this.client.room.sendXtMessage('up', [
                    this.client.data.id,
                    itemType,
                    itemId
                ]);
            }
        } catch (error) {
            console.error('Error updating clothing:', error);
            this.client.sendXtMessage('e', [500]);
            throw error;
        }
    }
}

module.exports = Clothing;