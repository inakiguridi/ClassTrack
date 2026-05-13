const express = require("express");
const { getDashboard } = require("../db/dashboardRepository");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const dashboard = await getDashboard();

    res.render("home", {
      pageTitle: "ClassTrack",
      subtitle: "Registro simple de clases, cobros y pagos",
      dashboard
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
