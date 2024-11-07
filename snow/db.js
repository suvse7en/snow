const mysql = require('mysql2/promise'); // Use 'promise' variant for Promises

// Database connection setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Update with your DB password
  database: 'eclipse' // Update with your DB name
});

// Function to get the number of rows from a query
async function getRows(...query) {
  const result = await db.query(...query);
  return result[0]; // Returning row count
}

// Function to get an array of results from a query
async function returnArray(...params) {
  const result = await db.query(...params);
  return result[0]; // Returning array of results
}

// Function to execute an update/insert query
async function query(...params) {
  const result = await db.query(...params);
  return result[0];
}

// Function to escape special characters in a string for SQL
function escape(string) {
  return mysql.escape(string);
}

// Exporting functions
module.exports = {
  getRows,
  returnArray,
  query,
  escape
};
