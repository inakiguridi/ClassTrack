function withSuccess(path, message) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}success=${encodeURIComponent(message)}`;
}

module.exports = {
  withSuccess
};
