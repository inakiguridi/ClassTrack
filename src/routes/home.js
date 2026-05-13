const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.render("home", {
    pageTitle: "ClassTrack",
    subtitle: "Registro simple de clases, cobros y pagos"
  });
});

module.exports = router;
