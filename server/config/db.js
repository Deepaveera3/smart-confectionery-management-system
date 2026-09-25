const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./dbInit');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'sweet_haven_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.error('❌ Failed to initialize MySQL Pool configuration:', err.message);
}

// Function to initialize tables and check database connectivity
async function testConnection() {
  try {
    // Run auto-migration / table creation if needed
    await initializeDatabase();

    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected Successfully to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    isConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️  MySQL Connection Note: Unable to connect to MySQL database at ${dbConfig.host}:${dbConfig.port} (${error.code || error.message}).`);
    isConnected = false;
    return false;
  }
}

// Execute initial check
testConnection();

module.exports = {
  pool,
  testConnection,
  getIsConnected: () => isConnected,
  dbConfig
};
