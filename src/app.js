const express = require("express");
const path = require("path");
const homeRouter = require("./routes/home");
const lessonsRouter = require("./routes/lessons");
const paymentsRouter = require("./routes/payments");
const studentsRouter = require("./routes/students");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/students", studentsRouter);
app.use("/lessons", lessonsRouter);
app.use("/payments", paymentsRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).render("error", {
    pageTitle: "Error",
    message: "No pudimos completar la accion. Revisa la conexion a la base de datos."
  });
});

module.exports = app;
