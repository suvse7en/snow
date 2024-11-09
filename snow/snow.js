const { exec } = require('child_process');

// Starts the database
const database = exec('node db.js');
database.stdout.on('data', (data) => {
  console.log(`${data}`);
});
database.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

// Start register.js
const register = exec('node register.js');
register.stdout.on('data', (data) => {
  console.log(`Register Output: ${data}`);
});
register.stderr.on('data', (data) => {
  console.error(`Register Error: ${data}`);
});

//Starts the game server
const server = exec('node server.js');
server.stdout.on('data', (data) => {
  console.log(`${data}`);
});
server.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

