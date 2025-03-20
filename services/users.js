const db = require('./db');

async function getUsers() {
    const rows = await db.query('SELECT * FROM users');
    return rows || [];
}

async function createUser(user) {
    console.log("User?", user);
    
    const result = await db.query(
        `INSERT INTO users (first_name, last_name, email, address, phone_number, password)
        values (?, ?, ?, ?, ?, ?)`,
        [user.first_name, user.last_name, user.email, user.address, user.phone_number, user.password]
    );


    return { message: result.affectedRows ? "User created successfully" : "User cannot be created" };
}


async function getMail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const params = [email];

    try {
        const [rows] = await db.query(query, params);
        if (!rows || rows.length === 0) {
            throw new Error("User not found");
        }
        return rows[0];
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = {
    getUsers,
    createUser,
    getMail
}