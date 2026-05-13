const express = require("express");
const path = require("path");
const homeRouter = require("./routes/home");
const studentsRouter = require("./routes/students");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/students", studentsRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

module.exports = app;
