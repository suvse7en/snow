class BuddyManager {
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

}
module.exports = BuddyManager;