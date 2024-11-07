const net = require('net');
const config = require('./config');
const Login = require('./Handlers/login'); // Import the Login class
const Game = require('./Handlers/game'); // Import the Game class

class Server {
    constructor() {
        this.loginHandler = new Login();
        this.gameHandler = new Game();
        this.loginServer = net.createServer(this.handleLoginConnection.bind(this));
        this.gameServer = net.createServer(this.handleGameConnection.bind(this));
    }

    start() {
        // Start the login server
        this.loginServer.listen(config.servers.login.port, config.servers.login.ip, () => {
            console.log(`Login Server listening on ${config.servers.login.ip}:${config.servers.login.port}`);
        });

        // Start the game server (initially inactive, to be activated upon successful login)
        this.gameServer.listen(config.servers.server1.port, config.servers.server1.ip, () => {
            console.log(`Game Server listening on ${config.servers.server1.ip}:${config.servers.server1.port}`);
        });
    }

    async handleData(data, socket, handler) {
        if(!socket.readBuffer)
            socket.readBuffer = '';
        
        socket.readBuffer += data.toString();
        
        const buffer = socket.readBuffer;
        const messages = buffer.split('\0');
        const delimiterCount = buffer.match(/\0/g).length;

        if(messages.length - 1 != delimiterCount)
            return;
        
        for (const m of messages) {
            let message = m.trim();

            if(!message)
                continue;

            console.log('Received:', message);
            
            if (message.includes('<policy-file-request/>')) {
                handler.handlePolicyRequest(socket);
            }else
            if(message.includes('%xt%')) {
                handler.handleXTMessage(message, socket);
            }else{
                this.loginHandler.handleXMLMessage(message, socket);
            }
        }
        
        socket.readBuffer = '';
    }

    handleLoginConnection(socket) {
        socket.serverType = "login";

        console.log('Client connected to login server');

        socket.on('data', async (data) => this.handleData(data, socket, this.loginHandler));

        socket.on('end', () => {
            console.log('Client disconnected from login server');
        });
    }

    handleGameConnection(socket) {
        socket.serverType = "game";
        
        console.log('Client connected to game server');

        socket.on('data', async (data) => this.handleData(data, socket, this.gameHandler));

        socket.on('error', (err) => {
            console.error('Game server error:', err);
        });

        socket.on('end', () => {
            console.log('Client disconnected from game server');

            this.gameHandler.handleDisconnect(socket);
        });
    }

    escape(string) {
        return string.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
}

// Start the server
const server = new Server();
server.start();
