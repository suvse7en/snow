const db = require('../../db');

class Clothing {
    #client;
    #colour;
    #head;
    #face;
    #neck;
    #body;
    #hands;
    #feet;
    #pin;
    #photo;

    constructor(client) {
        this.#client = client;
        this.updateFromClientData(client.data);
    }

    updateFromClientData(data) {
        this.#colour = data.colour || 0;
        this.#head = data.head || 0;
        this.#face = data.face || 0;
        this.#neck = data.neck || 0;
        this.#body = data.body || 0;
        this.#hands = data.hands || 0;
        this.#feet = data.feet || 0;
        this.#pin = data.pin || 0;
        this.#photo = data.photo || 0;
    }

    // Getters for all clothing items
    get colour() { return this.#colour; }
    get head() { return this.#head; }
    get face() { return this.#face; }
    get neck() { return this.#neck; }
    get body() { return this.#body; }
    get hands() { return this.#hands; }
    get feet() { return this.#feet; }
    get pin() { return this.#pin; }
    get photo() { return this.#photo; }

    async updateClientItem(itemType, itemId) {
        itemId = Number(itemId);

        if (isNaN(itemId)) {
            throw new Error(`Item id ${itemId} is not a number!`);
        }

        const validTypes = ['head', 'face', 'neck', 'body', 'hands', 'feet', 'photo', 'pin', 'colour'];
        if (!validTypes.includes(itemType)) {
            this.#client.sendXtMessage('e', [402]);
            return;
        }

        // Check if player owns the item (except for default items and colors)
        if (itemId > 0 && itemType !== 'colour' && !this.#client.inventory.hasItem(itemId)) {
            this.#client.sendXtMessage('e', [402]);
            return;
        }

        try {
            // Update client data
            this.#client.data[itemType] = itemId;

            // Update the local clothing instance
            this[`#${itemType}`] = itemId;

            // Update database
            await db.query(
                `UPDATE ps_users SET ${itemType} = ? WHERE id = ?`,
                [itemId, this.#client.data.id]
            );

            // If in a room, announce update
            if (this.#client.room) {
                this.#client.room.sendXtMessage('up', [
                    this.#client.data.id,
                    itemType,
                    itemId
                ]);
            }
        } catch (error) {
            console.error('Error updating clothing:', error);
            this.#client.sendXtMessage('e', [500]);
            throw error;
        }
    }
}

module.exports = Clothing;

module.exports = Clothing;