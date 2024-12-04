const XTPacket = require("./XTPacket");

class EpfPacket extends XTPacket{
    handle(){
        const packet = this.params[3];
        switch(packet) {
            case "f#epfgf":{
                this.client.sendXtMessage(packet.slice(2), [0]);
                break;
            }
        }
    }
}
module.exports = EpfPacket;