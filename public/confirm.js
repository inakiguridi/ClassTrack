document.querySelectorAll("[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const message = form.dataset.confirm || "Confirma esta accion.";

    if (!window.confirm(message)) {
      event.preventDefault();
    }
  });
});
