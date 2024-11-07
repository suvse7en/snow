const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));

// Set up the htdocs path based on the OS
const htdocsPath = process.platform === 'win32'
  ? 'C:/xampp/htdocs'
  : '/Applications/XAMPP/xamppfiles/htdocs';

app.use(express.static(htdocsPath));

app.get('/register', (req, res) => {
  res.sendFile(path.join(htdocsPath, 'register.html'));
});

app.post('/register', (req, res) => {
  const { username, email, pass, pass2, colour } = req.body;

  if (!username || !pass || !pass2) {
    return res.send('You did not complete all of the required fields');
  }

  if (colour >= 16) {
    return res.send('That color is not an in-game color!');
  }

  if (pass !== pass2) {
    return res.send('Your passwords did not match.');
  }

  if (pass.length <= 5) {
    return res.send('Your password is too short! It needs to be 5 characters or over.');
  }

  if (username.length <= 3) {
    return res.send('Your username is too short!');
  }

  // Basic validation for username and email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.send('Invalid email!');
  }

  const usernameRegex = /^[A-Za-z0-9_ ]+$/;
  if (!usernameRegex.test(username)) {
    return res.send('Invalid username!');
  }

  const hashedPassword = crypto.createHash('md5').update(pass).digest('hex');

  async function doRegister() {
    try {
      const results = await db.query('SELECT username FROM ps_users WHERE username = ?', [username]);
      
      if (results.length > 0) {
        return res.send('Sorry, the username is already in use.');
      }
    
      const query = 'INSERT INTO ps_users (username, nickname, email, password, active, colour) VALUES (?, ?, ?, ?, 1, ?)';
      await db.query(query, [username, username, email, hashedPassword, colour]);
      
      res.send('Thanks for registering! Now get off this page and start playing!');
    } catch (err) {
      // Handle the error appropriately instead of throwing it
      console.error(err);
      res.status(500).send('An error occurred during registration');
    }
  }

  doRegister();
});

app.listen(port, () => {
  console.log(`Register running on http://localhost:${port}/register`);
});
