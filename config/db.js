// const { Pool } = require("pg");
// require("dotenv").config();

// const db = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// db.connect()
//   .then(() => {
//     console.log("✅ PostgreSQL Connected");
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err);
//   });

// module.exports = db;





const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

module.exports = db;