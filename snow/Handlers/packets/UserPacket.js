const XTPacket = require('./XTPacket');

class UserPacket extends XTPacket {
    handle() {
        const packet = this.params[3];
        switch(packet) {
            case "u#sp":
                var x = this.params[5];
                var y = this.params[6];
                this.client.x = x;
                this.client.y = y;
                this.sendToRoom(packet.slice(2), [this.client.data.id, x, y]);
                break;

            case "u#sb":
                var x = this.params[5];
                var y = this.params[6];
                this.client.x = x;
                this.client.y = y;
                this.sendToRoom(packet.slice(2), [this.client.data.id, x, y]);
                break;

            case "u#sf":
                var frame = this.params[5];
                this.client.frame = frame;
                this.sendToRoom(packet.slice(2), [this.client.data.id, frame]);
                break;

            case "u#sa":
                var frame = this.params[5];
                this.client.frame = frame;
                this.sendToRoom(packet.slice(2), [this.client.data.id, frame]);
                break;
                
            case "u#se":
                const emote = this.params[5];
                this.sendToRoom(packet.slice(2), [this.client.data.id, emote]);
                break;
                
            case "u#ss":
                const message = this.params[5];
                this.sendToRoom('ss', [this.client.data.id, message]);
                break;
                
            case "u#h":
                this.sendToClient('h', []);
                break;
        }
    }
}

module.exports = UserPacket;