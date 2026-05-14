const crypto = require("crypto");

const cookieName = "classtrack_session";
const maxAgeMs = 1000 * 60 * 60 * 24 * 7;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  return isProduction() ? null : "admin";
}

function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  return isProduction() ? null : "dev-session-secret";
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, pair) => {
    const [rawName, ...rawValue] = pair.trim().split("=");

    if (!rawName) {
      return cookies;
    }

    try {
      cookies[rawName] = decodeURIComponent(rawValue.join("="));
    } catch (_error) {
      cookies[rawName] = "";
    }

    return cookies;
  }, {});
}

function safeRedirectPath(value) {
  const nextPath = String(value || "/");

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

function sign(value) {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function createSessionValue() {
  const expiresAt = Date.now() + maxAgeMs;
  const payload = `admin.${expiresAt}`;
  const signature = sign(payload);

  if (!signature) {
    return null;
  }

  return `${payload}.${signature}`;
}

function isValidSession(value) {
  if (!value) {
    return false;
  }

  const parts = String(value).split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [subject, expiresAt, signature] = parts;
  const payload = `${subject}.${expiresAt}`;
  const expectedSignature = sign(payload);

  if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
    return false;
  }

  return subject === "admin" && Number(expiresAt) > Date.now();
}

function sessionCookie(value) {
  const flags = [
    `${cookieName}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];

  if (isProduction()) {
    flags.push("Secure");
  }

  return flags.join("; ");
}

function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[cookieName];
}

function authConfigError() {
  if (isProduction() && !process.env.ADMIN_PASSWORD) {
    return "Falta configurar ADMIN_PASSWORD.";
  }

  if (isProduction() && !process.env.SESSION_SECRET) {
    return "Falta configurar SESSION_SECRET.";
  }

  return null;
}

module.exports = {
  authConfigError,
  clearSessionCookie,
  createSessionValue,
  getAdminPassword,
  getSessionFromRequest,
  isValidSession,
  safeRedirectPath,
  sessionCookie,
  safeEqual
};
