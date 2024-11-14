const Inventory = require('./Handlers/inventory');
const BuddyManager = require('./Handlers/buddy');
const Clothing = require('./Handlers/clothing');
const Game = require('./Handlers/game');

class Client {
    #socket;
    #data;
    #currentRoom;
    #x = 0;
    #y = 0;
    #frame = 1;

    constructor({data, socket}) {
        this.#socket = socket;
        this.#data = data;
        this.#currentRoom = null;

        // Initialize managers
        this.inventory = new Inventory(this);
        this.buddyList = new BuddyManager(this);
        this.clothing = new Clothing(this);

        // Register with Game
        Game.getInstance().addClient(this);
    }

    // Getters
    get socket() { return this.#socket; }
    get data() { return this.#data; }
    get room() { return this.#currentRoom; }
    get x() { return this.#x; }
    get y() { return this.#y; }
    get frame() { return this.#frame; }

    // Setters
    set x(value) { this.#x = Number(value); }
    set y(value) { this.#y = Number(value); }
    set frame(value) { this.#frame = Number(value); }

    send(message) {
        this.#socket.write(message + '\0');
    }

    sendXtMessage(header, params) {
        this.send(`%xt%${header}%-1%${params.join('%')}%`);
    }

    sendError(error) {
        this.sendXtMessage('e', [error]);
    }

    joinRoom(roomId, x = 0, y = 0) {
        const gameManager = Game.getInstance();
        const room = gameManager.getRoom(roomId);
        
        if(!room) return;
        
        this.leaveRoom();
        this.#currentRoom = room;
        this.x = x;
        this.y = y;
        room.addClient(this);
    }

    leaveRoom() {
        if(this.#currentRoom) {
            this.#currentRoom.removeClient(this);
            this.#currentRoom = null;
        }
    }

    getPlayerString() {
        const playerData = [
            this.#data.id,
            this.#data.username,
            1,
            this.clothing.colour,  // Now using clothing manager
            this.clothing.head,
            this.clothing.face,
            this.clothing.neck,
            this.clothing.body,
            this.clothing.hands,
            this.clothing.feet,
            this.clothing.pin,
            this.clothing.photo,
            this.#x,
            this.#y,
            this.#frame,
            1,
            this.#data.rank * 146
        ];
        
        return playerData.join("|");
    }

    disconnect() {
        this.leaveRoom();
        Game.getInstance().removeClient(this.#data.id);
    }
}

module.exports = Client;