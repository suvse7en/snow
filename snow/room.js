class Room {
    id = 0; // number
    name = ''; // string
    clients = []; // array
    game = false;

    constructor({id, name, game = false}) {
        this.id = Number(id);
        this.name = name;
        this.game = game;
    }

    addClient(client) {
        if(this.clients.includes(client))
            return;

        
        const playerStrings = [];

        this.clients.forEach(sclient => playerStrings.push(sclient.getPlayerString()));

        this.clients.push(client);

        client.sendXtMessage('jr', [this.id, ...playerStrings]);
        this.sendXtMessage('ap', [client.getPlayerString()]);
    }
    removeClient(client) {
        if(!this.clients.includes(client))
            return;

        this.clients.splice(this.clients.indexOf(client), 1);
        this.sendXtMessage('rp', [client.data.id]);
    }
    sendXtMessage(header, params) {
        this.clients.forEach(client => client.sendXtMessage(header, params));
    }
}

module.exports = Room;