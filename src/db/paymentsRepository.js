const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function listPayments() {
  ensureDatabase();

  const result = await pool.query(`
    SELECT
      payments.id,
      payments.payment_date::text AS payment_date,
      payments.amount_paid,
      payments.method,
      payments.notes,
      students.name AS student_name
    FROM payments
    JOIN students ON students.id = payments.student_id
    ORDER BY payments.payment_date DESC, payments.created_at DESC, payments.id DESC
  `);

  return result.rows.map((payment) => ({
    id: payment.id,
    paymentDate: payment.payment_date,
    amountPaid: payment.amount_paid,
    method: payment.method,
    notes: payment.notes,
    studentName: payment.student_name
  }));
}

async function createPayment({ studentId, paymentDate, amountPaid, method, notes }) {
  ensureDatabase();

  await pool.query(
    `
      INSERT INTO payments (student_id, payment_date, amount_paid, method, notes)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [studentId, paymentDate, amountPaid, method || null, notes || null]
  );
}

module.exports = {
  listPayments,
  createPayment
};
