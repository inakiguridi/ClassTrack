const form = document.querySelector("[data-lesson-form]");

if (form) {
  const studentSelect = form.querySelector("[data-student-select]");
  const durationInput = form.querySelector("[data-duration-input]");
  const modeInputs = form.querySelectorAll("[data-charge-mode]");
  const manualWrapper = form.querySelector("[data-manual-amount-wrapper]");
  const manualInput = form.querySelector("[data-manual-amount-input]");
  const preview = form.querySelector("[data-amount-preview]");

  function selectedMode() {
    return Array.from(modeInputs).find((input) => input.checked)?.value || "auto";
  }

  function formatClp(amount) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function updatePreview() {
    const mode = selectedMode();
    const rate = Number(studentSelect.selectedOptions[0]?.dataset.rate || 0);
    const duration = Number(durationInput.value || 0);
    const manualAmount = Number(manualInput.value || 0);
    const amount = mode === "manual" ? manualAmount : Math.round((rate * duration) / 60);

    manualWrapper.hidden = mode !== "manual";
    manualInput.required = mode === "manual";
    preview.textContent = `Total estimado: ${formatClp(amount)}`;
  }

  studentSelect.addEventListener("change", updatePreview);
  durationInput.addEventListener("input", updatePreview);
  manualInput.addEventListener("input", updatePreview);
  modeInputs.forEach((input) => input.addEventListener("change", updatePreview));

  updatePreview();
}
