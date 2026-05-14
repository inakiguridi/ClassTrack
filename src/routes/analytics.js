const express = require("express");
const { getAnalytics } = require("../db/analyticsRepository");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const analytics = await getAnalytics();

    res.render("analytics/index", {
      pageTitle: "Analytics",
      analytics
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
