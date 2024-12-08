const config = {
    mysql: {
        host: 'localhost',
        user: 'root',
        password: '', // Your DB password
        database: 'eclipse', // Your DB name
        userTableName: 'ps_users' // Table name for users
    },
    servers: {
        login: {
            ip: '0.0.0.0',
            port: '6112',
            name: 'Login Server'
        },
        server1: {
            ip: '0.0.0.0',
            port: '6113',
            name: 'Elite Land'
        }
    }
};

module.exports = config;
