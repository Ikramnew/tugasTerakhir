const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'finaltask',
    password: 'ikramnf123',
    port: 5432,
});

module.exports = pool;
