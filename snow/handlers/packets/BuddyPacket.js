const XTPacket = require('./XTPacket');

class BuddyPacket extends XTPacket {
    
    async handle() {
        const packet = this.params[3];

        switch(packet){
            case "b#br": {
                const id = Number(this.params[5]);
                const sclient = this.gameHandler.getClient(id);

                if(!sclient)
                    break;

                sclient.buddyList.addRequest(this.client);

                sclient.sendXtMessage(packet.slice(2), [this.client.data.id, this.client.data.username]);
                break;
            }
            case "b#ba": {
                const id = Number(this.params[5]);
                const targetClient = this.gameHandler.getClient(id);
                this.client.buddyList.acceptBuddy(
                    id,
                    this.gameHandler.isUserOnline.bind(this.gameHandler),
                    targetClient
                );
                break;  
            
            }

            case "b#gb":
                const buddyString = await this.client.buddyList.getBuddies(this.client);
                this.client.sendXtMessage(packet.slice(2), [this.client.data.id, buddyString]);
                break;

            case "b#rb": {
                const id = Number(this.params[5]);
                this.client.buddyList.removeBuddy(
                    id, 
                    this.gameHandler.getClient(id)
                );
                break;
            }
                
            case "b#bf": {
                const id = Number(this.params[5]);
                const targetClient = this.gameHandler.getClient(id);
                this.client.buddyList.findBuddy(id, targetClient, this.gameHandler.isUserOnline.bind(this.gameHandler));
                break;
            }
                
        }
        
    }
}

module.exports = BuddyPacket;