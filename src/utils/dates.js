function todayForInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago"
  }).format(new Date());
}

function isValidDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isFutureDateInput(value) {
  return value > todayForInput();
}

module.exports = {
  todayForInput,
  isValidDateInput,
  isFutureDateInput
};
