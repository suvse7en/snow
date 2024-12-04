const XTPacket = require("./XTPacket");

class IglooPacket extends XTPacket {
    async handle(){
        const packet = this.params[3];

        switch(packet){
            case "g#gm": {
                const id = this.params[5];
                this.client.sendXtMessage(packet.slice(2), [id, 1, 0, 0, '']);
                break;
            }
        }
    }
}

module.exports = IglooPacket;