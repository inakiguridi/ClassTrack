const express = require("express");
const { getDashboard, getMonthlySummary } = require("../db/dashboardRepository");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [dashboard, monthlySummary] = await Promise.all([getDashboard(), getMonthlySummary()]);

    res.render("home", {
      pageTitle: "ClassTrack",
      subtitle: "Registro simple de clases, cobros y pagos",
      dashboard,
      monthlySummary
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
