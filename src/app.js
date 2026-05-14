const express = require("express");
const path = require("path");
const authRouter = require("./routes/auth");
const healthRouter = require("./routes/health");
const homeRouter = require("./routes/home");
const lessonsRouter = require("./routes/lessons");
const paymentsRouter = require("./routes/payments");
const studentsRouter = require("./routes/students");
const { requireAuth } = require("./middleware/auth");

const app = express();

app.disable("x-powered-by");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/", authRouter);
app.use(requireAuth);
app.use("/health", healthRouter);
app.use("/", homeRouter);
app.use("/students", studentsRouter);
app.use("/lessons", lessonsRouter);
app.use("/payments", paymentsRouter);

app.use((_req, res) => {
  res.status(404).render("error", {
    pageTitle: "No encontrado",
    message: "No encontramos la pagina solicitada."
  });
});

app.use((error, req, res, _next) => {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  console.error({
    requestId,
    path: req.originalUrl,
    code: error.code,
    message: error.message,
    detail: error.detail,
    hint: error.hint
  });

  res.status(500).render("error", {
    pageTitle: "Error",
    message: `No pudimos completar la accion. Revisa la conexion a la base de datos. Codigo: ${requestId}`
  });
});

module.exports = app;
