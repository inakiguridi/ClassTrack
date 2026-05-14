const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

function intValue(value) {
  return Number(value || 0);
}

async function getAnalytics() {
  ensureDatabase();

  const [
    overview,
    classesByStudent,
    classesByDuration,
    paymentsByStudent,
    paymentsByMethod,
    monthlyStats,
    studentBalances
  ] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM students)::int AS total_students,
        (SELECT COUNT(*) FROM lessons)::int AS total_lessons,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM lessons)::int AS total_minutes,
        (SELECT COALESCE(ROUND(AVG(duration_minutes)), 0) FROM lessons)::int AS average_minutes,
        (SELECT COALESCE(SUM(amount_charged), 0) FROM lessons)::int AS total_charged,
        (SELECT COUNT(*) FROM payments)::int AS total_payments,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM payments)::int AS total_paid,
        (SELECT COALESCE(ROUND(AVG(amount_paid)), 0) FROM payments)::int AS average_payment
    `),
    pool.query(`
      SELECT
        students.id,
        students.name,
        COUNT(lessons.id)::int AS lesson_count,
        COALESCE(SUM(lessons.duration_minutes), 0)::int AS total_minutes,
        COALESCE(SUM(lessons.amount_charged), 0)::int AS total_charged
      FROM students
      LEFT JOIN lessons ON lessons.student_id = students.id
      GROUP BY students.id, students.name
      ORDER BY lesson_count DESC, students.name ASC
    `),
    pool.query(`
      SELECT
        duration_minutes,
        COUNT(*)::int AS lesson_count,
        COALESCE(SUM(amount_charged), 0)::int AS total_charged
      FROM lessons
      GROUP BY duration_minutes
      ORDER BY duration_minutes ASC
    `),
    pool.query(`
      SELECT
        students.id,
        students.name,
        COUNT(payments.id)::int AS payment_count,
        COALESCE(SUM(payments.amount_paid), 0)::int AS total_paid
      FROM students
      LEFT JOIN payments ON payments.student_id = students.id
      GROUP BY students.id, students.name
      ORDER BY total_paid DESC, students.name ASC
    `),
    pool.query(`
      SELECT
        COALESCE(method, 'sin metodo') AS method,
        COUNT(*)::int AS payment_count,
        COALESCE(SUM(amount_paid), 0)::int AS total_paid
      FROM payments
      GROUP BY COALESCE(method, 'sin metodo')
      ORDER BY total_paid DESC, method ASC
    `),
    pool.query(`
      WITH lesson_months AS (
        SELECT
          DATE_TRUNC('month', lesson_date)::date AS month,
          COUNT(*)::int AS lesson_count,
          COALESCE(SUM(duration_minutes), 0)::int AS total_minutes,
          COALESCE(SUM(amount_charged), 0)::int AS total_charged
        FROM lessons
        GROUP BY month
      ),
      payment_months AS (
        SELECT
          DATE_TRUNC('month', payment_date)::date AS month,
          COUNT(*)::int AS payment_count,
          COALESCE(SUM(amount_paid), 0)::int AS total_paid
        FROM payments
        GROUP BY month
      )
      SELECT
        COALESCE(lesson_months.month, payment_months.month)::text AS month,
        COALESCE(lesson_months.lesson_count, 0)::int AS lesson_count,
        COALESCE(lesson_months.total_minutes, 0)::int AS total_minutes,
        COALESCE(lesson_months.total_charged, 0)::int AS total_charged,
        COALESCE(payment_months.payment_count, 0)::int AS payment_count,
        COALESCE(payment_months.total_paid, 0)::int AS total_paid,
        (
          COALESCE(lesson_months.total_charged, 0) -
          COALESCE(payment_months.total_paid, 0)
        )::int AS balance
      FROM lesson_months
      FULL OUTER JOIN payment_months ON payment_months.month = lesson_months.month
      ORDER BY month DESC
      LIMIT 12
    `),
    pool.query(`
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
    `)
  ]);

  const overviewRow = overview.rows[0] || {};
  const totalCharged = intValue(overviewRow.total_charged);
  const totalPaid = intValue(overviewRow.total_paid);

  return {
    overview: {
      totalStudents: intValue(overviewRow.total_students),
      totalLessons: intValue(overviewRow.total_lessons),
      totalMinutes: intValue(overviewRow.total_minutes),
      averageMinutes: intValue(overviewRow.average_minutes),
      totalCharged,
      totalPayments: intValue(overviewRow.total_payments),
      totalPaid,
      averagePayment: intValue(overviewRow.average_payment),
      balance: totalCharged - totalPaid
    },
    classesByStudent: classesByStudent.rows,
    classesByDuration: classesByDuration.rows,
    paymentsByStudent: paymentsByStudent.rows,
    paymentsByMethod: paymentsByMethod.rows,
    monthlyStats: monthlyStats.rows.map((row) => ({
      ...row,
      month: row.month.slice(0, 7)
    })),
    studentBalances: studentBalances.rows
  };
}

module.exports = {
  getAnalytics
};
