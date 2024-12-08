const net = require('net');
const config = require('./config');
const Login = require('./handlers/login'); // Import the Login class
const Game = require('./handlers/game'); // Import the Game class
const Client = require('./handlers/player/Client');

class Server {
    constructor() {
        this.gameHandler = new Game();
        this.loginHandler = new Login({
            onLoginSuccess: (data, socket, loginData) => this.handleLoginSuccess(data, socket, loginData)
        });

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

    handleLoginSuccess(data, socket, loginData = {}) {
        try {
            if (socket.serverType === "login") {
                // Send server info and login key
                const loginResponse = `%xt%gs%-1%${config.servers.server1.ip}:${config.servers.server1.port}:2% 3;\0`;
                socket.write(loginResponse);
                
                const loginSuccessResponse = `%xt%l%-1%${data.id}%${loginData.updateHash}%0%\0`;
                socket.write(loginSuccessResponse);
            } else {
                // Game server login
                
                console.log('Creating new client instance...');
                const client = new Client(data, socket, this.gameHandler);
                
                console.log('Adding client to game...');
                
                if(!this.gameHandler.isUserOnline(client.data.id)){
                    this.gameHandler.addPlayerByName(client.data.username);
                    this.gameHandler.addClient(client);
                }else{
                    socket.write("%xt%e%-1%3%\0");
                }
                
                
                console.log('Attaching client to socket...');
                socket.client = client;
                
                // Send game server login success
                socket.write("%xt%l%-1%\0");
            }
        } catch (err) {
            console.error('Error during login success:', err);
            socket.write("%xt%e%-1%101%\0");
        }
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
}

// Start the server
const server = new Server();
server.start();
