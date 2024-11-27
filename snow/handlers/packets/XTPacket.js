class XTPacket {
    constructor(params, client, gameHandler){
        this.params = params;
        this.client = client;
        this.gameHandler = gameHandler;
    }

    handle(){
        throw new Error('Handle method must be implemented by child classes');
    }

    sendToRoom(type, data){
        this.client.room.sendXtMessage(type, data);
    }

    sendToClient(type, data){
        this.client.sendXtMessage(type, data);
    }
}

module.exports = XTPacket;