
const crypto = require('crypto');
const db = require('../db'); // Import the database functions
const config = require('../config');
const xml2js = require('xml2js');
const Client = require('../client');

class Login {
    handleXMLMessage(message, socket) {
        xml2js.parseString(message, async (err, result) => {
            if (err) {
                console.error('XML Parsing Error:', err);
                return;
            }
            console.log('Parsed XML:', result);

            const msgType = result.msg?.['$']?.t;

            if (msgType === 'sys') {
                const bodyAction = result.msg?.body?.[0]?.['$']?.action;
                console.log(bodyAction);

                if (bodyAction === 'verChk') {
                    await this.handleVersionCheck(socket);

                } else if (bodyAction === 'rndK') {
                    socket.randomKey = crypto.randomBytes(16).toString('hex'); // Generate a unique 16-byte key
                    await this.handleRandomKey(socket);

                } else if (bodyAction === 'login') {
                    const loginNode = result.msg?.body?.[0]?.login?.[0];
                    const username = loginNode?.nick?.[0];
                    const password = loginNode?.pword?.[0];

                    this.doLogin(username, password, socket);

                } else {
                    console.log('Unknown action:', bodyAction);
                }
            } else {
                console.log('Unknown message type:', msgType);
            }
        });
    }

    // Function to handle the policy file request
    handlePolicyRequest(socket) {
        const policyResponse = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n  <allow-access-from domain="*" to-ports="*"/>\n</cross-domain-policy>\0';
        socket.write(policyResponse);
    }

    // Function to handle version check
    async handleVersionCheck(socket) {
        const versionResponse = `<msg t='sys'><body action='apiOK' r='0'></body></msg>\0`;
        console.log('Sending version response');
        socket.write(versionResponse);
    }

    // Function to handle random key generation
    async handleRandomKey(socket) {
        const rndKResponse = `<msg t='sys'><body action='rndK' r='0'><k>${socket.randomKey}</k></body></msg>\0`;
        console.log('Sending random key response');
        socket.write(rndKResponse);
    }

    async doLogin(username, password, socket) {
        const key = socket.randomKey;

        try {
            // Escape the username to prevent SQL injection
            const escapedUsername = this.escape(username);
            const query = `SELECT * FROM ${config.mysql.userTableName} WHERE username = ?`;
            const results = await db.returnArray(query, [escapedUsername]);

            if (results.length > 0) {
                const dbv = results[0];
                let hash;

                if (socket.serverType === "login") {
                    console.log('This is the key: ' + key)
                    hash = this.encryptPassword(dbv.password.toUpperCase(), key);
                } else {
                    hash = this.swapMD5(crypto.createHash('md5').update(dbv.lkey + key).digest('hex')) + dbv.lkey;
                }

                if (password === hash) {
                    if (dbv.active !== "0") {
                        if (dbv.ubdate !== "PERMABANNED") {
                            if (dbv.ubdate < Math.floor(Date.now() / 1000)) {
                                if (socket.serverType === "login") {
                                    const loginResponse = `%xt%gs%-1%${config.servers.server1.ip}:${config.servers.server1.port}:2% 3;\0`;
                                    socket.write(loginResponse);
                                    const updateHash = this.md5Reverse(password);
                                    await db.returnArray(`UPDATE ${config.mysql.userTableName} SET lkey='${updateHash}' WHERE id='${dbv.id}'`);
                                    const loginSuccessResponse = `%xt%l%-1%${dbv.id}%${updateHash}%0%\0`;
                                    socket.write(loginSuccessResponse);
                                } else {
                                    try {
                                        console.log('Attempting game server login for:', dbv.username);
                                        const ip = socket.remoteAddress || 'unknown';
                                        await db.returnArray(`UPDATE ${config.mysql.userTableName} SET ips=CONCAT(ips, '\\n${this.escape(ip)}') WHERE id='${dbv.id}'`);
                                        
                                        console.log('Creating new client instance...');
                                        const client = new Client({
                                            data: dbv,
                                            socket: socket
                                        });
                                
                                        console.log('Attaching client to socket...');
                                        socket.client = client;
                                        
                                        console.log('Client successfully created and attached for:', dbv.username);
                                        socket.write("%xt%l%-1%\0");
                                    } catch (err) {
                                        console.error('Error during game server login:', err);
                                        socket.write("%xt%e%-1%101%\0");
                                    }
                                }
                            } else {
                                const response = "%xt%e%-1%601%24%\0";
                                socket.write(response);
                            }
                        } else {
                            const response = "%xt%e%-1%603%\0";
                            socket.write(response);
                        }
                    } else {
                        const response = "%xt%e%-1%900%\0";
                        socket.write(response);
                    }
                } else {
                    const response = "%xt%e%-1%101%\0";
                    socket.write(response);
                }
            }
        } catch (err) {
            console.error('Database Query Error:', err);
        }
    }

    encryptPassword(password, key) {
        return this.swapMD5(crypto.createHash('md5').update(this.swapMD5(password) + key + 'Y(02.>\'H}t":E1').digest('hex'));
    }

    swapMD5(func_md5) {
        return func_md5.substring(16) + func_md5.substring(0, 16);
    }
    
    escape(string) {
        return string.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
    
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    md5Reverse(password) {
        // Implement the md5 reverse function or any specific transformation needed
        return crypto.createHash('md5').update(password).digest('hex');
    }
}

module.exports = Login;

