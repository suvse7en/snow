const crumbs = require('../crumbs');
const db = require('./db');

class Client {
    data;
    socket;
    roomId;
    room;
    x = 0;
    y = 0;
    frame = 1;
    items = [];

    constructor({data, socket}){
        this.data = data;
        this.socket = socket;
        this.items = (data.items != undefined ? String(data.items) : '').split(',');
    }

    getItems(){
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

        if(!room)
            return;
        
        this.leaveRoom();

        this.room = room;
        this.roomId = room.id;
        this.x = x;
        this.y = y;

        room.addClient(this);
    }
    leaveRoom() {
        if(!this.room)
            return;

        this.room.removeClient(this);
    }
    getPlayerString() {
        const playerData = [
          this.data.id,
          this.data.username,
          1,
          this.data.colour,
          this.data.head,
          this.data.face,
          this.data.neck,
          this.data.body,
          this.data.hands,
          this.data.feet,
          this.data.pin,
          this.data.photo,
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
        if(crumbs[itemId] == null){
            this.sendXtMessage('e', [402]);
        }else if(this.items.includes(itemId)){
            this.sendXtMessage('e', [400]);
        }else if(this.data.coins < crumbs[itemId].cost){
            this.sendXtMessage('e', [401]);
        }else{
            this.data.coins -= crumbs[itemId].cost;
            this.items.push(itemId);
            this.data.items = this.items.join(',');

            const query = `UPDATE ps_users SET items = ?, coins = ? WHERE id = ?`;
        
            db.query(query, [this.data.items, this.data.coins, this.data.id]);
            
            this.sendXtMessage('ai', [itemId, this.data.coins]);
        }
    }
}
module.exports = Client;