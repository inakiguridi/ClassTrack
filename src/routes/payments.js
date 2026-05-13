const express = require("express");
const { createPayment, listPayments } = require("../db/paymentsRepository");
const { findStudentById, listStudents } = require("../db/studentsRepository");

const router = express.Router();

function todayForInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago"
  }).format(new Date());
}

async function renderIndex(res, { errors = [], formData = {} } = {}) {
  const [students, payments] = await Promise.all([listStudents(), listPayments()]);

  res.render("payments/index", {
    pageTitle: "Pagos",
    students,
    payments,
    errors,
    formData: {
      paymentDate: todayForInput(),
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
    paymentDate: String(req.body.paymentDate || "").trim(),
    amountPaid: Number(req.body.amountPaid),
    method: String(req.body.method || "").trim(),
    notes: String(req.body.notes || "").trim()
  };

  const errors = [];

  if (!Number.isInteger(formData.studentId) || formData.studentId <= 0) {
    errors.push("Debes seleccionar un alumno.");
  }

  if (!formData.paymentDate) {
    errors.push("La fecha del pago es obligatoria.");
  }

  if (!Number.isInteger(formData.amountPaid) || formData.amountPaid <= 0) {
    errors.push("El monto pagado debe ser un numero entero mayor a 0.");
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

    await createPayment(formData);
    return res.redirect("/payments");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
