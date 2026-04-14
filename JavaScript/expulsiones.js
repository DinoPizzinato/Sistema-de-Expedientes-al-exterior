document.addEventListener("DOMContentLoaded", () => {
  const contenedorFuncionarios = document.getElementById(
    "contenedor-funcionarios",
  );
  const templateFuncionario = document.getElementById("template-funcionario");
  const btnAgregarFuncionario = document.getElementById(
    "btn-agregar-funcionario",
  );
  const btnEliminarFuncionario = document.getElementById(
    "btn-eliminar-funcionario",
  );
  const selectorFuncionarioEliminar = document.getElementById(
    "selector-funcionario-eliminar",
  );
  const btnGenerarWord = document.getElementById("btn-generar-word");
  const burbujaConversorAduana = document.getElementById(
    "burbuja-conversor-aduana",
  );

  const bloqueTotales = document.getElementById("bloque-totales");
  const filaTotalesPrincipales = document.getElementById(
    "fila-totales-principales",
  );
  const campoTotalPasajesContenedor = document.getElementById(
    "campo-total-pasajes-contenedor",
  );
  const totalPasajes = document.getElementById("total-pasajes");
  const totalViaticos = document.getElementById("total-viaticos");
  const totalAlojamiento = document.getElementById("total-alojamiento");
  const totalCobertura = document.getElementById("total-cobertura");
  const totalGeneral = document.getElementById("total-general");
  const modalAviso = document.getElementById("modal-aviso");
  const modalAvisoTitulo = document.getElementById("modal-aviso-titulo");
  const modalAvisoMensaje = document.getElementById("modal-aviso-mensaje");
  const btnCerrarModalAviso = document.getElementById("modal-aviso-cerrar");
  const btnAceptarModalAviso = document.getElementById("modal-aviso-aceptar");

  const BURBUJA_ADUANA_STORAGE_KEY = "expulsionesBurbujaAduanaPos";
  let ultimoElementoActivo = null;
  let arrastreBurbujaAduana = null;
  let bloquearClickBurbujaAduana = false;

  const TARIFAS = {
    A: {
      1: { viaticos: 119, alojamiento: 315, moneda: "USD" },
      2: { viaticos: 144, alojamiento: 388, moneda: "USD" },
      3: { viaticos: 138, alojamiento: 388, moneda: "EUR" },
    },
    B: {
      1: { viaticos: 102, alojamiento: 268, moneda: "USD" },
      2: { viaticos: 123, alojamiento: 330, moneda: "USD" },
      3: { viaticos: 117, alojamiento: 330, moneda: "EUR" },
    },
    C: {
      1: { viaticos: 87, alojamiento: 228, moneda: "USD" },
      2: { viaticos: 105, alojamiento: 281, moneda: "USD" },
      3: { viaticos: 100, alojamiento: 281, moneda: "EUR" },
    },
    D: {
      1: { viaticos: 74, alojamiento: 194, moneda: "USD" },
      2: { viaticos: 89, alojamiento: 239, moneda: "USD" },
      3: { viaticos: 85, alojamiento: 239, moneda: "EUR" },
    },
  };

  const JERARQUIA_A_GRUPO = {
    jefe_policia: "A",
    subjefe_policia: "B",
    comisario_general: "C",
    comisario_mayor: "C",
    comisario_inspector: "D",
    comisario: "D",
    subcomisario: "D",
    principal: "D",
    inspector: "D",
    subinspector: "D",
    ayudante: "D",
    suboficial_mayor: "D",
    suboficial_auxiliar: "D",
    suboficial_escribiente: "D",
    sargento_primero: "D",
    sargento: "D",
    cabo_primero: "D",
    cabo: "D",
    agente: "D",
    auxiliar_superior_primera: "D",
    auxiliar_superior_segunda: "D",
    auxiliar_superior_tercera: "D",
    auxiliar_superior_cuarta: "D",
    auxiliar_superior_quinta: "D",
    auxiliar_superior_sexta: "D",
    auxiliar_primera: "D",
    auxiliar_segunda: "D",
    auxiliar_tercera: "D",
    auxiliar_cuarta: "D",
    auxiliar_quinta: "D",
    auxiliar_sexta: "D",
    oficial_inteligencia_1: "D",
    auxiliar_inteligencia_1: "D",
  };

  const PAISES_ZONA_1 = new Set([
    "República Argentina",
    "Estado Plurinacional de Bolivia",
    "República Federativa del Brasil",
    "República de Chile",
    "República de Colombia",
    "República del Ecuador",
    "República Cooperativa de Guyana",
    "República del Paraguay",
    "República del Perú",
    "República Oriental del Uruguay",
    "República Bolivariana de Venezuela",
    "República de Surinam",
    "República de Belice",
    "República de Costa Rica",
    "República de El Salvador",
    "República de Guatemala",
    "República de Honduras",
    "República de Nicaragua",
    "República de Panamá",
    "República Dominicana",
    "República de Cuba",
    "República de Haití",
    "Jamaica",
    "Antigua y Barbuda",
    "Mancomunidad de las Bahamas",
    "Barbados",
    "Granada",
    "Federación de San Cristóbal y Nieves",
    "Santa Lucía",
    "San Vicente y las Granadinas",
    "República de Trinidad y Tobago",
  ]);

  const PAISES_ZONA_2 = new Set([
    "Canadá",
    "Estados Unidos de América",
    "Estados Unidos Mexicanos",
  ]);

  const ALIAS_PAISES_ZONA_1 = [
    "Argentina",
    "Bolivia",
    "Brasil",
    "Brazil",
    "Chile",
    "Colombia",
    "Ecuador",
    "Guyana",
    "Paraguay",
    "Peru",
    "Uruguay",
    "Venezuela",
    "Surinam",
    "Suriname",
    "Belice",
    "Costa Rica",
    "El Salvador",
    "Guatemala",
    "Honduras",
    "Nicaragua",
    "Panama",
    "Republica Dominicana",
    "Dominicana",
    "Cuba",
    "Haiti",
    "Jamaica",
    "Antigua y Barbuda",
    "Bahamas",
    "Barbados",
    "Granada",
    "San Cristobal y Nieves",
    "Saint Kitts and Nevis",
    "Santa Lucia",
    "San Vicente y las Granadinas",
    "Trinidad y Tobago",
  ];

  const ALIAS_PAISES_ZONA_2 = [
    "Canada",
    "Estados Unidos",
    "EEUU",
    "EE. UU.",
    "USA",
    "United States",
    "Mexico",
  ];

  const PAISES_ZONA_1_NORMALIZADOS = new Set(
    [...PAISES_ZONA_1, ...ALIAS_PAISES_ZONA_1].map(normalizarTexto),
  );

  const PAISES_ZONA_2_NORMALIZADOS = new Set(
    [...PAISES_ZONA_2, ...ALIAS_PAISES_ZONA_2].map(normalizarTexto),
  );

  function formatMoney(value, currency) {
    const n = Number(value || 0);
    return `${new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)} ${currency}`;
  }

  function toNumber(value) {
    return Number(value || 0);
  }

  function agregarTotalPorMoneda(totales, moneda, valor) {
    const amount = toNumber(valor);
    const currency = String(moneda || "").trim().toUpperCase() || "USD";

    if (amount <= 0) return;
    totales[currency] = (totales[currency] || 0) + amount;
  }

  function tieneTotales(totales) {
    return Object.values(totales).some((valor) => toNumber(valor) > 0);
  }

  function formatearTotalesPorMoneda(totales) {
    const partes = Object.entries(totales)
      .filter(([, valor]) => toNumber(valor) > 0)
      .sort(([monedaA], [monedaB]) => monedaA.localeCompare(monedaB))
      .map(([moneda, valor]) => formatMoney(valor, moneda));

    return partes.join(" + ");
  }

  function cerrarAviso() {
    if (!modalAviso || modalAviso.classList.contains("oculto")) return;

    modalAviso.classList.add("oculto");
    modalAviso.classList.remove(
      "modal-aviso--info",
      "modal-aviso--success",
      "modal-aviso--error",
    );
    modalAviso.setAttribute("aria-hidden", "true");

    if (
      ultimoElementoActivo &&
      typeof ultimoElementoActivo.focus === "function"
    ) {
      ultimoElementoActivo.focus();
    }

    ultimoElementoActivo = null;
  }

  function mostrarAviso(mensaje, opciones = {}) {
    if (!modalAviso) return;

    const { titulo = "Aviso", tipo = "info" } = opciones;

    ultimoElementoActivo = document.activeElement;
    modalAvisoTitulo.textContent = titulo;
    modalAvisoMensaje.textContent = mensaje;
    modalAviso.classList.remove("oculto");
    modalAviso.classList.remove(
      "modal-aviso--info",
      "modal-aviso--success",
      "modal-aviso--error",
    );
    modalAviso.classList.add(`modal-aviso--${tipo}`);
    modalAviso.setAttribute("aria-hidden", "false");
    btnAceptarModalAviso.focus();
  }

  if (btnCerrarModalAviso) {
    btnCerrarModalAviso.addEventListener("click", cerrarAviso);
  }

  if (btnAceptarModalAviso) {
    btnAceptarModalAviso.addEventListener("click", cerrarAviso);
  }

  if (modalAviso) {
    modalAviso.addEventListener("click", (event) => {
      if (event.target === modalAviso) {
        cerrarAviso();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarAviso();
    }
  });

  function obtenerResumenTotalesGenerales() {
    const formularios = document.querySelectorAll(".bloque-funcionario");
    const resumen = {
      pasajes: {},
      viaticos: {},
      alojamiento: {},
      cobertura: {},
      general: {},
    };

    formularios.forEach((formulario) => {
      const moneda =
        formulario.querySelector(".campo-moneda").value.trim().toUpperCase() ||
        "USD";
      const totalPasajesFormulario = toNumber(formulario.dataset.totalPasajes);
      const totalViaticosFormulario = toNumber(formulario.dataset.totalViaticos);
      const totalAlojamientoFormulario = toNumber(
        formulario.dataset.totalAlojamiento,
      );
      const totalCoberturaFormulario = toNumber(
        formulario.dataset.totalCobertura,
      );

      agregarTotalPorMoneda(resumen.pasajes, moneda, totalPasajesFormulario);
      agregarTotalPorMoneda(resumen.viaticos, moneda, totalViaticosFormulario);
      agregarTotalPorMoneda(
        resumen.alojamiento,
        moneda,
        totalAlojamientoFormulario,
      );
      agregarTotalPorMoneda(
        resumen.cobertura,
        moneda,
        totalCoberturaFormulario,
      );
      agregarTotalPorMoneda(
        resumen.general,
        moneda,
        totalPasajesFormulario +
          totalViaticosFormulario +
          totalAlojamientoFormulario +
          totalCoberturaFormulario,
      );
    });

    return resumen;
  }

  function normalizarTexto(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[./,()-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function obtenerZonaPorPais(pais) {
    const limpio = normalizarTexto(pais);
    if (!limpio) return "";
    if (PAISES_ZONA_1_NORMALIZADOS.has(limpio)) return 1;
    if (PAISES_ZONA_2_NORMALIZADOS.has(limpio)) return 2;
    return 3;
  }

  function obtenerGrupoPorJerarquia(jerarquia) {
    return JERARQUIA_A_GRUPO[jerarquia] || "";
  }

  function esJerarquiaInteligencia(jerarquia) {
    return (
      jerarquia === "oficial_inteligencia_1" ||
      jerarquia === "auxiliar_inteligencia_1"
    );
  }

  function limitarNumero(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
  }

  function obtenerLimitesBurbujaAduana() {
    if (!burbujaConversorAduana) return null;

    const rect = burbujaConversorAduana.getBoundingClientRect();
    const margen = window.innerWidth <= 1100 ? 10 : 12;

    return {
      margen,
      maxLeft: Math.max(margen, window.innerWidth - rect.width - margen),
      maxTop: Math.max(margen, window.innerHeight - rect.height - margen),
    };
  }

  function fijarPosicionBurbujaAduana(left, top) {
    if (!burbujaConversorAduana) return;

    const limites = obtenerLimitesBurbujaAduana();
    if (!limites) return;

    burbujaConversorAduana.style.left = `${limitarNumero(
      left,
      limites.margen,
      limites.maxLeft,
    )}px`;
    burbujaConversorAduana.style.top = `${limitarNumero(
      top,
      limites.margen,
      limites.maxTop,
    )}px`;
    burbujaConversorAduana.style.right = "auto";
    burbujaConversorAduana.style.bottom = "auto";
  }

  function guardarPosicionBurbujaAduana() {
    if (!burbujaConversorAduana?.style.left || !burbujaConversorAduana?.style.top) {
      return;
    }

    try {
      localStorage.setItem(
        BURBUJA_ADUANA_STORAGE_KEY,
        JSON.stringify({
          left: parseFloat(burbujaConversorAduana.style.left),
          top: parseFloat(burbujaConversorAduana.style.top),
        }),
      );
    } catch (error) {
      console.warn("No se pudo guardar la posiciÃ³n de la burbuja.", error);
    }
  }

  function restaurarPosicionBurbujaAduana() {
    if (!burbujaConversorAduana) return;

    try {
      const guardada = JSON.parse(
        localStorage.getItem(BURBUJA_ADUANA_STORAGE_KEY) || "null",
      );

      if (
        guardada &&
        Number.isFinite(guardada.left) &&
        Number.isFinite(guardada.top)
      ) {
        fijarPosicionBurbujaAduana(guardada.left, guardada.top);
      }
    } catch (error) {
      console.warn("No se pudo restaurar la posiciÃ³n de la burbuja.", error);
    }
  }

  function iniciarArrastreBurbujaAduana(event) {
    if (!burbujaConversorAduana) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const rect = burbujaConversorAduana.getBoundingClientRect();
    fijarPosicionBurbujaAduana(rect.left, rect.top);

    arrastreBurbujaAduana = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      originX: event.clientX,
      originY: event.clientY,
      moved: false,
    };

    burbujaConversorAduana.classList.add("arrastrando");
    burbujaConversorAduana.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moverBurbujaAduana(event) {
    if (!arrastreBurbujaAduana || event.pointerId !== arrastreBurbujaAduana.pointerId) {
      return;
    }

    if (
      Math.abs(event.clientX - arrastreBurbujaAduana.originX) > 4 ||
      Math.abs(event.clientY - arrastreBurbujaAduana.originY) > 4
    ) {
      arrastreBurbujaAduana.moved = true;
    }

    fijarPosicionBurbujaAduana(
      event.clientX - arrastreBurbujaAduana.offsetX,
      event.clientY - arrastreBurbujaAduana.offsetY,
    );
    event.preventDefault();
  }

  function terminarArrastreBurbujaAduana(event) {
    if (!arrastreBurbujaAduana || event.pointerId !== arrastreBurbujaAduana.pointerId) {
      return;
    }

    const movio = arrastreBurbujaAduana.moved;
    arrastreBurbujaAduana = null;
    burbujaConversorAduana?.classList.remove("arrastrando");

    try {
      burbujaConversorAduana?.releasePointerCapture?.(event.pointerId);
    } catch (error) {
      console.warn("No se pudo liberar el arrastre de la burbuja.", error);
    }

    guardarPosicionBurbujaAduana();

    if (movio) {
      bloquearClickBurbujaAduana = true;
      window.setTimeout(() => {
        bloquearClickBurbujaAduana = false;
      }, 0);
    }
  }

  function ajustarBurbujaAduanaAlViewport() {
    if (!burbujaConversorAduana?.style.left || !burbujaConversorAduana?.style.top) {
      return;
    }

    fijarPosicionBurbujaAduana(
      parseFloat(burbujaConversorAduana.style.left),
      parseFloat(burbujaConversorAduana.style.top),
    );
  }

  function inicializarBurbujaConversorAduana() {
    if (!burbujaConversorAduana) return;

    restaurarPosicionBurbujaAduana();

    burbujaConversorAduana.addEventListener(
      "pointerdown",
      iniciarArrastreBurbujaAduana,
    );
    burbujaConversorAduana.addEventListener("pointermove", moverBurbujaAduana);
    burbujaConversorAduana.addEventListener(
      "pointerup",
      terminarArrastreBurbujaAduana,
    );
    burbujaConversorAduana.addEventListener(
      "pointercancel",
      terminarArrastreBurbujaAduana,
    );
    burbujaConversorAduana.addEventListener("click", (event) => {
      if (!bloquearClickBurbujaAduana) return;

      event.preventDefault();
      event.stopPropagation();
      bloquearClickBurbujaAduana = false;
    });

    window.addEventListener("resize", ajustarBurbujaAduanaAlViewport);
  }

  function crearBloqueUbicacion(valores = {}) {
    const div = document.createElement("div");
    div.className = "ubicacion-item";
    div.innerHTML = `
      <div class="fila fila-dos">
        <div class="campo">
          <label>Ciudad</label>
          <input type="text" class="campo-ciudad" />
        </div>

        <div class="campo">
          <label>País</label>
          <input type="text" class="campo-pais" />
        </div>
      </div>
    `;

    div.querySelector(".campo-ciudad").value = valores.ciudad || "";
    div.querySelector(".campo-pais").value = valores.pais || "";
    return div;
  }

  function registrarEventosUbicacion(formulario, bloque) {
    bloque.querySelector(".campo-pais").addEventListener("input", () => {
      actualizarLiquidacionAutomatica(formulario);
      actualizarTotalesGenerales();
    });
  }

  function agregarBloqueUbicacion(formulario, valores = {}) {
    const contUbic = formulario.querySelector(".contenedor-ubicaciones");
    const bloque = crearBloqueUbicacion(valores);
    registrarEventosUbicacion(formulario, bloque);
    contUbic.appendChild(bloque);
    return bloque;
  }

  function obtenerUbicacionesFormulario(formulario) {
    return Array.from(formulario.querySelectorAll(".ubicacion-item")).map(
      (item) => ({
        ciudad: item.querySelector(".campo-ciudad").value.trim(),
        pais: item.querySelector(".campo-pais").value.trim(),
      }),
    );
  }

  function normalizarCamposFuncionario(formulario) {
    const filaDestino = formulario.querySelector(".campo-destino")?.closest(".fila");
    const etiquetaJuez = document
      .getElementById("juez-cargo")
      ?.closest(".campo")
      ?.querySelector("label");
    const etiquetaSecretario = document
      .getElementById("secretaria-cargo")
      ?.closest(".campo")
      ?.querySelector("label");

    if (filaDestino) {
      filaDestino.classList.remove("fila-dos");
      filaDestino.classList.add("fila-uno");
    }

    if (etiquetaJuez) {
      etiquetaJuez.textContent = "Juez (opcional)";
    }

    if (etiquetaSecretario) {
      etiquetaSecretario.textContent = "Secretario/a (opcional)";
    }

    formulario
      .querySelectorAll('.multiselect[data-nombre="transporte"] input[type="checkbox"]')
      .forEach((checkbox) => {
        if (normalizarTexto(checkbox.value).includes("avi")) {
          checkbox.value = "Avión";
          const texto = checkbox.closest("label")?.querySelector("span");
          if (texto) texto.textContent = "Avión";
        }
      });
  }

  function copiarDatosCompartidos(origen, destino) {
    if (!origen || !destino) return;

    const ubicaciones = obtenerUbicacionesFormulario(origen).filter(
      (ubicacion) => ubicacion.ciudad || ubicacion.pais,
    );
    const contenedorUbicaciones = destino.querySelector(".contenedor-ubicaciones");
    const gastosOrigen = obtenerValoresMultiselect(
      origen.querySelector('.multiselect[data-nombre="gastos"]'),
    );
    const valorConversionOrigen =
      origen.querySelector(".campo-valor-9usd-eur")?.value || "";
    const montoPasajesOrigen =
      origen.querySelector(
        '.monto-gasto-item[data-gasto="Pasajes"] .campo-monto-manual',
      )?.value || "";

    [
      ".campo-fecha-inicio",
      ".campo-fecha-fin",
      ".campo-hora-salida",
      ".campo-hora-llegada",
    ].forEach((selector) => {
      destino.querySelector(selector).value = origen.querySelector(selector).value;
    });

    contenedorUbicaciones.innerHTML = "";
    (ubicaciones.length ? ubicaciones : [{}]).forEach((ubicacion) => {
      agregarBloqueUbicacion(destino, ubicacion);
    });
    actualizarEstadoEliminarUbicacion(destino);

    destino.querySelector(".campo-valor-9usd-eur").value = valorConversionOrigen;
    destino
      .querySelectorAll('.multiselect[data-nombre="gastos"] input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = gastosOrigen.includes(checkbox.value);
      });
    actualizarTextoMultiselect(
      destino.querySelector('.multiselect[data-nombre="gastos"]'),
    );
    recalcularBloqueMontos(destino);

    const campoPasajesDestino = destino.querySelector(
      '.monto-gasto-item[data-gasto="Pasajes"] .campo-monto-manual',
    );
    if (campoPasajesDestino) {
      campoPasajesDestino.value = montoPasajesOrigen;
    }

    actualizarDuracion(destino);
    actualizarLiquidacionAutomatica(destino);
  }

  function crearBloqueMontoGasto(nombreGasto) {
    const div = document.createElement("div");
    div.className = "monto-gasto-item";
    div.dataset.gasto = nombreGasto;

    if (nombreGasto === "Pasajes") {
      div.innerHTML = `
        <div class="fila fila-dos">
          <div class="campo">
            <label>Monto ${nombreGasto}</label>
            <input type="number" min="0" step="0.01" class="campo-monto-manual" />
          </div>

          <div class="campo">
            <label>Detalle</label>
            <input type="text" class="campo-detalle-gasto" readonly value="Carga manual" />
          </div>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="fila fila-dos">
          <div class="campo">
            <label>Total ${nombreGasto}</label>
            <input type="text" class="campo-monto-automatico" readonly />
          </div>

          <div class="campo">
            <label>Detalle</label>
            <input type="text" class="campo-detalle-gasto" readonly />
          </div>
        </div>
      `;
    }

    return div;
  }

  function obtenerDiasCalendario(formulario) {
    const inicio = formulario.querySelector(".campo-fecha-inicio").value;
    const fin = formulario.querySelector(".campo-fecha-fin").value;

    if (!inicio || !fin) return 0;

    const d1 = new Date(inicio + "T00:00:00");
    const d2 = new Date(fin + "T00:00:00");
    if (d2 < d1) return 0;

    return Math.floor((d2 - d1) / 86400000) + 1;
  }

  function obtenerDiasComputables(formulario) {
    const inicio = formulario.querySelector(".campo-fecha-inicio").value;
    const fin = formulario.querySelector(".campo-fecha-fin").value;
    const hsSalida = formulario.querySelector(".campo-hora-salida").value;
    const hsLlegada = formulario.querySelector(".campo-hora-llegada").value;

    if (!inicio || !fin || !hsSalida || !hsLlegada) return 0;

    const d1 = new Date(inicio + "T00:00:00");
    const d2 = new Date(fin + "T00:00:00");
    if (d2 < d1) return 0;

    const dias = Math.floor((d2 - d1) / 86400000) + 1;

    if (dias === 1) {
      if (hsSalida < "12:00" || hsLlegada >= "12:00") return 1;
      return 0.5;
    }

    let total = 0;
    total += hsSalida < "12:00" ? 1 : 0.5;
    total += hsLlegada >= "12:00" ? 1 : 0.5;
    total += Math.max(0, dias - 2);
    return total;
  }

  function calcularNochesAlojamiento(formulario) {
    const inicio = formulario.querySelector(".campo-fecha-inicio").value;
    const fin = formulario.querySelector(".campo-fecha-fin").value;
    const hsLlegada = formulario.querySelector(".campo-hora-llegada").value;

    if (!inicio || !fin || !hsLlegada) return 0;

    const d1 = new Date(inicio + "T00:00:00");
    const d2 = new Date(fin + "T00:00:00");
    if (d2 <= d1) return 0;

    let noches = Math.floor((d2 - d1) / 86400000);

    if (hsLlegada < "06:00") {
      noches -= 1;
    }

    if (noches < 0) noches = 0;
    return noches;
  }

  function actualizarDuracion(formulario) {
    const campo = formulario.querySelector(".campo-duracion");
    const dias = obtenerDiasCalendario(formulario);
    campo.value = dias ? `${dias} ${dias === 1 ? "día" : "días"}` : "";
  }

  function actualizarCamposInteligencia(formulario) {
    const jerarquia = formulario.querySelector(".campo-jerarquia").value;
    const filaNA = formulario.querySelector(".fila-nombre-apellido");
    const filaSiglas = formulario.querySelector(".fila-siglas");

    if (esJerarquiaInteligencia(jerarquia)) {
      filaNA.classList.add("oculto");
      filaSiglas.classList.remove("oculto");
      formulario.querySelector(".campo-nombre").value = "";
      formulario.querySelector(".campo-apellido").value = "";
    } else {
      filaNA.classList.remove("oculto");
      filaSiglas.classList.add("oculto");
      formulario.querySelector(".campo-siglas").value = "";
    }
  }

  function actualizarEstadoEliminarUbicacion(formulario) {
    const cont = formulario.querySelector(".contenedor-ubicaciones");
    const btn = formulario.querySelector(".btn-eliminar-ubicacion");
    btn.classList.toggle("oculto", cont.children.length <= 1);
  }

  function actualizarTextoMultiselect(multiselect) {
    const checks = multiselect.querySelectorAll(
      'input[type="checkbox"]:checked',
    );
    const boton = multiselect.querySelector(".multiselect-boton");

    if (!checks.length) {
      boton.textContent =
        multiselect.dataset.nombre === "gastos"
          ? "EN CASO DE EROGAR"
          : "SELECCIONAR";
      return;
    }

    boton.textContent = Array.from(checks)
      .map((c) => c.value)
      .join(", ");
  }

  function cerrarTodosLosMultiselects() {
    document
      .querySelectorAll(".multiselect")
      .forEach((ms) => ms.classList.remove("abierto"));
  }

  function recalcularBloqueMontos(formulario) {
    const checks = formulario.querySelectorAll(
      '.multiselect[data-nombre="gastos"] input[type="checkbox"]:checked',
    );
    const gastos = Array.from(checks).map((c) => c.value);
    const bloque = formulario.querySelector(".bloque-montos-gastos");
    const cont = formulario.querySelector(".contenedor-montos-gastos");

    const manualPasajesPrevio = cont.querySelector(
      '.monto-gasto-item[data-gasto="Pasajes"] .campo-monto-manual',
    );
    const valorPasajesPrevio = manualPasajesPrevio
      ? manualPasajesPrevio.value
      : "";

    cont.innerHTML = "";

    gastos.forEach((gasto) => {
      const item = crearBloqueMontoGasto(gasto);
      if (gasto === "Pasajes") {
        const input = item.querySelector(".campo-monto-manual");
        input.value = valorPasajesPrevio;
        input.addEventListener("input", () => {
          actualizarLiquidacionAutomatica(formulario);
          actualizarTotalesGenerales();
        });
      }
      cont.appendChild(item);
    });

    bloque.classList.toggle("oculto", gastos.length === 0);
    actualizarLiquidacionAutomatica(formulario);
    actualizarTotalesGenerales();
  }

  function obtenerPrimerPais(formulario) {
    const input = formulario.querySelector(
      ".contenedor-ubicaciones .campo-pais",
    );
    return input ? input.value.trim() : "";
  }

  function actualizarLiquidacionAutomatica(formulario) {
    const pais = obtenerPrimerPais(formulario);
    const zona = obtenerZonaPorPais(pais);
    const jerarquia = formulario.querySelector(".campo-jerarquia").value;
    const grupo = obtenerGrupoPorJerarquia(jerarquia);
    const diasComputables = obtenerDiasComputables(formulario);
    const nochesAlojamiento = calcularNochesAlojamiento(formulario);
    const diasCobertura = obtenerDiasCalendario(formulario);

    const gastos = Array.from(
      formulario.querySelectorAll(
        '.multiselect[data-nombre="gastos"] input[type="checkbox"]:checked',
      ),
    ).map((c) => c.value);

    const bloque = formulario.querySelector(".bloque-liquidacion");
    const filaConversion = formulario.querySelector(".fila-conversion-eur");
    const valor9UsdEur = toNumber(
      formulario.querySelector(".campo-valor-9usd-eur").value,
    );

    const campoZona = formulario.querySelector(".campo-zona");
    const campoMoneda = formulario.querySelector(".campo-moneda");
    const campoGrupo = formulario.querySelector(".campo-grupo");
    const campoDias = formulario.querySelector(".campo-dias-computables");
    const campoNoches = formulario.querySelector(".campo-noches-alojamiento");
    const campoCoberturaDias = formulario.querySelector(
      ".campo-dias-cobertura",
    );
    const campoTV = formulario.querySelector(".campo-total-viaticos");
    const campoTA = formulario.querySelector(".campo-total-alojamiento");
    const campoTC = formulario.querySelector(".campo-total-cobertura");
    const campoTG = formulario.querySelector(".campo-total-gastos");

    if (!pais || !zona || !grupo || diasCobertura <= 0) {
      bloque.classList.add("oculto");
      campoZona.value = "";
      campoMoneda.value = "";
      campoGrupo.value = "";
      campoDias.value = "";
      campoNoches.value = "";
      campoCoberturaDias.value = "";
      campoTV.value = "";
      campoTA.value = "";
      campoTC.value = "";
      campoTG.value = "";
      formulario.dataset.totalPasajes = 0;
      formulario.dataset.totalViaticos = 0;
      formulario.dataset.totalAlojamiento = 0;
      formulario.dataset.totalCobertura = 0;
      return;
    }

    bloque.classList.remove("oculto");

    const tarifa = TARIFAS[grupo][zona];
    const moneda = tarifa.moneda;

    campoZona.value = `Zona ${zona}`;
    campoMoneda.value = moneda;
    campoGrupo.value = `Grupo ${grupo}`;
    campoDias.value = String(diasComputables || 0);
    campoNoches.value = String(nochesAlojamiento || 0);
    campoCoberturaDias.value = String(diasCobertura || 0);

    let viaticos = 0;
    let alojamiento = 0;
    let cobertura = 0;
    let pasajes = 0;

    const itemViaticos = formulario.querySelector(
      '.monto-gasto-item[data-gasto="Viáticos"]',
    );
    const itemAlojamiento = formulario.querySelector(
      '.monto-gasto-item[data-gasto="Alojamiento"]',
    );
    const itemCobertura = formulario.querySelector(
      '.monto-gasto-item[data-gasto="Cobertura médica"]',
    );
    const itemPasajes = formulario.querySelector(
      '.monto-gasto-item[data-gasto="Pasajes"]',
    );

    if (gastos.includes("Viáticos") && diasComputables > 0) {
      viaticos = tarifa.viaticos * diasComputables;
      if (itemViaticos) {
        itemViaticos.querySelector(".campo-monto-automatico").value =
          formatMoney(viaticos, moneda);
        itemViaticos.querySelector(".campo-detalle-gasto").value =
          `${tarifa.viaticos} ${moneda} x ${diasComputables} días computables`;
      }
    }

    if (gastos.includes("Alojamiento") && nochesAlojamiento > 0) {
      alojamiento = tarifa.alojamiento * nochesAlojamiento;
      if (itemAlojamiento) {
        itemAlojamiento.querySelector(".campo-monto-automatico").value =
          formatMoney(alojamiento, moneda);
        itemAlojamiento.querySelector(".campo-detalle-gasto").value =
          `${tarifa.alojamiento} ${moneda} x ${nochesAlojamiento} noches`;
      }
    }

    if (gastos.includes("Cobertura médica") && diasCobertura > 0) {
      if (zona === 3) {
        filaConversion.classList.remove("oculto");
        if (valor9UsdEur > 0) {
          cobertura = valor9UsdEur * diasCobertura;
          if (itemCobertura) {
            itemCobertura.querySelector(".campo-monto-automatico").value =
              formatMoney(cobertura, "EUR");
            itemCobertura.querySelector(".campo-detalle-gasto").value =
              `${valor9UsdEur} EUR x ${diasCobertura} días`;
          }
        } else if (itemCobertura) {
          itemCobertura.querySelector(".campo-monto-automatico").value = "";
          itemCobertura.querySelector(".campo-detalle-gasto").value =
            "Cargar conversión de 9 USD a EUR";
        }
      } else {
        filaConversion.classList.add("oculto");
        cobertura = 9 * diasCobertura;
        if (itemCobertura) {
          itemCobertura.querySelector(".campo-monto-automatico").value =
            formatMoney(cobertura, "USD");
          itemCobertura.querySelector(".campo-detalle-gasto").value =
            `9 USD x ${diasCobertura} días`;
        }
      }
    } else {
      filaConversion.classList.add("oculto");
    }

    if (itemPasajes) {
      pasajes = toNumber(
        itemPasajes.querySelector(".campo-monto-manual").value,
      );
    }

    const totalVisible = pasajes + viaticos + alojamiento + cobertura;

    campoTV.value = viaticos ? formatMoney(viaticos, moneda) : "";
    campoTA.value = alojamiento ? formatMoney(alojamiento, moneda) : "";
    campoTC.value = cobertura
      ? formatMoney(cobertura, zona === 3 ? "EUR" : "USD")
      : "";
    campoTG.value = totalVisible
      ? formatMoney(totalVisible, zona === 3 ? "EUR*" : "USD")
      : "";

    formulario.dataset.totalPasajes = pasajes;
    formulario.dataset.totalViaticos = viaticos;
    formulario.dataset.totalAlojamiento = alojamiento;
    formulario.dataset.totalCobertura = cobertura;
  }

  function actualizarTotalesGenerales() {
    const resumen = obtenerResumenTotalesGenerales();
    const hayPasajes = tieneTotales(resumen.pasajes);
    const hayTotales = tieneTotales(resumen.general);

    bloqueTotales.classList.toggle("oculto", !hayTotales);
    campoTotalPasajesContenedor.classList.toggle("oculto", !hayPasajes);
    filaTotalesPrincipales.classList.toggle("fila-dos", hayPasajes);
    filaTotalesPrincipales.classList.toggle("fila-uno", !hayPasajes);

    totalPasajes.value = formatearTotalesPorMoneda(resumen.pasajes);
    totalViaticos.value = formatearTotalesPorMoneda(resumen.viaticos);
    totalAlojamiento.value = formatearTotalesPorMoneda(resumen.alojamiento);
    totalCobertura.value = formatearTotalesPorMoneda(resumen.cobertura);
    totalGeneral.value = formatearTotalesPorMoneda(resumen.general);
  }

  function normalizarBloqueTransporte(formulario) {
    const bloquesTransporte = Array.from(
      formulario.querySelectorAll('.multiselect[data-nombre="transporte"]'),
    )
      .map((multiselect) => multiselect.closest(".fila"))
      .filter(Boolean);

    if (!bloquesTransporte.length) return;

    const bloquePrincipal = bloquesTransporte[0];
    const filaHorarios = formulario
      .querySelector(".campo-hora-salida")
      ?.closest(".fila");

    if (filaHorarios && filaHorarios.nextElementSibling !== bloquePrincipal) {
      filaHorarios.insertAdjacentElement("afterend", bloquePrincipal);
    }

    bloquesTransporte.slice(1).forEach((bloque) => bloque.remove());
  }

  function inicializarMultiselects(formulario) {
    formulario.querySelectorAll(".multiselect").forEach((multiselect) => {
      const boton = multiselect.querySelector(".multiselect-boton");
      const checks = multiselect.querySelectorAll('input[type="checkbox"]');

      boton.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".multiselect").forEach((otro) => {
          if (otro !== multiselect) otro.classList.remove("abierto");
        });
        multiselect.classList.toggle("abierto");
      });

      checks.forEach((check) => {
        check.addEventListener("change", () => {
          actualizarTextoMultiselect(multiselect);
          if (multiselect.dataset.nombre === "gastos") {
            recalcularBloqueMontos(formulario);
          } else {
            actualizarLiquidacionAutomatica(formulario);
            actualizarTotalesGenerales();
          }
        });
      });

      actualizarTextoMultiselect(multiselect);
    });
  }

  function actualizarSelectorEliminarFuncionario() {
    const formularios = document.querySelectorAll(".bloque-funcionario");
    selectorFuncionarioEliminar.innerHTML = `<option value="">Seleccionar funcionario</option>`;

    formularios.forEach((formulario, indice) => {
      const option = document.createElement("option");
      option.value = formulario.dataset.funcionarioId;
      option.textContent = `Funcionario ${indice + 1}`;
      selectorFuncionarioEliminar.appendChild(option);
    });
  }

  function renumerarFuncionarios() {
    document
      .querySelectorAll(".bloque-funcionario")
      .forEach((formulario, indice) => {
        formulario.querySelector(".numero-funcionario").textContent =
          indice + 1;
      });
    actualizarSelectorEliminarFuncionario();
  }

  function inicializarFormulario(formulario) {
    normalizarBloqueTransporte(formulario);
    normalizarCamposFuncionario(formulario);

    const contUbic = formulario.querySelector(".contenedor-ubicaciones");
    const btnAddUbic = formulario.querySelector(".btn-agregar-ubicacion");
    const btnDelUbic = formulario.querySelector(".btn-eliminar-ubicacion");

    agregarBloqueUbicacion(formulario);

    btnAddUbic.addEventListener("click", () => {
      if (contUbic.children.length >= 10) {
        mostrarAviso("Solo se pueden agregar hasta 10 bloques de ciudad y país.", {
          titulo: "Límite alcanzado",
          tipo: "error",
        });
        return;
      }
      agregarBloqueUbicacion(formulario);
      actualizarEstadoEliminarUbicacion(formulario);
    });

    btnDelUbic.addEventListener("click", () => {
      if (contUbic.children.length > 1) {
        contUbic.removeChild(contUbic.lastElementChild);
      }
      actualizarEstadoEliminarUbicacion(formulario);
      actualizarLiquidacionAutomatica(formulario);
      actualizarTotalesGenerales();
    });

    actualizarEstadoEliminarUbicacion(formulario);

    formulario
      .querySelector(".campo-jerarquia")
      .addEventListener("change", () => {
        actualizarCamposInteligencia(formulario);
        actualizarLiquidacionAutomatica(formulario);
        actualizarTotalesGenerales();
      });

    [
      ".campo-fecha-inicio",
      ".campo-fecha-fin",
      ".campo-hora-salida",
      ".campo-hora-llegada",
      ".campo-valor-9usd-eur",
    ].forEach((selector) => {
      formulario.querySelector(selector).addEventListener("input", () => {
        actualizarDuracion(formulario);
        actualizarLiquidacionAutomatica(formulario);
        actualizarTotalesGenerales();
      });
    });

    inicializarMultiselects(formulario);
    actualizarCamposInteligencia(formulario);
    actualizarDuracion(formulario);
    recalcularBloqueMontos(formulario);
  }

  function crearFormularioFuncionario() {
    const formularioReferencia =
      contenedorFuncionarios.querySelector(".bloque-funcionario:last-of-type");
    const clone = templateFuncionario.content.cloneNode(true);
    const formulario = clone.querySelector(".bloque-funcionario");
    formulario.dataset.funcionarioId = `funcionario-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    inicializarFormulario(formulario);
    copiarDatosCompartidos(formularioReferencia, formulario);
    contenedorFuncionarios.appendChild(formulario);
    renumerarFuncionarios();
    actualizarTotalesGenerales();
  }

  function eliminarFuncionarioSeleccionado() {
    const id = selectorFuncionarioEliminar.value;
    const formularios = document.querySelectorAll(".bloque-funcionario");

    if (!id) {
      mostrarAviso("Seleccioná qué funcionario querés eliminar.", {
        titulo: "Falta seleccionar",
        tipo: "error",
      });
      return;
    }

    if (formularios.length <= 1) {
      mostrarAviso("Debe quedar al menos un funcionario cargado.", {
        titulo: "Acción no permitida",
        tipo: "error",
      });
      return;
    }

    const objetivo = document.querySelector(
      `.bloque-funcionario[data-funcionario-id="${id}"]`,
    );
    if (objetivo) {
      objetivo.remove();
      renumerarFuncionarios();
      actualizarTotalesGenerales();
    }
  }

  function obtenerValoresMultiselect(multiselect) {
    return Array.from(
      multiselect.querySelectorAll('input[type="checkbox"]:checked'),
    ).map((c) => c.value);
  }

  function recolectarDatos() {
    const formularios = document.querySelectorAll(".bloque-funcionario");

    return Array.from(formularios).map((formulario, indice) => ({
      funcionario: indice + 1,
      jerarquia: formulario.querySelector(".campo-jerarquia").value,
      jerarquiaTexto:
        formulario.querySelector(".campo-jerarquia").selectedOptions[0]
          ?.textContent || "",
      grupo: obtenerGrupoPorJerarquia(
        formulario.querySelector(".campo-jerarquia").value,
      ),
      zona: obtenerZonaPorPais(obtenerPrimerPais(formulario)),
      moneda: formulario.querySelector(".campo-moneda").value.trim(),
      lp: formulario.querySelector(".campo-lp").value.trim(),
      dni: formulario.querySelector(".campo-dni").value.trim(),
      nombre: formulario.querySelector(".campo-nombre").value.trim(),
      apellido: formulario.querySelector(".campo-apellido").value.trim(),
      siglas: formulario.querySelector(".campo-siglas").value.trim(),
      destino: formulario.querySelector(".campo-destino").value.trim(),
      motivoComision: "Expulsión",
      fechaInicio: formulario.querySelector(".campo-fecha-inicio").value,
      fechaFin: formulario.querySelector(".campo-fecha-fin").value,
      horaSalida: formulario.querySelector(".campo-hora-salida").value,
      horaLlegada: formulario.querySelector(".campo-hora-llegada").value,
      ubicaciones: obtenerUbicacionesFormulario(formulario),
      duracionTotal: formulario.querySelector(".campo-duracion").value,
      diasComputables: obtenerDiasComputables(formulario),
      nochesAlojamiento: calcularNochesAlojamiento(formulario),
      diasCobertura: obtenerDiasCalendario(formulario),
      gastos: obtenerValoresMultiselect(
        formulario.querySelector('.multiselect[data-nombre="gastos"]'),
      ),
      transporte: obtenerValoresMultiselect(
        formulario.querySelector('.multiselect[data-nombre="transporte"]'),
      ),
      aporteOrganismo: "",
      totalPasajes: toNumber(formulario.dataset.totalPasajes),
      totalViaticos: toNumber(formulario.dataset.totalViaticos),
      totalAlojamiento: toNumber(formulario.dataset.totalAlojamiento),
      totalCobertura: toNumber(formulario.dataset.totalCobertura),
      valor9UsdEur: formulario.querySelector(".campo-valor-9usd-eur").value,
    }));
  }

  function recolectarDatosJudiciales() {
    return {
      motivoComision: "Expulsión",
      numeroInternoExpediente: document
        .getElementById("numero-interno-expediente")
        .value.trim(),
      expedienteElectronico: document
        .getElementById("expediente-electronico")
        .value.trim(),
      organismoJudicial: document
        .getElementById("organismo-judicial")
        .value.trim(),
      tratamientoJuez: document.getElementById("tratamiento-juez")?.value || "",
      juezACargo: document.getElementById("juez-cargo").value.trim(),
      tratamientoSecretario:
        document.getElementById("tratamiento-secretario")?.value || "",
      secretariaACargo: document.getElementById("secretaria-cargo").value.trim(),
      caratulaCausaJudicial: document
        .getElementById("caratula-causa-judicial")
        .value.trim(),
      numeroExpedienteCausaJudicial: document
        .getElementById("expediente-causa-judicial")
        .value.trim(),
      nombreDetenido: document.getElementById("nombre-detenido").value.trim(),
      nacionalidadDetenido: document
        .getElementById("nacionalidad-detenido")
        .value.trim(),
    };
  }

  btnAgregarFuncionario.addEventListener("click", crearFormularioFuncionario);
  btnEliminarFuncionario.addEventListener(
    "click",
    eliminarFuncionarioSeleccionado,
  );

  btnGenerarWord.addEventListener("click", () => {
    const datos = {
      datosJudiciales: recolectarDatosJudiciales(),
      funcionarios: recolectarDatos(),
      resumen: obtenerResumenTotalesGenerales(),
    };

    localStorage.setItem("datosExpulsiones", JSON.stringify(datos));
    console.log("Datos de expulsiones reunidos para Word:", datos);

    try {
      if (!window.ExpulsionesWord?.generarDocumentos) {
        throw new Error("No se pudo inicializar el generador de Word.");
      }

      const archivos = window.ExpulsionesWord.generarDocumentos(datos);
      mostrarAviso(
        `Se generaron correctamente ${archivos.length} archivos Word.`,
        {
          titulo: "Word generados",
          tipo: "success",
        },
      );
    } catch (error) {
      mostrarAviso(error.message || "No se pudieron generar los Word.", {
        titulo: "No se pudieron generar los Word",
        tipo: "error",
      });
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".multiselect")) {
      cerrarTodosLosMultiselects();
    }
  });

  inicializarBurbujaConversorAduana();
  crearFormularioFuncionario();
});
