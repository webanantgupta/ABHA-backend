const db = require("../config/db");

const userModel = {

    findByEmail: async (email) => {

        const sql = `
            SELECT *
            FROM users
            WHERE email = $1
            LIMIT 1
        `;

        const result =
            await db.query(sql, [email]);

        return result.rows[0] || null;
    },


    findById: async (id) => {

        const sql = `
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            WHERE id = $1
            LIMIT 1
        `;

        const result =
            await db.query(sql, [id]);

        return result.rows[0] || null;
    },


    create: async ({
        name,
        email,
        passwordHash,
        role = "patient"
    }) => {

        const sql = `
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                name,
                email,
                role,
                created_at
        `;

        const values = [
            name,
            email,
            passwordHash,
            role
        ];

        const result =
            await db.query(sql, values);

        return result.rows[0];
    }
};


module.exports = userModel;