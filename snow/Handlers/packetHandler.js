// handlers/PacketHandler.js
class PacketHandler {
    constructor() {
        this.handlers = new Map([
            ['j', this.handleJoinRoom],
            ['u', this.handleUpdatePlayer],
            ['m', this.handleSendMessage],
            ['i', this.handleInventory],
            ['s', this.handleClothing],
            ['b', this.handleBuddy]
        ]);
    }

    handle(category, params, client) {
        const handler = this.handlers.get(category);
        if (handler) {
            handler(params, client);
        }
    }
}