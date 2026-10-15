require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'codearena',
    user: process.env.POSTGRES_USER || 'postgres',
    password: String(process.env.POSTGRES_PASSWORD || ''), 
    max: 20, // max clients
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()')
    .then(res => console.log('PostgreSQL connected:', res.rows[0].now))
    .catch(err => {
        console.error('PostgreSQL connection failed:', err.message);
        process.exit(1);  // Exit if DB connection fails
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

module.exports = pool;