const express = require("express");
const { createLesson, listLessons } = require("../db/lessonsRepository");
const { findStudentById, listStudents } = require("../db/studentsRepository");

const router = express.Router();

function todayForInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago"
  }).format(new Date());
}

function calculateAutoAmount(hourlyRate, durationMinutes) {
  return Math.round((hourlyRate * durationMinutes) / 60);
}

async function renderIndex(res, { errors = [], formData = {} } = {}) {
  const [students, lessons] = await Promise.all([listStudents(), listLessons()]);

  res.render("lessons/index", {
    pageTitle: "Clases",
    students,
    lessons,
    errors,
    formData: {
      lessonDate: todayForInput(),
      chargeMode: "auto",
      ...formData
    }
  });
}

router.get("/", async (_req, res, next) => {
  try {
    await renderIndex(res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const formData = {
    studentId: Number(req.body.studentId),
    lessonDate: String(req.body.lessonDate || "").trim(),
    durationMinutes: Number(req.body.durationMinutes),
    chargeMode: String(req.body.chargeMode || "auto").trim(),
    manualAmount: req.body.manualAmount === "" ? null : Number(req.body.manualAmount),
    notes: String(req.body.notes || "").trim()
  };

  const errors = [];

  if (!Number.isInteger(formData.studentId) || formData.studentId <= 0) {
    errors.push("Debes seleccionar un alumno.");
  }

  if (!formData.lessonDate) {
    errors.push("La fecha de la clase es obligatoria.");
  }

  if (!Number.isInteger(formData.durationMinutes) || formData.durationMinutes <= 0) {
    errors.push("La duracion debe ser un numero entero mayor a 0.");
  }

  if (!["auto", "manual"].includes(formData.chargeMode)) {
    errors.push("El modo de cobro no es valido.");
  }

  if (
    formData.chargeMode === "manual" &&
    (!Number.isInteger(formData.manualAmount) || formData.manualAmount < 0)
  ) {
    errors.push("El monto manual debe ser un numero entero mayor o igual a 0.");
  }

  try {
    const student =
      Number.isInteger(formData.studentId) && formData.studentId > 0
        ? await findStudentById(formData.studentId)
        : null;

    if (!student) {
      errors.push("El alumno seleccionado no existe.");
    }

    if (errors.length > 0) {
      return await renderIndex(res.status(400), { errors, formData });
    }

    const amountCharged =
      formData.chargeMode === "manual"
        ? formData.manualAmount
        : calculateAutoAmount(student.hourlyRate, formData.durationMinutes);

    await createLesson({
      studentId: formData.studentId,
      lessonDate: formData.lessonDate,
      durationMinutes: formData.durationMinutes,
      hourlyRateSnapshot: student.hourlyRate,
      chargeMode: formData.chargeMode,
      manualAmount: formData.chargeMode === "manual" ? formData.manualAmount : null,
      amountCharged,
      notes: formData.notes
    });

    return res.redirect("/lessons");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
