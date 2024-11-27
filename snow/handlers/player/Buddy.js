const db = require('../../db');

class BuddyManager {
    #buddyRequests = [];
    #buddies = [];

    constructor(client) {
        this.client = client;
        this.buddies = new Set();
    }

    async getBuddies(client){
        let buddyString = "";

        if(!client.buddies ||client.buddies.length === 0){
            return "%";
        }

        for(buddyId in client.buddies){
            try {
                // Using your returnArray function to get buddy info
                const buddyInfo = await db.returnArray('SELECT username FROM ps_users WHERE id = ?',[buddyId]);
    
                if (buddyInfo && buddyInfo[0]) {
                    const buddyName = buddyInfo[0].username;
                    
                    // Check if buddy is online
                    const isOnline = isUserOnline(buddyId);
                    
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

    addBuddy(client) {
        if(this.#buddies.includes(client.data.id))
            return;

        this.#buddies.push(client.data.id);
        this.client.data.buddies = this.#buddies.join(',');

        db.query('UPDATE `ps_users` SET `buddies` = ? WHERE `id` = ?', [this.client.data.buddies, this.client.data.id]);
        
    }

}
module.exports = BuddyManager;