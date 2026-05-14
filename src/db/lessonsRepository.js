const { pool, hasDbUrl } = require("./connection");

function ensureDatabase() {
  if (!hasDbUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
}

async function listLessons() {
  ensureDatabase();

  const result = await pool.query(`
    SELECT
      lessons.id,
      lessons.lesson_date::text AS lesson_date,
      lessons.duration_minutes,
      lessons.hourly_rate_snapshot,
      lessons.charge_mode,
      lessons.manual_amount,
      lessons.amount_charged,
      lessons.notes,
      students.name AS student_name
    FROM lessons
    JOIN students ON students.id = lessons.student_id
    ORDER BY lessons.lesson_date DESC, lessons.created_at DESC, lessons.id DESC
  `);

  return result.rows.map((lesson) => ({
    id: lesson.id,
    lessonDate: lesson.lesson_date,
    durationMinutes: lesson.duration_minutes,
    hourlyRateSnapshot: lesson.hourly_rate_snapshot,
    chargeMode: lesson.charge_mode,
    manualAmount: lesson.manual_amount,
    amountCharged: lesson.amount_charged,
    notes: lesson.notes,
    studentName: lesson.student_name
  }));
}

function mapLesson(lesson) {
  return {
    id: lesson.id,
    studentId: lesson.student_id,
    lessonDate: lesson.lesson_date,
    durationMinutes: lesson.duration_minutes,
    hourlyRateSnapshot: lesson.hourly_rate_snapshot,
    chargeMode: lesson.charge_mode,
    manualAmount: lesson.manual_amount,
    amountCharged: lesson.amount_charged,
    notes: lesson.notes,
    studentName: lesson.student_name
  };
}

async function listLessonsByStudentId(studentId) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT
        lessons.id,
        lessons.student_id,
        lessons.lesson_date::text AS lesson_date,
        lessons.duration_minutes,
        lessons.hourly_rate_snapshot,
        lessons.charge_mode,
        lessons.manual_amount,
        lessons.amount_charged,
        lessons.notes,
        students.name AS student_name
      FROM lessons
      JOIN students ON students.id = lessons.student_id
      WHERE lessons.student_id = $1
      ORDER BY lessons.lesson_date DESC, lessons.created_at DESC, lessons.id DESC
    `,
    [studentId]
  );

  return result.rows.map(mapLesson);
}

async function findLessonById(id) {
  ensureDatabase();

  const result = await pool.query(
    `
      SELECT
        lessons.id,
        lessons.student_id,
        lessons.lesson_date::text AS lesson_date,
        lessons.duration_minutes,
        lessons.hourly_rate_snapshot,
        lessons.charge_mode,
        lessons.manual_amount,
        lessons.amount_charged,
        lessons.notes,
        students.name AS student_name
      FROM lessons
      JOIN students ON students.id = lessons.student_id
      WHERE lessons.id = $1
    `,
    [id]
  );

  const lesson = result.rows[0];
  return lesson ? mapLesson(lesson) : null;
}

async function createLesson({
  studentId,
  lessonDate,
  durationMinutes,
  hourlyRateSnapshot,
  chargeMode,
  manualAmount,
  amountCharged,
  notes
}) {
  ensureDatabase();

  await pool.query(
    `
      INSERT INTO lessons (
        student_id,
        lesson_date,
        duration_minutes,
        hourly_rate_snapshot,
        charge_mode,
        manual_amount,
        amount_charged,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      studentId,
      lessonDate,
      durationMinutes,
      hourlyRateSnapshot,
      chargeMode,
      manualAmount,
      amountCharged,
      notes || null
    ]
  );
}

async function updateLesson(
  id,
  {
    studentId,
    lessonDate,
    durationMinutes,
    hourlyRateSnapshot,
    chargeMode,
    manualAmount,
    amountCharged,
    notes
  }
) {
  ensureDatabase();

  const result = await pool.query(
    `
      UPDATE lessons
      SET
        student_id = $2,
        lesson_date = $3,
        duration_minutes = $4,
        hourly_rate_snapshot = $5,
        charge_mode = $6,
        manual_amount = $7,
        amount_charged = $8,
        notes = $9
      WHERE id = $1
    `,
    [
      id,
      studentId,
      lessonDate,
      durationMinutes,
      hourlyRateSnapshot,
      chargeMode,
      manualAmount,
      amountCharged,
      notes || null
    ]
  );

  return result.rowCount > 0;
}

async function deleteLesson(id) {
  ensureDatabase();

  const result = await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  listLessonsByStudentId,
  findLessonById,
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson
};
