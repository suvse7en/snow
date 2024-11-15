const db = require('../../db');
const crumbs = require('../../data/crumbs');

class Inventory {
    #client;
    #items;

    constructor(client) {
        this.#client = client;
        this.#initializeItems(client.data);
    }

    // Private method to initialize items
    #initializeItems(data) {
        try {
            if (!data.items) {
                console.log('No items data found, initializing empty inventory');
                this.#items = new Set();
                return;
            }

            const itemArray = data.items
                .split(',')
                .map(Number)
                .filter(id => !isNaN(id) && id > 0);
            
            this.#items = new Set(itemArray);
            
        } catch (error) {
            console.error('Error initializing inventory:', error);
            this.#items = new Set();
        }
    }

    // Getters
    get items() {
        return Array.from(this.#items);
    }

    get client() {
        return this.#client;
    }

    async addItem(itemId) {
        itemId = Number(itemId);

        if (!crumbs[itemId]) {
            this.#client.sendXtMessage('e', [402]);
            return false;
        }

        if (this.#items.has(itemId)) {
            this.#client.sendXtMessage('e', [400]);
            return false;
        }

        if (this.#client.data.coins < crumbs[itemId].cost) {
            this.#client.sendXtMessage('e', [401]);
            return false;
        }

        try {
            // Update coins
            this.#client.data.coins -= crumbs[itemId].cost;
            
            // Add item
            this.#items.add(itemId);
            this.#client.data.items = this.items.join(',');

            // Update database
            await db.query(
                'UPDATE ps_users SET items = ?, coins = ? WHERE id = ?',
                [this.#client.data.items, this.#client.data.coins, this.#client.data.id]
            );

            // Send success message
            this.#client.sendXtMessage('ai', [itemId, this.#client.data.coins]);
            return true;
        } catch (error) {
            console.error('Error adding item:', error);
            this.#client.sendXtMessage('e', [500]);
            return false;
        }
    }

    hasItem(itemId) {
        return this.#items.has(Number(itemId));
    }

    
    getInventoryArray() {
        return this.items; 
    }
}

module.exports = Inventory;