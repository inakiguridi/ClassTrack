const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function listPayments(filters = {}) {
  ensureDatabase();

  const conditions = [];
  const values = [];

  if (filters.studentId) {
    values.push(filters.studentId);
    conditions.push(`payments.student_id = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    conditions.push(`payments.payment_date >= $${values.length}`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    conditions.push(`payments.payment_date <= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT
      payments.id,
      payments.student_id,
      payments.payment_date::text AS payment_date,
      payments.amount_paid,
      payments.method,
      payments.notes,
      students.name AS student_name
    FROM payments
    JOIN students ON students.id = payments.student_id
    ${whereClause}
    ORDER BY payments.payment_date DESC, payments.created_at DESC, payments.id DESC
  `,
    values
  );

  return result.rows.map(mapPayment);
}

function mapPayment(payment) {
  return {
    id: payment.id,
    studentId: payment.student_id,
    paymentDate: payment.payment_date,
    amountPaid: payment.amount_paid,
    method: payment.method,
    notes: payment.notes,
    studentName: payment.student_name
  };
}

async function listPaymentsByStudentId(studentId) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT
        payments.id,
        payments.student_id,
        payments.payment_date::text AS payment_date,
        payments.amount_paid,
        payments.method,
        payments.notes,
        students.name AS student_name
      FROM payments
      JOIN students ON students.id = payments.student_id
      WHERE payments.student_id = $1
      ORDER BY payments.payment_date DESC, payments.created_at DESC, payments.id DESC
    `,
    [studentId]
  );

  return result.rows.map(mapPayment);
}

async function findPaymentById(id) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT
        payments.id,
        payments.student_id,
        payments.payment_date::text AS payment_date,
        payments.amount_paid,
        payments.method,
        payments.notes,
        students.name AS student_name
      FROM payments
      JOIN students ON students.id = payments.student_id
      WHERE payments.id = $1
    `,
    [id]
  );

  const payment = result.rows[0];
  return payment ? mapPayment(payment) : null;
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

async function updatePayment(id, { studentId, paymentDate, amountPaid, method, notes }) {
  ensureDatabase();

  const result = await pool.query(
    `
      UPDATE payments
      SET student_id = $2, payment_date = $3, amount_paid = $4, method = $5, notes = $6
      WHERE id = $1
    `,
    [id, studentId, paymentDate, amountPaid, method || null, notes || null]
  );

  return result.rowCount > 0;
}

async function deletePayment(id) {
  ensureDatabase();

  const result = await pool.query("DELETE FROM payments WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  listPaymentsByStudentId,
  findPaymentById,
  listPayments,
  createPayment,
  updatePayment,
  deletePayment
};
