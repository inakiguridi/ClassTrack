function todayForInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago"
  }).format(new Date());
}

function isValidDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isFutureDateInput(value) {
  return value > todayForInput();
}

module.exports = {
  todayForInput,
  isValidDateInput,
  isFutureDateInput
};
