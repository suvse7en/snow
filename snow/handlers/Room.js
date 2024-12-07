class Room {
    #id;
    #name;
    #clients;
    #game;

    constructor({id, name, game = false}) {
        this.#id = Number(id);
        this.#name = name;
        this.#game = game;
        this.#clients = new Map();
    }

    // Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get game() { return this.#game; }

    getClients() {
        return Array.from(this.#clients.keys());
    }

    getClientCount() {
        return this.#clients.size;
    }

    hasClient(clientId) {
        return this.#clients.has(Number(clientId));
    }

    addClient(client) {
        if (!client?.data?.id) {
            console.error('Invalid client object provided to addClient');
            return false;
        }

        const clientId = Number(client.data.id);

        // Check if client already exists
        if (this.#clients.has(clientId)) {
            return false;
        }

        try {
            // Get current player strings
            const playerStrings = Array.from(this.#clients.values())
                .map(client => client.getPlayerString());

            // Add client to room
            this.#clients.set(clientId, client);

            // Send join room message to new client
            client.sendXtMessage('jr', [this.#id, ...playerStrings]);

            // Announce new player to room
            this.sendXtMessage('ap', [client.getPlayerString()]);
            
            return true;
        } catch (error) {
            console.error('Error adding client to room:', error);
            return false;
        }
    }

    removeClient(client) {
        if (!client?.data?.id) {
            console.error('Invalid client object provided to removeClient');
            return false;
        }

        const clientId = Number(client.data.id);

        // Check if client exists
        if (!this.#clients.has(clientId)) {
            return false;
        }

        try {
            // Remove client from room
            this.#clients.delete(clientId);

            // Announce player removal to room
            this.sendXtMessage('rp', [clientId]);

            return true;
        } catch (error) {
            console.error('Error removing client from room:', error);
            return false;
        }
    }

    sendXtMessage(header, params) {
        try {
            this.#clients.forEach(client => {
                try {
                    client.sendXtMessage(header, params);
                } catch (error) {
                    console.error(`Error sending message to client ${client.data?.id}:`, error);
                }
            });
        } catch (error) {
            console.error('Error broadcasting message:', error);
        }
    }

    // Get a specific client
    getClient(clientId) {
        return this.#clients.get(Number(clientId));
    }

}

module.exports = Room;