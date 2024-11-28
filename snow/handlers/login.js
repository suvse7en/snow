const crypto = require('crypto');
const db = require('../db');
const config = require('../Config');
const xml2js = require('xml2js');

class Login {
    constructor({ onLoginSuccess }) {
        // Store the callback passed from Server
        this.onLoginSuccess = onLoginSuccess;
    }

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
                    socket.randomKey = crypto.randomBytes(16).toString('hex');
                    await this.handleRandomKey(socket);
                } else if (bodyAction === 'login') {
                    const loginNode = result.msg?.body?.[0]?.login?.[0];
                    const username = loginNode?.nick?.[0];
                    const password = loginNode?.pword?.[0];

                    await this.doLogin(username, password, socket);
                } else {
                    console.log('Unknown action:', bodyAction);
                }
            } else {
                console.log('Unknown message type:', msgType);
            }
        });
    }

    handlePolicyRequest(socket) {
        const policyResponse = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n<cross-domain-policy>\n  <allow-access-from domain="*" to-ports="*"/>\n</cross-domain-policy>\0';
        socket.write(policyResponse);
    }

    async handleVersionCheck(socket) {
        const versionResponse = `<msg t='sys'><body action='apiOK' r='0'></body></msg>\0`;
        console.log('Sending version response');
        socket.write(versionResponse);
    }

    async handleRandomKey(socket) {
        const rndKResponse = `<msg t='sys'><body action='rndK' r='0'><k>${socket.randomKey}</k></body></msg>\0`;
        console.log('Sending random key response');
        socket.write(rndKResponse);
    }

    async doLogin(username, password, socket) {
        const key = socket.randomKey;

        try {
            const escapedUsername = this.escape(username);
            const query = `SELECT * FROM ${config.mysql.userTableName} WHERE username = ?`;
            const results = await db.returnArray(query, [escapedUsername]);

            if (results.length > 0) {
                const data = results[0];
                let hash;

                if (socket.serverType === "login") {
                    console.log('This is the key: ' + key);
                    hash = this.encryptPassword(data.password.toUpperCase(), key);
                } else {
                    hash = this.swapMD5(crypto.createHash('md5').update(data.lkey + key).digest('hex')) + data.lkey;
                }

                if (password === hash) {
                    if (data.active !== "0") {
                        if (data.ubdate !== "PERMABANNED") {
                            if (data.ubdate < Math.floor(Date.now() / 1000)) {
                                if (socket.serverType === "login") {
                                    // Update the login key in database
                                    const updateHash = this.md5Reverse(password);
                                    await db.returnArray(`UPDATE ${config.mysql.userTableName} SET lkey='${updateHash}' WHERE id='${data.id}'`);
                                    
                                    // Call the callback with the player data
                                    this.onLoginSuccess(data, socket, {updateHash});
                                } else {
                                    // Handle game server login
                                    const ip = socket.remoteAddress || 'unknown';
                                    await db.returnArray(`UPDATE ${config.mysql.userTableName} SET ips=CONCAT(ips, '\\n${this.escape(ip)}') WHERE id='${data.id}'`);
                                    this.onLoginSuccess(data, socket);
                                }
                            } else {
                                socket.write("%xt%e%-1%601%24%\0");
                            }
                        } else {
                            socket.write("%xt%e%-1%603%\0");
                        }
                    } else {
                        socket.write("%xt%e%-1%900%\0");
                    }
                } else {
                    socket.write("%xt%e%-1%101%\0");
                }
            }
        } catch (err) {
            console.error('Database Query Error:', err);
        }
    }

    // Your utility methods remain the same
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
        return crypto.createHash('md5').update(password).digest('hex');
    }
}

module.exports = Login;