const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function listStudents() {
  ensureDatabase();

  const result = await pool.query(`
    SELECT id, name, hourly_rate, parent_name, notes
    FROM students
    ORDER BY created_at DESC, id DESC
  `);

  return result.rows.map((student) => ({
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    parentName: student.parent_name,
    notes: student.notes
  }));
}

async function findStudentById(id) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT id, name, hourly_rate, parent_name, notes
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
    parentName: student.parent_name,
    notes: student.notes
  };
}

async function createStudent({ name, hourlyRate, parentName, notes }) {
  ensureDatabase();

  const result = await pool.query(
    `
      INSERT INTO students (name, hourly_rate, parent_name, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, hourly_rate, parent_name, notes
    `,
    [name, hourlyRate, parentName || null, notes || null]
  );

  const student = result.rows[0];

  return {
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    parentName: student.parent_name,
    notes: student.notes
  };
}

async function updateStudent(id, { name, hourlyRate, parentName, notes }) {
  ensureDatabase();

  const result = await pool.query(
    `
      UPDATE students
      SET name = $2, hourly_rate = $3, parent_name = $4, notes = $5
      WHERE id = $1
      RETURNING id, name, hourly_rate, parent_name, notes
    `,
    [id, name, hourlyRate, parentName || null, notes || null]
  );

  const student = result.rows[0];

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    name: student.name,
    hourlyRate: student.hourly_rate,
    parentName: student.parent_name,
    notes: student.notes
  };
}

async function deleteStudent(id) {
  ensureDatabase();

  const result = await pool.query("DELETE FROM students WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  listStudents,
  findStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
