const db = require('../../db');

class BuddyManager {
    #buddyRequests = [];
    #buddies = [];
    #gameInstance;

    constructor(client, gameHandler) {
        this.client = client;
        this.buddies = new Set();
        this.#gameInstance = gameHandler;
        // Add debug log
        console.log("Game handler in BuddyManager:", gameHandler);
    }

    async getBuddies(client) {
        let buddyString = "";

        // If no buddies or empty buddy string, return just %
        if (!client.data.buddies || client.data.buddies === '') {
            return "%";
        }

        // Split the buddy string by commas and remove empty entries
        const buddyIds = client.data.buddies.split(',').filter(id => id !== '');

        for (const buddyId of buddyIds) {
            try {
                const buddyInfo = await db.returnArray('SELECT username FROM ps_users WHERE id = ?', [buddyId]);

                if (buddyInfo && buddyInfo[0]) {
                    const buddyName = buddyInfo[0].username;
                    const isOnline = this.#gameInstance.isUserOnline(Number(buddyId));
                    
                    // Format: buddyId|buddyName|isOnline
                    buddyString += `${buddyId}|${buddyName}|${isOnline ? '1' : '0'}%`;
                }
            } catch (error) {
                console.error(`Error getting buddy info for ID ${buddyId}:`, error);
            }
        }

        return buddyString || "%";
    }


    addRequest(client) {
        if(this.#buddyRequests.includes(client.data.id))
            return;

        this.#buddyRequests.push(client.data.id);
    }

    getHasRequest(client) {
        return this.#buddyRequests.includes(client.data.id);
    }

    
    
    async acceptBuddy(sClientId, isUserOnline, targetClient) {

        if (!isUserOnline(sClientId)) {
            this.client.sendError(5);
            return;
        }

        // Check if buddy request exists
        if (!this.#buddyRequests.includes(sClientId)) {
            this.client.sendError(5);
            return;
        }
        
        // Add to both players' buddy lists with comma at the end
        this.#buddies.push(sClientId);
        this.client.data.buddies = this.#buddies.join(',') + ',';
        
        // Remove the buddy request
        this.#buddyRequests = this.#buddyRequests.filter(id => id !== sClientId);

        // Update database for requester
        await db.query('UPDATE `ps_users` SET `buddies` = ? WHERE `id` = ?', 
            [this.client.data.buddies, this.client.data.id]);
            
        // Update the target client if they're online
        if (targetClient) {
            targetClient.buddyList.#buddies.push(this.client.data.id);
            targetClient.data.buddies = targetClient.buddyList.#buddies.join(',') + ',';
            
            await db.query('UPDATE `ps_users` SET `buddies` = ? WHERE `id` = ?', 
                [targetClient.data.buddies, targetClient.data.id]);
                
            // Send notification packet to the other player
            targetClient.sendXtMessage('ba', [this.client.data.id, this.client.data.username]);
        }
    }

}
module.exports = BuddyManager;