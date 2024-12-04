const XTPacket = require("./XTPacket");

class PufflePacket extends XTPacket{

    handle(){
        const packet = this.params[3];

        switch(packet){
            case "p#pgu":
                break;
            case "p#pg": {
                const id = this.params[5];
                this.client.sendXtMessage(packet.slice(2), [id]);
                break;
            }
        }
    }
}
module.exports = PufflePacket;