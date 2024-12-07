const Inventory = require('./Inventory');
const Buddy = require('./Buddy');
const Clothing = require('./Clothing');


class Client {
    #gameInstance;
    #socket;
    
    #data;
    #currentRoom;

    #x = 0;
    #y = 0;
    #frame = 1;

    constructor(data, socket, handler) {
        this.#socket = socket;
        this.#data = data;
        this.#currentRoom = null;

        if(handler.game) {
            this.#gameInstance = handler;
        }

        // Initialize managers
        this.inventory = new Inventory(this);
        this.buddyList = new Buddy(this, this.#gameInstance);
        this.clothing = new Clothing(this);
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

        //if(roomId == this.data.id + 1000){
            //this.#gameInstance.createRoom(roomId);
        //}
        
        const room = this.#gameInstance.getRoom(roomId);
    
        if(!room) return;
        
        this.leaveRoom();
        this.#currentRoom = room;
        this.x = x;
        this.y = y;
        this.clothing.updateFromClientData(this.#data);
        room.addClient(this);
    }

    leaveRoom() {
        if(this.#currentRoom) {
            this.#currentRoom.removeClient(this);
            this.#currentRoom = null;
        }
    }

    setRoom(roomId){
        this.#currentRoom = roomId;
    }

    getPlayerString() {
        const playerData = [
            this.#data.id,
            this.#data.username,
            1,
            this.clothing.colour,
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
        this.#gameInstance.removeClient(this.#data.id);
    }
}

module.exports = Client;