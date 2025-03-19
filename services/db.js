const mysql = require('mysql2/promise');
const { config } = require('../config/config');

async function query(sql, params) {
    const connection = await mysql.createConnection(config.db);
    try {
        const [result] = await connection.execute(sql, params);
        return result;
    }
    finally {
        await connection.end()
    }
}

module.exports = { query };
