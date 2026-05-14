const express = require("express");
const {
  createPayment,
  deletePayment,
  findPaymentById,
  listPayments,
  updatePayment
} = require("../db/paymentsRepository");
const { findStudentById, listStudents } = require("../db/studentsRepository");
const { isFutureDateInput, isValidDateInput, todayForInput } = require("../utils/dates");

const router = express.Router();

function filterFormData(query) {
  const dateFrom = String(query.dateFrom || "").trim();
  const dateTo = String(query.dateTo || "").trim();

  return {
    filterStudentId: Number(query.studentId) || null,
    dateFrom: isValidDateInput(dateFrom) ? dateFrom : "",
    dateTo: isValidDateInput(dateTo) ? dateTo : ""
  };
}

function paymentFormData(body) {
  return {
    studentId: Number(body.studentId),
    paymentDate: String(body.paymentDate || "").trim(),
    amountPaid: Number(body.amountPaid),
    method: String(body.method || "").trim(),
    notes: String(body.notes || "").trim()
  };
}

function validatePayment(formData) {
  const errors = [];

  if (!Number.isInteger(formData.studentId) || formData.studentId <= 0) {
    errors.push("Debes seleccionar un alumno.");
  }

  if (!formData.paymentDate) {
    errors.push("La fecha del pago es obligatoria.");
  } else if (!isValidDateInput(formData.paymentDate)) {
    errors.push("La fecha del pago no es valida.");
  } else if (isFutureDateInput(formData.paymentDate)) {
    errors.push("El pago no puede tener fecha futura en esta version.");
  }

  if (!Number.isInteger(formData.amountPaid) || formData.amountPaid <= 0) {
    errors.push("El monto pagado debe ser un numero entero mayor a 0.");
  }

  if (formData.method.length > 80) {
    errors.push("El metodo no puede superar 80 caracteres.");
  }

  if (formData.method && !["transferencia", "efectivo"].includes(formData.method)) {
    errors.push("El metodo de pago debe ser transferencia o efectivo.");
  }

  return errors;
}

async function renderIndex(res, { errors = [], formData = {} } = {}) {
  const filters = {
    studentId: formData.filterStudentId || null,
    dateFrom: formData.dateFrom || "",
    dateTo: formData.dateTo || ""
  };
  const [students, payments] = await Promise.all([listStudents(), listPayments(filters)]);

  res.render("payments/index", {
    pageTitle: "Pagos",
    students,
    payments,
    filters,
    errors,
    formData: {
      paymentDate: todayForInput(),
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
  const formData = paymentFormData(req.body);
  const errors = validatePayment(formData);

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

router.get("/:id/edit", async (req, res, next) => {
  try {
    const paymentId = Number(req.params.id);
    const [payment, students] = await Promise.all([
      Number.isInteger(paymentId) ? findPaymentById(paymentId) : null,
      listStudents()
    ]);

    if (!payment) {
      return res.status(404).render("error", {
        pageTitle: "Pago no encontrado",
        message: "No encontramos el pago solicitado."
      });
    }

    return res.render("payments/edit", {
      pageTitle: "Editar pago",
      payment,
      students,
      errors: [],
      formData: payment
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id", async (req, res, next) => {
  const paymentId = Number(req.params.id);
  const formData = paymentFormData(req.body);
  const errors = validatePayment(formData);

  try {
    const [payment, students] = await Promise.all([
      Number.isInteger(paymentId) ? findPaymentById(paymentId) : null,
      listStudents()
    ]);

    if (!payment) {
      return res.status(404).render("error", {
        pageTitle: "Pago no encontrado",
        message: "No encontramos el pago solicitado."
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
      return res.status(400).render("payments/edit", {
        pageTitle: "Editar pago",
        payment,
        students,
        errors,
        formData
      });
    }

    await updatePayment(paymentId, formData);
    return res.redirect("/payments");
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const paymentId = Number(req.params.id);

    if (Number.isInteger(paymentId)) {
      await deletePayment(paymentId);
    }

    return res.redirect("/payments");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
