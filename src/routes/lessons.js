const express = require("express");
const {
  createLesson,
  deleteLesson,
  findLessonById,
  listLessons,
  updateLesson
} = require("../db/lessonsRepository");
const { findStudentById, listStudents } = require("../db/studentsRepository");
const { isFutureDateInput, isValidDateInput, todayForInput } = require("../utils/dates");
const { withSuccess } = require("../utils/redirects");

const router = express.Router();

function filterFormData(query) {
  const dateFrom = String(query.dateFrom || "").trim();
  const dateTo = String(query.dateTo || "").trim();

  return {
    filterStudentId: Number(query.studentId) || null,
    studentId: Number(query.studentId) || null,
    dateFrom: isValidDateInput(dateFrom) ? dateFrom : "",
    dateTo: isValidDateInput(dateTo) ? dateTo : ""
  };
}

function calculateAutoAmount(hourlyRate, durationMinutes) {
  return Math.round((hourlyRate * durationMinutes) / 60);
}

function lessonFormData(body) {
  return {
    studentId: Number(body.studentId),
    lessonDate: String(body.lessonDate || "").trim(),
    durationMinutes: Number(body.durationMinutes),
    chargeMode: String(body.chargeMode || "auto").trim(),
    manualAmount: body.manualAmount === "" ? null : Number(body.manualAmount),
    notes: String(body.notes || "").trim()
  };
}

function validateLesson(formData) {
  const errors = [];

  if (!Number.isInteger(formData.studentId) || formData.studentId <= 0) {
    errors.push("Debes seleccionar un alumno.");
  }

  if (!formData.lessonDate) {
    errors.push("La fecha de la clase es obligatoria.");
  } else if (!isValidDateInput(formData.lessonDate)) {
    errors.push("La fecha de la clase no es valida.");
  } else if (isFutureDateInput(formData.lessonDate)) {
    errors.push("La clase no puede tener fecha futura en esta version.");
  }

  if (!Number.isInteger(formData.durationMinutes) || formData.durationMinutes <= 0) {
    errors.push("La duracion debe ser un numero entero mayor a 0.");
  }

  if (formData.durationMinutes > 480) {
    errors.push("La duracion no puede superar 480 minutos.");
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

  return errors;
}

async function renderIndex(res, { errors = [], formData = {} } = {}) {
  const filters = {
    studentId: formData.filterStudentId || null,
    dateFrom: formData.dateFrom || "",
    dateTo: formData.dateTo || ""
  };
  const [students, lessons] = await Promise.all([listStudents(), listLessons(filters)]);

  res.render("lessons/index", {
    pageTitle: "Clases",
    students,
    lessons,
    filters,
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
    await renderIndex(res, {
      formData: filterFormData(_req.query)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const formData = lessonFormData(req.body);
  const errors = validateLesson(formData);

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

    return res.redirect(withSuccess("/lessons", "Clase registrada correctamente."));
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const lessonId = Number(req.params.id);
    const [lesson, students] = await Promise.all([
      Number.isInteger(lessonId) ? findLessonById(lessonId) : null,
      listStudents()
    ]);

    if (!lesson) {
      return res.status(404).render("error", {
        pageTitle: "Clase no encontrada",
        message: "No encontramos la clase solicitada."
      });
    }

    return res.render("lessons/edit", {
      pageTitle: "Editar clase",
      lesson,
      students,
      errors: [],
      formData: lesson
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id", async (req, res, next) => {
  const lessonId = Number(req.params.id);
  const formData = lessonFormData(req.body);
  const errors = validateLesson(formData);

  try {
    const [lesson, students] = await Promise.all([
      Number.isInteger(lessonId) ? findLessonById(lessonId) : null,
      listStudents()
    ]);

    if (!lesson) {
      return res.status(404).render("error", {
        pageTitle: "Clase no encontrada",
        message: "No encontramos la clase solicitada."
      });
    }

    const student =
      Number.isInteger(formData.studentId) && formData.studentId > 0
        ? await findStudentById(formData.studentId)
        : null;

    if (!student) {
      errors.push("El alumno seleccionado no existe.");
    }

    if (errors.length > 0) {
      return res.status(400).render("lessons/edit", {
        pageTitle: "Editar clase",
        lesson,
        students,
        errors,
        formData
      });
    }

    const amountCharged =
      formData.chargeMode === "manual"
        ? formData.manualAmount
        : calculateAutoAmount(student.hourlyRate, formData.durationMinutes);

    await updateLesson(lessonId, {
      studentId: formData.studentId,
      lessonDate: formData.lessonDate,
      durationMinutes: formData.durationMinutes,
      hourlyRateSnapshot: student.hourlyRate,
      chargeMode: formData.chargeMode,
      manualAmount: formData.chargeMode === "manual" ? formData.manualAmount : null,
      amountCharged,
      notes: formData.notes
    });

    return res.redirect(withSuccess("/lessons", "Clase actualizada correctamente."));
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const lessonId = Number(req.params.id);

    if (Number.isInteger(lessonId)) {
      await deleteLesson(lessonId);
    }

    return res.redirect(withSuccess("/lessons", "Clase eliminada correctamente."));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
