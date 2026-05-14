const express = require("express");
const { getDashboard, getMonthlySummary, getRecentActivity } = require("../db/dashboardRepository");
const { currentMonthKey } = require("../utils/dates");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [dashboard, monthlySummary, recentActivity] = await Promise.all([
      getDashboard(),
      getMonthlySummary(),
      getRecentActivity()
    ]);
    const currentMonth =
      monthlySummary.find((month) => month.month === currentMonthKey()) || {
        month: currentMonthKey(),
        totalCharged: 0,
        totalPaid: 0,
        balance: 0
      };

    res.render("home", {
      pageTitle: "ClassTrack",
      subtitle: "Registro simple de clases, cobros y pagos",
      dashboard,
      monthlySummary,
      currentMonth,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
