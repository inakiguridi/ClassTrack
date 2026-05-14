const express = require("express");
const {
  authConfigError,
  clearSessionCookie,
  createSessionValue,
  getAdminPassword,
  safeEqual,
  sessionCookie
} = require("../utils/auth");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login", {
    pageTitle: "Ingresar",
    error: null,
    nextUrl: req.query.next || "/",
    configError: authConfigError(),
    usesDevPassword: !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production"
  });
});

router.post("/login", (req, res) => {
  const configError = authConfigError();
  const nextUrl = String(req.body.next || "/");

  if (configError) {
    return res.status(500).render("auth/login", {
      pageTitle: "Ingresar",
      error: "La autenticacion no esta configurada.",
      nextUrl,
      configError,
      usesDevPassword: false
    });
  }

  const password = String(req.body.password || "");
  const adminPassword = getAdminPassword();

  if (!adminPassword || !safeEqual(password, adminPassword)) {
    return res.status(401).render("auth/login", {
      pageTitle: "Ingresar",
      error: "Contrasena incorrecta.",
      nextUrl,
      configError: null,
      usesDevPassword: !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production"
    });
  }

  const sessionValue = createSessionValue();

  if (!sessionValue) {
    return res.status(500).render("auth/login", {
      pageTitle: "Ingresar",
      error: "No se pudo crear la sesion.",
      nextUrl,
      configError: "Falta SESSION_SECRET.",
      usesDevPassword: false
    });
  }

  res.setHeader("Set-Cookie", sessionCookie(sessionValue));
  return res.redirect(nextUrl.startsWith("/") ? nextUrl : "/");
});

router.post("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.redirect("/login");
});

module.exports = router;
