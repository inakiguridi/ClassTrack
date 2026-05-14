const { Pool } = require("pg");

const hasDbUrl = Boolean(process.env.DATABASE_URL);

const pool = hasDbUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000
    })
  : null;

module.exports = { pool, hasDbUrl };
