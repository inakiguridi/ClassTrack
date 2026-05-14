const express = require("express");
const { hasDbUrl, pool } = require("../db/connection");

const router = express.Router();

function databaseUrlKind() {
  const url = process.env.DATABASE_URL || "";

  if (!url) {
    return "missing";
  }

  if (url.includes(".pooler.supabase.com")) {
    return "supabase-pooler";
  }

  if (url.includes(".supabase.co")) {
    return "supabase-direct";
  }

  return "custom";
}

router.get("/db", async (_req, res) => {
  if (!hasDbUrl || !pool) {
    return res.status(500).json({
      ok: false,
      databaseUrl: "missing",
      message: "DATABASE_URL no esta configurada."
    });
  }

  try {
    const checks = await pool.query(`
      SELECT
        to_regclass('public.students') IS NOT NULL AS students_table,
        to_regclass('public.lessons') IS NOT NULL AS lessons_table,
        to_regclass('public.payments') IS NOT NULL AS payments_table,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'students'
            AND column_name = 'parent_name'
        ) AS parent_name_column
    `);

    return res.json({
      ok: true,
      databaseUrl: databaseUrlKind(),
      checks: checks.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      databaseUrl: databaseUrlKind(),
      code: error.code,
      message: error.message
    });
  }
});

module.exports = router;
