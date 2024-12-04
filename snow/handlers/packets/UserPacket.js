const XTPacket = require('./XTPacket');
const db = require('../../db');

class UserPacket extends XTPacket {
    async handle() {
        const packet = this.params[3];
        let y;
        let frame;
        let x;
        
        switch(packet) {
            case "u#sp":
                x = this.params[5];
                y = this.params[6];
                this.client.x = x;
                this.client.y = y;
                this.sendToRoom(packet.slice(2), [this.client.data.id, x, y]);
                break;

            case "u#sb":
                x = this.params[5];
                y = this.params[6];
                this.client.x = x;
                this.client.y = y;
                this.sendToRoom(packet.slice(2), [this.client.data.id, x, y]);
                break;

            case "u#sf":
                frame = this.params[5];
                this.client.frame = frame;
                this.sendToRoom(packet.slice(2), [this.client.data.id, frame]);
                break;

            case "u#sa":
                frame = this.params[5];
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
            case "u#sj":
                const joke = this.params[5];
                this.sendToRoom(packet.slice(2), [this.client.data.id, joke]);
                break;

            case "u#gp": {
                const playerId = this.params[5];
                const playerInfo = await db.returnArray(
                    'SELECT id, username as nickname, "1", colour, head as curhead, ' +
                    'face as curface, neck as curneck, body as curbody, ' +
                    'hands as curhands, feet as curfeet, pin as curflag, ' +
                    'photo as curphoto, rank * 146 ' +
                    'FROM ps_users WHERE id = ?', [playerId]
                );
            
                if (playerInfo && playerInfo[0]) {
                    // Create array in specific order to match PHP version
                    const orderedInfo = [
                        playerInfo[0].id,
                        playerInfo[0].nickname,
                        playerInfo[0]['1'],            // The constant "1"
                        playerInfo[0].colour,
                        playerInfo[0].curhead,
                        playerInfo[0].curface,
                        playerInfo[0].curneck,
                        playerInfo[0].curbody,
                        playerInfo[0].curhands,
                        playerInfo[0].curfeet,
                        playerInfo[0].curflag,
                        playerInfo[0].curphoto,
                        playerInfo[0]['rank * 146']
                    ];
                    
                    console.log(orderedInfo.join('|'));
                    this.client.sendXtMessage('gp', [playerId, orderedInfo.join('|')]);
                }
                break;
            }

        }
    }
}

module.exports = UserPacket;