const express = require("express");
const { pool } = require("../db/connection");
const { toCsv } = require("../utils/csv");

const router = express.Router();

function sendCsv(res, filename, headers, rows) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(toCsv(headers, rows));
}

router.get("/students.csv", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, parent_name, hourly_rate, notes, created_at::text
      FROM students
      ORDER BY name ASC
    `);

    sendCsv(
      res,
      "classtrack-alumnos.csv",
      [
        { key: "id", label: "id" },
        { key: "name", label: "alumno" },
        { key: "parent_name", label: "nombre_padre" },
        { key: "hourly_rate", label: "tarifa_hora" },
        { key: "notes", label: "notas" },
        { key: "created_at", label: "creado" }
      ],
      result.rows
    );
  } catch (error) {
    next(error);
  }
});

router.get("/lessons.csv", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        lessons.id,
        students.name AS student_name,
        lessons.lesson_date::text,
        lessons.duration_minutes,
        lessons.charge_mode,
        lessons.hourly_rate_snapshot,
        lessons.manual_amount,
        lessons.amount_charged,
        lessons.notes,
        lessons.created_at::text
      FROM lessons
      JOIN students ON students.id = lessons.student_id
      ORDER BY lessons.lesson_date DESC, lessons.created_at DESC
    `);

    sendCsv(
      res,
      "classtrack-clases.csv",
      [
        { key: "id", label: "id" },
        { key: "student_name", label: "alumno" },
        { key: "lesson_date", label: "fecha" },
        { key: "duration_minutes", label: "duracion_minutos" },
        { key: "charge_mode", label: "modo_cobro" },
        { key: "hourly_rate_snapshot", label: "tarifa_snapshot" },
        { key: "manual_amount", label: "monto_manual" },
        { key: "amount_charged", label: "monto_cobrado" },
        { key: "notes", label: "notas" },
        { key: "created_at", label: "creado" }
      ],
      result.rows
    );
  } catch (error) {
    next(error);
  }
});

router.get("/payments.csv", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        payments.id,
        students.name AS student_name,
        payments.payment_date::text,
        payments.amount_paid,
        payments.method,
        payments.notes,
        payments.created_at::text
      FROM payments
      JOIN students ON students.id = payments.student_id
      ORDER BY payments.payment_date DESC, payments.created_at DESC
    `);

    sendCsv(
      res,
      "classtrack-pagos.csv",
      [
        { key: "id", label: "id" },
        { key: "student_name", label: "alumno" },
        { key: "payment_date", label: "fecha" },
        { key: "amount_paid", label: "monto_pagado" },
        { key: "method", label: "metodo" },
        { key: "notes", label: "notas" },
        { key: "created_at", label: "creado" }
      ],
      result.rows
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
