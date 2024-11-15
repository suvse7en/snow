class BuddyManager {
    constructor(client) {
        this.client = client;
        this.buddies = new Set();
    }

}
module.exports = BuddyManager;