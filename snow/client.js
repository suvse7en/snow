const { escape } = require('mysql2');
const crumbs = require('../crumbs');
const db = require('./db');

class Client {
    #data;
    #socket;
    #roomId;
    #room;
    #x = 0;
    #y = 0;
    #frame = 1;
    #items = [];
    #head;
    #face;
    #neck;
    #body;
    #hands;
    #feet;
    #photo;
    #pin;
    #colour;

    constructor({data, socket}) {
        this.#data = data;
        this.#socket = socket;
        this.#items = (data.items != undefined ? String(data.items) : '').split(',');
        this.#head = data.head;
        this.#face = data.face;
        this.#neck = data.neck;
        this.#body = data.body;
        this.#hands = data.hands;
        this.#feet = data.feet;
        this.#photo = data.photo;
        this.#pin = data.pin;
        this.#colour = data.colour;
    }

    // Getters
    get data() { return this.#data; }
    get socket() { return this.#socket; }
    get roomId() { return this.#roomId; }
    get room() { return this.#room; }
    get x() { return this.#x; }
    get y() { return this.#y; }
    get frame() { return this.#frame; }
    get items() { return this.#items; }
    get head() { return this.#head; }
    get face() { return this.#face; }
    get neck() { return this.#neck; }
    get body() { return this.#body; }
    get hands() { return this.#hands; }
    get feet() { return this.#feet; }
    get photo() { return this.#photo; }
    get pin() { return this.#pin; }
    get colour() { return this.#colour; }

    // Setters
    set roomId(value) { this.#roomId = value; }
    set room(value) { this.#room = value; }
    set x(value) { this.#x = value; }
    set y(value) { this.#y = value; }
    set frame(value) { this.#frame = value; }
    set head(value) { this.#head = value; }
    set face(value) { this.#face = value; }
    set neck(value) { this.#neck = value; }
    set body(value) { this.#body = value; }
    set hands(value) { this.#hands = value; }
    set feet(value) { this.#feet = value; }
    set photo(value) { this.#photo = value; }
    set pin(value) { this.#pin = value; }
    set colour(value) { this.#colour = value; }

    getItems() {
        return this.items;
    }

    send(message) {
        this.socket.write(message + '\0');
    }

    sendXtMessage(header, params) {
        this.send(`%xt%${header}%-1%${params.join('%')}%`);
    }

    joinRoom(id, rooms, x, y) {
        const room = rooms[id];
        if(!room) return;
        
        this.leaveRoom();
        this.room = room;
        this.roomId = room.id;
        this.x = x;
        this.y = y;
        room.addClient(this);
    }

    leaveRoom() {
        if(!this.room) return;
        this.room.removeClient(this);
    }

    getPlayerString() {
        const playerData = [
            this.data.id,
            this.data.username,
            1,
            this.colour,
            this.head,
            this.face,
            this.neck,
            this.body,
            this.hands,
            this.feet,
            this.pin,
            this.photo,
            this.x,
            this.y,
            this.frame,
            1,
            this.data.rank * 146
        ];
        console.log(playerData.join("|"));
        return playerData.join("|");
    }

    addItem(itemId) {
        if(crumbs[itemId] == null) {
            this.sendXtMessage('e', [402]);
        } else if(this.items.includes(itemId)) {
            this.sendXtMessage('e', [400]);
        } else if(this.data.coins < crumbs[itemId].cost) {
            this.sendXtMessage('e', [401]);
        } else {
            this.data.coins -= crumbs[itemId].cost;
            this.#items.push(itemId);
            this.data.items = this.items.join(',');
            const query = `UPDATE ps_users SET items = ?, coins = ? WHERE id = ?`;
            db.query(query, [this.data.items, this.data.coins, this.data.id]);
            this.sendXtMessage('ai', [itemId, this.data.coins]);
        }
    }

    updateClientItem(itemType, itemId) {

        if(isNaN(itemId))
            throw new Error(`Item id ${itemId} is not a number!`);

        const column = itemType;
        
        if (!column) {
            this.sendXtMessage('e', [402]);
            return;
        }

        // Use setter to update the property
        this[column] = itemId;
        this.data[column] = itemId;

        const query = `UPDATE ps_users SET ${column} = ? WHERE id = ?`;
        db.query(query, [itemId, this.data.id]);
    }
}

module.exports = Client;