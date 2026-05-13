const express = require("express");
const { createStudent, listStudents } = require("../db/memoryStore");

const router = express.Router();

router.get("/", (_req, res) => {
  res.render("students/index", {
    pageTitle: "Alumnos",
    students: listStudents(),
    errors: [],
    formData: {}
  });
});

router.post("/", (req, res) => {
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
    return res.status(400).render("students/index", {
      pageTitle: "Alumnos",
      students: listStudents(),
      errors,
      formData
    });
  }

  createStudent(formData);
  return res.redirect("/students");
});

module.exports = router;
