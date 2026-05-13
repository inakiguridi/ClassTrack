const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function listStudents() {
  ensureDatabase();

  const result = await pool.query(`
    SELECT id, name, hourly_rate, contact, notes
    FROM students
    ORDER BY created_at DESC, id DESC
  `);

  return result.rows.map((student) => ({
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    contact: student.contact,
    notes: student.notes
  }));
}

async function findStudentById(id) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT id, name, hourly_rate, contact, notes
      FROM students
      WHERE id = $1
    `,
    [id]
  );

  const student = result.rows[0];

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    contact: student.contact,
    notes: student.notes
  };
}

async function createStudent({ name, hourlyRate, contact, notes }) {
  ensureDatabase();

  const result = await pool.query(
    `
      INSERT INTO students (name, hourly_rate, contact, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, hourly_rate, contact, notes
    `,
    [name, hourlyRate, contact || null, notes || null]
  );

  const student = result.rows[0];

  return {
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    contact: student.contact,
    notes: student.notes
  };
}

module.exports = {
  listStudents,
  findStudentById,
  createStudent
};
