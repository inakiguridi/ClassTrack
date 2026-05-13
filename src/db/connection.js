const { Pool } = require("pg");

const hasDbUrl = Boolean(process.env.DATABASE_URL);

const pool = hasDbUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : null;

module.exports = { pool, hasDbUrl };
