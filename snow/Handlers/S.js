// managers/InventoryManager.js
const db = require('../db');
const crumbs = require('../data/crumbs');

class InventoryManager {
    constructor(client) {
        this.client = client;
        // Initialize items from client's data
        this.items = new Set(
            client.data.items ? 
            client.data.items.split(',').map(Number) : 
            []
        );
    }

    // Add an item to inventory
    async addItem(itemId) {
        itemId = Number(itemId);

        if (!crumbs[itemId]) {
            this.client.sendError(402); // Invalid item
            return false;
        }

        if (this.items.has(itemId)) {
            this.client.sendError(400); // Already has item
            return false;
        }

        if (this.client.data.coins < crumbs[itemId].cost) {
            this.client.sendError(401); // Not enough coins
            return false;
        }

        try {
            // Update coins
            this.client.data.coins -= crumbs[itemId].cost;
            
            // Add item
            this.items.add(itemId);
            
            // Update database
            await db.query(
                'UPDATE ps_users SET items = ?, coins = ? WHERE id = ?',
                [Array.from(this.items).join(','), this.client.data.coins, this.client.data.id]
            );

            // Notify client
            this.client.sendXtMessage('ai', [itemId, this.client.data.coins]);
            return true;
        } catch (error) {
            console.error('Error adding item:', error);
            this.client.sendError(500);
            return false;
        }
    }

    // Check if client has an item
    hasItem(itemId) {
        return this.items.has(Number(itemId));
    }

    // Get all items
    getItems() {
        return Array.from(this.items);
    }

    // Update equipped item
    async updateEquippedItem(itemType, itemId) {
        itemId = Number(itemId);

        if (isNaN(itemId)) {
            throw new Error(`Item id ${itemId} is not a number!`);
        }

        // Validate item type
        const validTypes = ['head', 'face', 'neck', 'body', 'hands', 'feet'];
        if (!validTypes.includes(itemType)) {
            this.client.sendError(402);
            return false;
        }

        // Check if player owns item (except for default items)
        if (itemId > 0 && !this.hasItem(itemId)) {
            this.client.sendError(402);
            return false;
        }

        try {
            // Update database
            await db.query(
                `UPDATE ps_users SET ${itemType} = ? WHERE id = ?`,
                [itemId, this.client.data.id]
            );

            // Update client data
            this.client.data[itemType] = itemId;

            // If in a room, update appearance
            if (this.client.room) {
                this.client.room.sendXtMessage('up', [
                    this.client.data.id,
                    itemType,
                    itemId
                ]);
            }

            return true;
        } catch (error) {
            console.error('Error updating equipped item:', error);
            this.client.sendError(500);
            return false;
        }
    }

    // Remove an item (if needed)
    async removeItem(itemId) {
        itemId = Number(itemId);

        if (!this.items.has(itemId)) {
            return false;
        }

        try {
            this.items.delete(itemId);
            
            await db.query(
                'UPDATE ps_users SET items = ? WHERE id = ?',
                [Array.from(this.items).join(','), this.client.data.id]
            );

            this.client.sendXtMessage('ri', [itemId]);
            return true;
        } catch (error) {
            console.error('Error removing item:', error);
            this.client.sendError(500);
            return false;
        }
    }
}

module.exports = InventoryManager;