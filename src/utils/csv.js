function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsv(headers, rows) {
  const lines = [
    headers.map((header) => escapeCsvValue(header.label)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header.key])).join(","))
  ];

  return `${lines.join("\n")}\n`;
}

module.exports = {
  toCsv
};
