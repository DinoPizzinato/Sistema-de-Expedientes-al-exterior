(function () {
  let avisoSeguridad = null;
  let temporizadorAviso = null;

  function isEditableTarget(target) {
    return Boolean(
      target &&
        target.closest &&
        target.closest(
          'input, textarea, select, option, button, [contenteditable="true"]',
        ),
    );
  }

  function ensureSecurityUi() {
    if (!document.body) return;

    document.body.classList.add("seguridad-activa");

    if (!document.getElementById("marca-uso-interno")) {
      const marca = document.createElement("div");
      marca.id = "marca-uso-interno";
      marca.className = "marca-uso-interno";
      marca.textContent = "Uso interno";
      document.body.appendChild(marca);
    }

    if (!document.getElementById("aviso-seguridad")) {
      avisoSeguridad = document.createElement("div");
      avisoSeguridad.id = "aviso-seguridad";
      avisoSeguridad.className = "aviso-seguridad";
      avisoSeguridad.setAttribute("aria-live", "polite");
      avisoSeguridad.textContent = "Acción restringida por seguridad.";
      document.body.appendChild(avisoSeguridad);
    } else {
      avisoSeguridad = document.getElementById("aviso-seguridad");
    }
  }

  function mostrarAvisoSeguridad(mensaje) {
    if (!avisoSeguridad) {
      ensureSecurityUi();
    }

    if (!avisoSeguridad) return;

    avisoSeguridad.textContent = mensaje;
    avisoSeguridad.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = window.setTimeout(() => {
      avisoSeguridad.classList.remove("visible");
    }, 2400);
  }

  function bloquearAccion(event, mensaje) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    mostrarAvisoSeguridad(mensaje);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureSecurityUi();

    document.addEventListener(
      "contextmenu",
      (event) => {
        if (!isEditableTarget(event.target)) {
          bloquearAccion(event, "El menú contextual está deshabilitado.");
        }
      },
      true,
    );

    document.addEventListener(
      "selectstart",
      (event) => {
        if (!isEditableTarget(event.target)) {
          bloquearAccion(
            event,
            "La selección directa de la página está restringida.",
          );
        }
      },
      true,
    );

    document.addEventListener(
      "dragstart",
      (event) => {
        if (!isEditableTarget(event.target)) {
          event.preventDefault();
        }
      },
      true,
    );

    document.addEventListener(
      "copy",
      (event) => {
        if (!isEditableTarget(event.target) && !isEditableTarget(document.activeElement)) {
          bloquearAccion(event, "La copia directa de la página está restringida.");
        }
      },
      true,
    );

    document.addEventListener(
      "cut",
      (event) => {
        if (!isEditableTarget(event.target) && !isEditableTarget(document.activeElement)) {
          bloquearAccion(event, "La extracción de contenido está restringida.");
        }
      },
      true,
    );

    document.addEventListener(
      "keydown",
      (event) => {
        const key = String(event.key || "").toLowerCase();
        const ctrlOrMeta = event.ctrlKey || event.metaKey;

        if (key === "f12") {
          bloquearAccion(
            event,
            "Las herramientas de inspección están restringidas en esta página.",
          );
          return;
        }

        if (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) {
          bloquearAccion(
            event,
            "Las herramientas de inspección están restringidas en esta página.",
          );
          return;
        }

        if (ctrlOrMeta && ["u", "s", "p"].includes(key)) {
          const mensajes = {
            u: "La visualización directa del código fuente está restringida.",
            s: "La opción de guardado directo de la página está restringida.",
            p: "La impresión directa de la página está restringida.",
          };

          bloquearAccion(event, mensajes[key]);
        }
      },
      true,
    );
  });
})();
