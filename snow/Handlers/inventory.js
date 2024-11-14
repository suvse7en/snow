const db = require('../db');
const crumbs = require('../data/crumbs');

class Inventory {
    constructor(client) {
        this.client = client;
        this.client = client;
        
        try {
            // If items is null/undefined, use empty array
            if (!client.data.items) {
                console.log('No items data found, initializing empty inventory');
                this.items = new Set();
                return;
            }

            // Split items string and convert to numbers
            const itemArray = client.data.items
                .split(',')
                .map(Number)
                .filter(id => !isNaN(id) && id > 0);  // Only keep valid item IDs
                
            console.log('Parsed item array:', itemArray);
            
            // Create Set from parsed array
            this.items = new Set(itemArray);
            
            console.log('Initialized inventory with items:', Array.from(this.items));
        } catch (error) {
            console.error('Error initializing inventory:', error);
            this.items = new Set();  // Fallback to empty inventory
        }
    }

    async addItem(itemId) {
        itemId = Number(itemId);

        if (!crumbs[itemId]) {
            this.client.sendXtMessage('e', [402]);
            return false;
        }

        if (this.items.has(itemId)) {
            this.client.sendXtMessage('e', [400]);
            return false;
        }

        if (this.client.data.coins < crumbs[itemId].cost) {
            this.client.sendXtMessage('e', [401]);
            return false;
        }

        try {
            // Update coins
            this.client.data.coins -= crumbs[itemId].cost;
            
            // Add item
            this.items.add(itemId);
            this.client.data.items = Array.from(this.items).join(',');

            // Update database
            await db.query(
                'UPDATE ps_users SET items = ?, coins = ? WHERE id = ?',
                [this.client.data.items, this.client.data.coins, this.client.data.id]
            );

            // Send success message
            this.client.sendXtMessage('ai', [itemId, this.client.data.coins]);
            return true;
        } catch (error) {
            console.error('Error adding item:', error);
            this.client.sendXtMessage('e', [500]);
            return false;
        }
    }

    hasItem(itemId) {
        return this.items.has(Number(itemId));
    }

    getItems() {
        return Array.from(this.items);
    }

}

module.exports = Inventory;