const confirmForms = document.querySelectorAll("[data-confirm]");

if (confirmForms.length > 0) {
  const modal = document.createElement("div");
  modal.className = "confirm-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <h2 id="confirm-title">Confirmar accion</h2>
      <p data-confirm-message></p>
      <div class="form-actions">
        <button type="button" data-confirm-accept>Confirmar</button>
        <button type="button" class="button-link button-link-secondary" data-confirm-cancel>Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const messageNode = modal.querySelector("[data-confirm-message]");
  const acceptButton = modal.querySelector("[data-confirm-accept]");
  const cancelButton = modal.querySelector("[data-confirm-cancel]");
  let selectedForm = null;

  function closeModal() {
    modal.hidden = true;
    selectedForm = null;
  }

  confirmForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (form.dataset.confirmed === "true") {
        return;
      }

      event.preventDefault();
      selectedForm = form;
      messageNode.textContent = form.dataset.confirm || "Confirma esta accion.";
      modal.hidden = false;
      acceptButton.focus();
    });
  });

  acceptButton.addEventListener("click", () => {
    if (!selectedForm) {
      return;
    }

    selectedForm.dataset.confirmed = "true";
    selectedForm.submit();
  });

  cancelButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}
