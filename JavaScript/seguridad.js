(function () {
  const CANONICAL_SITE_URL =
    "https://dinopizzinato.github.io/Sistema-de-Expedientes-al-exterior/";
  const ALLOWED_GITHUB_PAGES_HOST = "dinopizzinato.github.io";
  const ALLOWED_GITHUB_PAGES_PATH_PREFIX =
    "/Sistema-de-Expedientes-al-exterior";
  // Si en el futuro usa dominio propio, agregarlo aca.
  const ALLOWED_CUSTOM_HOSTS = new Set([]);
  const ALLOWED_LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
  const ACCESS_STORAGE_VERSION = "v2";
  const ACCESS_STORAGE_KEY = `seccionIntercambioAcceso:${ACCESS_STORAGE_VERSION}`;
  const ACCESS_CONTROL_STORAGE_KEY = `seccionIntercambioControl:${ACCESS_STORAGE_VERSION}`;
  const ACCESS_SESSION_TTL_MS = 30 * 60 * 1000;
  const ACCESS_MAX_FAILED_ATTEMPTS = 5;
  const ACCESS_LOCK_MS = 5 * 60 * 1000;
  // Reemplazar este hash por uno nuevo si desea cambiar la clave.
  const ACCESS_PASSWORD_HASH =
    "3498e0433361c0b3682f3ea5b0316c141bbfc2640e8c7d4a6b23a14a8e975ad1";
  const WATERMARK_TEXT = "USO INTERNO - COPIA RESTRINGIDA";
  const WATERMARK_CELLS = 18;
  let avisoSeguridad = null;
  let temporizadorAviso = null;
  let observadorSeguridad = null;
  let panelAcceso = null;
  let mensajeAcceso = null;
  let campoClaveAcceso = null;
  let botonAcceso = null;
  let botonCerrarSesion = null;
  let temporizadorRefrescoBloqueo = null;
  let temporizadorSesion = null;
  let validandoAcceso = false;
  let ultimoRegistroActividad = 0;
  let origenBloqueado = false;

  function isEditableTarget(target) {
    return Boolean(
      target &&
        target.closest &&
        target.closest(
          "input, textarea, select, option, button, [contenteditable]:not([contenteditable='false'])",
        ),
    );
  }

  function limpiarSeleccion() {
    const seleccion = window.getSelection ? window.getSelection() : null;
    if (seleccion && seleccion.removeAllRanges) {
      seleccion.removeAllRanges();
    }
  }

  function limpiarPortapapeles() {
    if (
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      return;
    }

    navigator.clipboard.writeText("").catch(() => {});
  }

  function normalizarClaveAcceso(value) {
    return String(value || "").normalize("NFKC").trim();
  }

  function pathCoincideConPrefijo(pathname, prefix) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }

  function obtenerEstadoOrigen() {
    const { protocol, hostname, pathname } = window.location;

    if (protocol === "file:") {
      return {
        allowed: false,
        message:
          "Esta copia local fue bloqueada. El sistema solo puede ejecutarse desde el dominio autorizado.",
      };
    }

    if (ALLOWED_LOCAL_HOSTS.has(hostname)) {
      return { allowed: true };
    }

    if (ALLOWED_CUSTOM_HOSTS.has(hostname)) {
      return { allowed: true };
    }

    if (hostname === ALLOWED_GITHUB_PAGES_HOST) {
      if (pathCoincideConPrefijo(pathname, ALLOWED_GITHUB_PAGES_PATH_PREFIX)) {
        return { allowed: true };
      }

      return {
        allowed: false,
        message:
          "La ruta de publicacion no coincide con la autorizada para este sistema.",
      };
    }

    return {
      allowed: false,
      message:
        "Este dominio no esta autorizado para ejecutar el sistema.",
    };
  }

  function leerStorageSeguro(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function escribirStorageSeguro(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removerStorageSeguro(storage, key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      // No hacer nada si el navegador bloquea el storage.
    }
  }

  function obtenerAccesoGuardado() {
    return leerStorageSeguro(window.sessionStorage, ACCESS_STORAGE_KEY);
  }

  function obtenerControlAcceso() {
    const raw = leerStorageSeguro(window.localStorage, ACCESS_CONTROL_STORAGE_KEY);
    if (!raw) {
      return { failedAttempts: 0, lockUntil: 0 };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        failedAttempts: Number(parsed.failedAttempts) || 0,
        lockUntil: Number(parsed.lockUntil) || 0,
      };
    } catch (error) {
      return { failedAttempts: 0, lockUntil: 0 };
    }
  }

  function guardarControlAcceso(control) {
    escribirStorageSeguro(
      window.localStorage,
      ACCESS_CONTROL_STORAGE_KEY,
      JSON.stringify(control),
    );
  }

  function limpiarControlAcceso() {
    removerStorageSeguro(window.localStorage, ACCESS_CONTROL_STORAGE_KEY);
  }

  function obtenerSesionAcceso() {
    const raw = obtenerAccesoGuardado();
    if (!raw) return null;

    if (raw === ACCESS_PASSWORD_HASH) {
      return {
        hash: ACCESS_PASSWORD_HASH,
        authorizedAt: Date.now(),
        lastActivity: Date.now(),
      };
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.hash !== ACCESS_PASSWORD_HASH) {
        return null;
      }

      return {
        hash: parsed.hash,
        authorizedAt: Number(parsed.authorizedAt) || Date.now(),
        lastActivity: Number(parsed.lastActivity) || Date.now(),
      };
    } catch (error) {
      return null;
    }
  }

  function guardarAccesoAutorizado(lastActivity = Date.now()) {
    const payload = {
      hash: ACCESS_PASSWORD_HASH,
      authorizedAt: Date.now(),
      lastActivity,
    };

    const guardado = escribirStorageSeguro(
      window.sessionStorage,
      ACCESS_STORAGE_KEY,
      JSON.stringify(payload),
    );

    if (!guardado) {
      // Si el navegador bloquea storage, la clave quedara valida solo en la pagina actual.
      escribirStorageSeguro(
        window.sessionStorage,
        ACCESS_STORAGE_KEY,
        ACCESS_PASSWORD_HASH,
      );
    }
  }

  function limpiarAccesoAutorizado() {
    removerStorageSeguro(window.sessionStorage, ACCESS_STORAGE_KEY);
  }

  function sesionExpirada(session) {
    if (!session) return true;
    return Date.now() - session.lastActivity > ACCESS_SESSION_TTL_MS;
  }

  function minutosRedondeados(ms) {
    return Math.max(1, Math.ceil(ms / 60000));
  }

  function obtenerBloqueoActivo() {
    const control = obtenerControlAcceso();
    const remainingMs = control.lockUntil - Date.now();

    if (remainingMs > 0) {
      return {
        remainingMs,
        remainingMinutes: minutosRedondeados(remainingMs),
      };
    }

    if (control.lockUntil) {
      limpiarControlAcceso();
    }

    return null;
  }

  function programarActualizacionBloqueo() {
    clearTimeout(temporizadorRefrescoBloqueo);

    const bloqueo = obtenerBloqueoActivo();
    if (!bloqueo) return;

    temporizadorRefrescoBloqueo = window.setTimeout(() => {
      if (panelAcceso) {
        actualizarInterfazAcceso();
      }
    }, Math.min(bloqueo.remainingMs, 15000));
  }

  function reiniciarIntentosFallidos() {
    limpiarControlAcceso();
  }

  function registrarIntentoFallido() {
    const control = obtenerControlAcceso();
    const failedAttempts = control.failedAttempts + 1;

    if (failedAttempts >= ACCESS_MAX_FAILED_ATTEMPTS) {
      guardarControlAcceso({
        failedAttempts: 0,
        lockUntil: Date.now() + ACCESS_LOCK_MS,
      });
      return {
        locked: true,
        remainingMinutes: minutosRedondeados(ACCESS_LOCK_MS),
      };
    }

    guardarControlAcceso({
      failedAttempts,
      lockUntil: 0,
    });

    return {
      locked: false,
      remainingAttempts: ACCESS_MAX_FAILED_ATTEMPTS - failedAttempts,
    };
  }

  function detenerSupervisionSesion() {
    clearInterval(temporizadorSesion);
    temporizadorSesion = null;
  }

  function registrarActividadSesion(force = false) {
    if (!document.body || !document.body.classList.contains("acceso-autorizado")) {
      return;
    }

    const now = Date.now();
    if (!force && now - ultimoRegistroActividad < 15000) {
      return;
    }

    ultimoRegistroActividad = now;
    guardarAccesoAutorizado(now);
  }

  function cerrarSesionProtegida(reasonMessage) {
    limpiarAccesoAutorizado();
    detenerSupervisionSesion();

    if (!document.body) return;

    document.body.classList.remove("acceso-autorizado");
    document.body.classList.add("acceso-bloqueado");
    crearPanelAcceso();
    actualizarInterfazAcceso(reasonMessage || "Ingrese la clave para continuar.");
    if (campoClaveAcceso) {
      campoClaveAcceso.value = "";
      campoClaveAcceso.focus();
    }
  }

  function verificarVencimientoSesion() {
    if (!document.body || !document.body.classList.contains("acceso-autorizado")) {
      return;
    }

    const session = obtenerSesionAcceso();
    if (!session || sesionExpirada(session)) {
      cerrarSesionProtegida(
        "La sesion vencio por inactividad. Ingrese la clave nuevamente.",
      );
    }
  }

  function iniciarSupervisionSesion() {
    detenerSupervisionSesion();
    registrarActividadSesion(true);

    temporizadorSesion = window.setInterval(() => {
      verificarVencimientoSesion();
    }, 30000);
  }

  function asegurarBotonCerrarSesion() {
    if (!document.body || document.getElementById("boton-cerrar-sesion")) return;

    botonCerrarSesion = document.createElement("button");
    botonCerrarSesion.id = "boton-cerrar-sesion";
    botonCerrarSesion.type = "button";
    botonCerrarSesion.className = "boton-cerrar-sesion";
    botonCerrarSesion.textContent = "Cerrar acceso";
    botonCerrarSesion.addEventListener("click", () => {
      cerrarSesionProtegida("El acceso fue cerrado manualmente.");
    });
    document.body.appendChild(botonCerrarSesion);
  }

  function mostrarPanelBloqueoOrigen(message) {
    if (!document.body) return;

    cerrarPanelAcceso();
    origenBloqueado = true;
    document.body.classList.add("acceso-bloqueado");
    document.body.classList.remove("acceso-autorizado");

    panelAcceso = document.createElement("div");
    panelAcceso.className = "panel-acceso-global";
    panelAcceso.id = "panel-acceso-global";

    panelAcceso.innerHTML = `
      <div class="tarjeta-acceso-global" role="dialog" aria-modal="true" aria-labelledby="bloqueo-origen-titulo">
        <div class="acceso-etiqueta">Dominio protegido</div>
        <h1 id="bloqueo-origen-titulo" class="acceso-titulo">Ejecucion bloqueada</h1>
        <p class="acceso-texto">
          ${message}
        </p>
        <p class="mensaje-acceso-global error" aria-live="polite">
          Este contenido no puede reutilizarse fuera del entorno autorizado.
        </p>
        <a class="boton-enlace-acceso-global" href="${CANONICAL_SITE_URL}">
          IR AL SITIO AUTORIZADO
        </a>
      </div>
    `;

    document.body.appendChild(panelAcceso);
  }

  function asegurarOrigenAutorizado() {
    const estadoOrigen = obtenerEstadoOrigen();
    if (estadoOrigen.allowed) {
      origenBloqueado = false;
      return true;
    }

    mostrarPanelBloqueoOrigen(estadoOrigen.message);
    return false;
  }

  function actualizarInterfazAcceso(mensajePorDefecto) {
    if (origenBloqueado) {
      return true;
    }

    if (!campoClaveAcceso || !botonAcceso) {
      return false;
    }

    const bloqueo = obtenerBloqueoActivo();
    if (bloqueo) {
      campoClaveAcceso.disabled = true;
      botonAcceso.disabled = true;
      actualizarMensajeAcceso(
        `Demasiados intentos fallidos. Espere ${bloqueo.remainingMinutes} minuto(s) antes de volver a intentar.`,
        true,
      );
      programarActualizacionBloqueo();
      return true;
    }

    clearTimeout(temporizadorRefrescoBloqueo);
    campoClaveAcceso.disabled = false;
    botonAcceso.disabled = validandoAcceso;

    if (mensajePorDefecto) {
      actualizarMensajeAcceso(mensajePorDefecto, false);
    }
  }

  function tieneAccesoAutorizado() {
    const session = obtenerSesionAcceso();
    if (!session || sesionExpirada(session)) {
      limpiarAccesoAutorizado();
      return false;
    }

    return session.hash === ACCESS_PASSWORD_HASH;
  }

  async function calcularHashSha256(value) {
    const bytes = new TextEncoder().encode(String(value || ""));
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  function actualizarMensajeAcceso(mensaje, isError = false) {
    if (!mensajeAcceso) return;

    mensajeAcceso.textContent = mensaje;
    mensajeAcceso.classList.toggle("error", Boolean(isError));
  }

  function cerrarPanelAcceso() {
    clearTimeout(temporizadorRefrescoBloqueo);

    if (panelAcceso) {
      panelAcceso.remove();
    }

    panelAcceso = null;
    mensajeAcceso = null;
    campoClaveAcceso = null;
    botonAcceso = null;
  }

  function habilitarContenidoProtegido() {
    if (!document.body) return;

    document.body.classList.remove("acceso-bloqueado");
    document.body.classList.add("acceso-autorizado");
    reiniciarIntentosFallidos();
    guardarAccesoAutorizado(Date.now());
    cerrarPanelAcceso();
    iniciarSupervisionSesion();
  }

  async function validarAcceso(event) {
    event.preventDefault();

    if (!campoClaveAcceso || !botonAcceso) return;

    if (obtenerBloqueoActivo()) {
      actualizarInterfazAcceso();
      return;
    }

    const clave = normalizarClaveAcceso(campoClaveAcceso.value);

    if (!clave) {
      actualizarMensajeAcceso("Ingrese la clave para continuar.", true);
      campoClaveAcceso.focus();
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      actualizarMensajeAcceso(
        "Este navegador no soporta la verificacion segura de clave.",
        true,
      );
      return;
    }

    validandoAcceso = true;
    botonAcceso.disabled = true;
    actualizarMensajeAcceso("Verificando clave...", false);

    try {
      const hashIngresado = await calcularHashSha256(clave);

      if (hashIngresado === ACCESS_PASSWORD_HASH) {
        habilitarContenidoProtegido();
        return;
      }

      const intento = registrarIntentoFallido();

      if (intento.locked) {
        actualizarInterfazAcceso();
      } else {
        actualizarMensajeAcceso(
          `Clave incorrecta. Le quedan ${intento.remainingAttempts} intento(s).`,
          true,
        );
      }

      campoClaveAcceso.select();
    } catch (error) {
      actualizarMensajeAcceso("No se pudo validar la clave.", true);
    } finally {
      validandoAcceso = false;
      if (botonAcceso) {
        botonAcceso.disabled = false;
      }
      actualizarInterfazAcceso();
    }
  }

  function crearPanelAcceso() {
    if (!document.body || panelAcceso) return;

    panelAcceso = document.createElement("div");
    panelAcceso.className = "panel-acceso-global";
    panelAcceso.id = "panel-acceso-global";

    panelAcceso.innerHTML = `
      <div class="tarjeta-acceso-global" role="dialog" aria-modal="true" aria-labelledby="acceso-titulo">
        <div class="acceso-etiqueta">Acceso protegido</div>
        <h1 id="acceso-titulo" class="acceso-titulo">Seccion INTERCAMBIO</h1>
        <p class="acceso-texto">
          Este sitio requiere una clave de ingreso para habilitar su contenido.
        </p>
        <form class="formulario-acceso-global">
          <label class="etiqueta-acceso" for="clave-acceso-global">Clave</label>
          <input
            id="clave-acceso-global"
            class="campo-acceso-global"
            name="clave"
            type="password"
            inputmode="text"
            autocomplete="current-password"
            placeholder="Ingrese la clave"
            required
          />
          <button type="submit" class="boton-acceso-global">INGRESAR</button>
          <p class="mensaje-acceso-global" aria-live="polite">
            Ingrese la clave para continuar.
          </p>
        </form>
      </div>
    `;

    document.body.appendChild(panelAcceso);

    const formulario = panelAcceso.querySelector(".formulario-acceso-global");
    campoClaveAcceso = panelAcceso.querySelector("#clave-acceso-global");
    botonAcceso = panelAcceso.querySelector(".boton-acceso-global");
    mensajeAcceso = panelAcceso.querySelector(".mensaje-acceso-global");

    if (formulario) {
      formulario.addEventListener("submit", validarAcceso);
    }

    actualizarInterfazAcceso("Ingrese la clave para continuar.");

    window.setTimeout(() => {
      if (campoClaveAcceso && !campoClaveAcceso.disabled) {
        campoClaveAcceso.focus();
      }
    }, 50);
  }

  function asegurarAccesoProtegido() {
    if (!document.body) return;

    if (origenBloqueado) {
      return;
    }

    if (tieneAccesoAutorizado()) {
      habilitarContenidoProtegido();
      return;
    }

    document.body.classList.add("acceso-bloqueado");
    crearPanelAcceso();
  }

  function asegurarEnlacesExternos(root) {
    if (!root || !root.querySelectorAll) return;

    root.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
      const relActual = new Set(
        String(anchor.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean),
      );
      relActual.add("noopener");
      relActual.add("noreferrer");
      relActual.add("nofollow");
      anchor.setAttribute("rel", Array.from(relActual).join(" "));
    });
  }

  function endurecerRecursosVisuales(root) {
    if (!root || !root.querySelectorAll) return;

    root.querySelectorAll("img, svg, canvas").forEach((element) => {
      element.setAttribute("draggable", "false");
      element.setAttribute("data-protegido", "true");
    });
  }

  function aplicarEndurecimiento(root = document) {
    asegurarEnlacesExternos(root);
    endurecerRecursosVisuales(root);
  }

  function crearTramaSeguridad() {
    if (document.getElementById("trama-uso-interno")) return;

    const trama = document.createElement("div");
    trama.id = "trama-uso-interno";
    trama.className = "trama-uso-interno";
    trama.setAttribute("aria-hidden", "true");

    for (let i = 0; i < WATERMARK_CELLS; i += 1) {
      const celda = document.createElement("span");
      celda.textContent = WATERMARK_TEXT;
      trama.appendChild(celda);
    }

    document.body.appendChild(trama);
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

    asegurarBotonCerrarSesion();
    crearTramaSeguridad();

    if (!document.getElementById("aviso-seguridad")) {
      avisoSeguridad = document.createElement("div");
      avisoSeguridad.id = "aviso-seguridad";
      avisoSeguridad.className = "aviso-seguridad";
      avisoSeguridad.setAttribute("aria-live", "polite");
      avisoSeguridad.textContent = "Accion restringida por seguridad.";
      document.body.appendChild(avisoSeguridad);
    } else {
      avisoSeguridad = document.getElementById("aviso-seguridad");
    }

    aplicarEndurecimiento(document);
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
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    if (event && event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }

    limpiarSeleccion();
    mostrarAvisoSeguridad(mensaje);
  }

  function vigilarNuevosNodos() {
    if (observadorSeguridad || typeof MutationObserver !== "function") {
      return;
    }

    observadorSeguridad = new MutationObserver((mutaciones) => {
      mutaciones.forEach((mutacion) => {
        mutacion.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          aplicarEndurecimiento(node);
        });
      });
    });

    observadorSeguridad.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureSecurityUi();
    if (!asegurarOrigenAutorizado()) {
      return;
    }
    asegurarAccesoProtegido();
    vigilarNuevosNodos();
    document.addEventListener("pointerdown", () => registrarActividadSesion());
    document.addEventListener("keydown", () => registrarActividadSesion());
    document.addEventListener("focusin", () => registrarActividadSesion());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        verificarVencimientoSesion();
        registrarActividadSesion(true);
      }
    });
    window.addEventListener("focus", () => {
      verificarVencimientoSesion();
      registrarActividadSesion(true);
    });

    document.addEventListener(
      "contextmenu",
      (event) => {
        if (!isEditableTarget(event.target)) {
          bloquearAccion(event, "El menu contextual esta deshabilitado.");
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
            "La seleccion directa de la pagina esta restringida.",
          );
        }
      },
      true,
    );

    document.addEventListener(
      "dragstart",
      (event) => {
        if (!isEditableTarget(event.target)) {
          bloquearAccion(event, "El arrastre de contenido esta restringido.");
        }
      },
      true,
    );

    document.addEventListener(
      "copy",
      (event) => {
        if (
          !isEditableTarget(event.target) &&
          !isEditableTarget(document.activeElement)
        ) {
          limpiarPortapapeles();
          bloquearAccion(event, "La copia directa de la pagina esta restringida.");
        }
      },
      true,
    );

    document.addEventListener(
      "cut",
      (event) => {
        if (
          !isEditableTarget(event.target) &&
          !isEditableTarget(document.activeElement)
        ) {
          limpiarPortapapeles();
          bloquearAccion(event, "La extraccion de contenido esta restringida.");
        }
      },
      true,
    );

    document.addEventListener(
      "keydown",
      (event) => {
        const key = String(event.key || "").toLowerCase();
        const ctrlOrMeta = event.ctrlKey || event.metaKey;
        const editable =
          isEditableTarget(event.target) ||
          isEditableTarget(document.activeElement);

        if (key === "printscreen") {
          limpiarPortapapeles();
          bloquearAccion(
            event,
            "La captura automatica de pantalla esta restringida.",
          );
          return;
        }

        if (key === "f12") {
          bloquearAccion(
            event,
            "Las herramientas de inspeccion estan restringidas en esta pagina.",
          );
          return;
        }

        if (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) {
          bloquearAccion(
            event,
            "Las herramientas de inspeccion estan restringidas en esta pagina.",
          );
          return;
        }

        if (ctrlOrMeta && event.altKey && key === "i") {
          bloquearAccion(
            event,
            "Las herramientas de inspeccion estan restringidas en esta pagina.",
          );
          return;
        }

        if (!editable && ctrlOrMeta && ["a", "c", "x"].includes(key)) {
          const mensajes = {
            a: "La seleccion completa de la pagina esta restringida.",
            c: "La copia directa de la pagina esta restringida.",
            x: "La extraccion de contenido esta restringida.",
          };

          if (key !== "a") {
            limpiarPortapapeles();
          }

          bloquearAccion(event, mensajes[key]);
          return;
        }

        if (!editable && event.ctrlKey && key === "insert") {
          limpiarPortapapeles();
          bloquearAccion(event, "La copia directa de la pagina esta restringida.");
          return;
        }

        if (!editable && event.shiftKey && key === "delete") {
          limpiarPortapapeles();
          bloquearAccion(event, "La extraccion de contenido esta restringida.");
          return;
        }

        if (ctrlOrMeta && ["u", "s", "p"].includes(key)) {
          const mensajes = {
            u: "La visualizacion directa del codigo fuente esta restringida.",
            s: "La opcion de guardado directo de la pagina esta restringida.",
            p: "La impresion directa de la pagina esta restringida.",
          };

          bloquearAccion(event, mensajes[key]);
        }
      },
      true,
    );
  });
})();
