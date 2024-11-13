class Room {
    id = 0; // number
    name = ''; // string
    clients = new Map(); // Changed to Map
    game = false;

    constructor({id, name, game = false}) {
        this.id = Number(id);
        this.name = name;
        this.game = game;
    }

    getClients() {
        const clientsId = [];
        this.clients.forEach((value, key) => clientsId.push(key));

        return clientsId;
    }

    addClient(client) {
        // Check if client exists using Map has() method
        if(this.clients.has(client.data.id))
            return;

        const playerStrings = [];
        // Use Map values() for iteration
        this.clients.forEach(sclient => playerStrings.push(sclient.getPlayerString()));

        // Add client to Map using their ID as key
        this.clients.set(client.data.id, client);

        // Send join room message to new client
        client.sendXtMessage('jr', [this.id, ...playerStrings]);

        // Announce new player to room
        this.sendXtMessage('ap', [client.getPlayerString()]);
    }

    removeClient(client) {
        // Check if client exists using Map has() method
        if(!this.clients.has(client.data.id))
            return;

        // Remove client from Map
        this.clients.delete(client.data.id);

        // Announce player removal to room
        this.sendXtMessage('rp', [client.data.id]);
    }

    sendXtMessage(header, params) {
        // Use Map values() for iteration
        this.clients.forEach(client => client.sendXtMessage(header, params));
    }
}

module.exports = Room;