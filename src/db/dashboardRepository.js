const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function getDashboard() {
  ensureDatabase();

  const result = await pool.query(`
    SELECT
      students.id,
      students.name,
      COALESCE(lesson_totals.total_charged, 0)::int AS total_charged,
      COALESCE(payment_totals.total_paid, 0)::int AS total_paid,
      (
        COALESCE(lesson_totals.total_charged, 0) -
        COALESCE(payment_totals.total_paid, 0)
      )::int AS balance
    FROM students
    LEFT JOIN (
      SELECT student_id, SUM(amount_charged) AS total_charged
      FROM lessons
      GROUP BY student_id
    ) lesson_totals ON lesson_totals.student_id = students.id
    LEFT JOIN (
      SELECT student_id, SUM(amount_paid) AS total_paid
      FROM payments
      GROUP BY student_id
    ) payment_totals ON payment_totals.student_id = students.id
    ORDER BY balance DESC, students.name ASC
  `);

  const students = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    totalCharged: row.total_charged,
    totalPaid: row.total_paid,
    balance: row.balance
  }));

  const totals = students.reduce(
    (summary, student) => ({
      totalCharged: summary.totalCharged + student.totalCharged,
      totalPaid: summary.totalPaid + student.totalPaid,
      balance: summary.balance + student.balance
    }),
    { totalCharged: 0, totalPaid: 0, balance: 0 }
  );

  return { students, totals };
}

async function getMonthlySummary() {
  ensureDatabase();

  const result = await pool.query(`
    WITH lesson_months AS (
      SELECT
        DATE_TRUNC('month', lesson_date)::date AS month,
        SUM(amount_charged)::int AS total_charged
      FROM lessons
      GROUP BY month
    ),
    payment_months AS (
      SELECT
        DATE_TRUNC('month', payment_date)::date AS month,
        SUM(amount_paid)::int AS total_paid
      FROM payments
      GROUP BY month
    )
    SELECT
      COALESCE(lesson_months.month, payment_months.month)::text AS month,
      COALESCE(lesson_months.total_charged, 0)::int AS total_charged,
      COALESCE(payment_months.total_paid, 0)::int AS total_paid,
      (
        COALESCE(lesson_months.total_charged, 0) -
        COALESCE(payment_months.total_paid, 0)
      )::int AS balance
    FROM lesson_months
    FULL OUTER JOIN payment_months ON payment_months.month = lesson_months.month
    ORDER BY month DESC
    LIMIT 12
  `);

  return result.rows.map((row) => ({
    month: row.month.slice(0, 7),
    totalCharged: row.total_charged,
    totalPaid: row.total_paid,
    balance: row.balance
  }));
}

async function getRecentActivity(limit = 8) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT *
      FROM (
        SELECT
          'lesson' AS type,
          lessons.id,
          lessons.lesson_date::text AS activity_date,
          lessons.amount_charged AS amount,
          students.name AS student_name,
          lessons.duration_minutes::text || ' min' AS detail
        FROM lessons
        JOIN students ON students.id = lessons.student_id
        UNION ALL
        SELECT
          'payment' AS type,
          payments.id,
          payments.payment_date::text AS activity_date,
          payments.amount_paid AS amount,
          students.name AS student_name,
          COALESCE(payments.method, 'sin metodo') AS detail
        FROM payments
        JOIN students ON students.id = payments.student_id
      ) activity
      ORDER BY activity_date DESC, id DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    type: row.type,
    id: row.id,
    activityDate: row.activity_date,
    amount: row.amount,
    studentName: row.student_name,
    detail: row.detail
  }));
}

async function getStudentBalance(studentId) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT
        students.id,
        students.name,
        COALESCE(lesson_totals.total_charged, 0)::int AS total_charged,
        COALESCE(payment_totals.total_paid, 0)::int AS total_paid,
        (
          COALESCE(lesson_totals.total_charged, 0) -
          COALESCE(payment_totals.total_paid, 0)
        )::int AS balance
      FROM students
      LEFT JOIN (
        SELECT student_id, SUM(amount_charged) AS total_charged
        FROM lessons
        WHERE student_id = $1
        GROUP BY student_id
      ) lesson_totals ON lesson_totals.student_id = students.id
      LEFT JOIN (
        SELECT student_id, SUM(amount_paid) AS total_paid
        FROM payments
        WHERE student_id = $1
        GROUP BY student_id
      ) payment_totals ON payment_totals.student_id = students.id
      WHERE students.id = $1
    `,
    [studentId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    totalCharged: row.total_charged,
    totalPaid: row.total_paid,
    balance: row.balance
  };
}

module.exports = {
  getDashboard,
  getMonthlySummary,
  getRecentActivity,
  getStudentBalance
};
