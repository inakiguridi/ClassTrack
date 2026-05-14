const express = require("express");
const { getStudentBalance } = require("../db/dashboardRepository");
const { listLessonsByStudentId } = require("../db/lessonsRepository");
const { listPaymentsByStudentId } = require("../db/paymentsRepository");
const {
  createStudent,
  deleteStudent,
  findStudentById,
  listStudents,
  updateStudent
} = require("../db/studentsRepository");
const { withSuccess } = require("../utils/redirects");

const router = express.Router();

function studentFormData(body) {
  return {
    name: String(body.name || "").trim(),
    hourlyRate: Number(body.hourlyRate),
    parentName: String(body.parentName || "").trim(),
    notes: String(body.notes || "").trim()
  };
}

function validateStudent(formData) {
  const errors = [];

  if (!formData.name) {
    errors.push("El nombre es obligatorio.");
  }

  if (formData.name.length > 120) {
    errors.push("El nombre no puede superar 120 caracteres.");
  }

  if (!Number.isInteger(formData.hourlyRate) || formData.hourlyRate < 0) {
    errors.push("La tarifa por hora debe ser un numero entero mayor o igual a 0.");
  }

  if (formData.parentName.length > 120) {
    errors.push("El nombre del padre no puede superar 120 caracteres.");
  }

  return errors;
}

router.get("/", async (_req, res, next) => {
  try {
    const students = await listStudents();

    res.render("students/index", {
      pageTitle: "Alumnos",
      students,
      errors: [],
      formData: {}
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const formData = studentFormData(req.body);
  const errors = validateStudent(formData);

  if (errors.length > 0) {
    try {
      const students = await listStudents();

      return res.status(400).render("students/index", {
        pageTitle: "Alumnos",
        students,
        errors,
        formData
      });
    } catch (error) {
      return next(error);
    }
  }

  try {
    await createStudent(formData);
    return res.redirect(withSuccess("/students", "Alumno creado correctamente."));
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const student = Number.isInteger(studentId) ? await findStudentById(studentId) : null;

    if (!student) {
      return res.status(404).render("error", {
        pageTitle: "Alumno no encontrado",
        message: "No encontramos el alumno solicitado."
      });
    }

    const [balance, lessons, payments] = await Promise.all([
      getStudentBalance(studentId),
      listLessonsByStudentId(studentId),
      listPaymentsByStudentId(studentId)
    ]);
    const calendarLessons = lessons.map((lesson) => ({
      id: lesson.id,
      date: lesson.lessonDate,
      durationMinutes: lesson.durationMinutes,
      amountCharged: lesson.amountCharged,
      chargeMode: lesson.chargeMode
    }));

    return res.render("students/show", {
      pageTitle: student.name,
      student,
      balance,
      lessons,
      payments,
      calendarLessonsJson: JSON.stringify(calendarLessons).replace(/</g, "\\u003c")
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const student = Number.isInteger(studentId) ? await findStudentById(studentId) : null;

    if (!student) {
      return res.status(404).render("error", {
        pageTitle: "Alumno no encontrado",
        message: "No encontramos el alumno solicitado."
      });
    }

    return res.render("students/edit", {
      pageTitle: `Editar ${student.name}`,
      student,
      errors: [],
      formData: student
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id", async (req, res, next) => {
  const studentId = Number(req.params.id);
  const formData = studentFormData(req.body);
  const errors = validateStudent(formData);

  try {
    const student = Number.isInteger(studentId) ? await findStudentById(studentId) : null;

    if (!student) {
      return res.status(404).render("error", {
        pageTitle: "Alumno no encontrado",
        message: "No encontramos el alumno solicitado."
      });
    }

    if (errors.length > 0) {
      return res.status(400).render("students/edit", {
        pageTitle: `Editar ${student.name}`,
        student,
        errors,
        formData
      });
    }

    await updateStudent(studentId, formData);
    return res.redirect(withSuccess(`/students/${studentId}`, "Alumno actualizado correctamente."));
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);

    if (Number.isInteger(studentId)) {
      await deleteStudent(studentId);
    }

    return res.redirect(withSuccess("/students", "Alumno eliminado correctamente."));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
