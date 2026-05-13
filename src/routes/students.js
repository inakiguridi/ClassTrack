const express = require("express");
const { createStudent, listStudents } = require("../db/studentsRepository");

const router = express.Router();

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
  const formData = {
    name: String(req.body.name || "").trim(),
    hourlyRate: Number(req.body.hourlyRate),
    contact: String(req.body.contact || "").trim(),
    notes: String(req.body.notes || "").trim()
  };

  const errors = [];

  if (!formData.name) {
    errors.push("El nombre es obligatorio.");
  }

  if (!Number.isInteger(formData.hourlyRate) || formData.hourlyRate < 0) {
    errors.push("La tarifa por hora debe ser un numero entero mayor o igual a 0.");
  }

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
    return res.redirect("/students");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
