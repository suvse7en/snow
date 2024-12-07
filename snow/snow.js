const { exec } = require('child_process');

const snowBanner = `
  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️  

  ███████╗███╗   ██╗ ██████╗ ██╗    ██╗
  ██╔════╝████╗  ██║██╔═══██╗██║    ██║
  ███████╗██╔██╗ ██║██║   ██║██║ █╗ ██║
  ╚════██║██║╚██╗██║██║   ██║██║███╗██║
  ███████║██║ ╚████║╚██████╔╝╚███╔███╔╝
  ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝

  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️  ❆  ❅  ❄️
`;

// Function to display the banner
const displayBanner = () => {
    console.log('\x1b[36m%s\x1b[0m', snowBanner); // Cyan color
};

displayBanner();

// Starts the database
const database = exec('node db.js');
database.stdout.on('data', (data) => {
  console.log(`${data}`);
});
database.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

// Start register.js
const register = exec('node Register.js');
register.stdout.on('data', (data) => {
  console.log(`${data}`);
});
register.stderr.on('data', (data) => {
  console.error(`Register Error: ${data}`);
});

//Starts the game server
const server = exec('node Server.js');
server.stdout.on('data', (data) => {
  console.log(`${data}`);
});
server.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});


