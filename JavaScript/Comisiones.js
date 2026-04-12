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

  const bloqueTotales = document.getElementById("bloque-totales");
  const totalPasajes = document.getElementById("total-pasajes");
  const totalViaticos = document.getElementById("total-viaticos");
  const totalAlojamiento = document.getElementById("total-alojamiento");
  const totalCobertura = document.getElementById("total-cobertura");
  const totalGeneral = document.getElementById("total-general");

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

  function crearBloqueUbicacion() {
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
    return div;
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
    const formularios = document.querySelectorAll(".bloque-funcionario");

    let pasajes = 0;
    let viaticos = 0;
    let alojamiento = 0;
    let cobertura = 0;

    formularios.forEach((formulario) => {
      pasajes += toNumber(formulario.dataset.totalPasajes);
      viaticos += toNumber(formulario.dataset.totalViaticos);
      alojamiento += toNumber(formulario.dataset.totalAlojamiento);
      cobertura += toNumber(formulario.dataset.totalCobertura);
    });

    const general = pasajes + viaticos + alojamiento + cobertura;
    bloqueTotales.classList.toggle("oculto", general <= 0);

    totalPasajes.value = pasajes ? pasajes.toFixed(2) : "";
    totalViaticos.value = viaticos ? viaticos.toFixed(2) : "";
    totalAlojamiento.value = alojamiento ? alojamiento.toFixed(2) : "";
    totalCobertura.value = cobertura ? cobertura.toFixed(2) : "";
    totalGeneral.value = general ? general.toFixed(2) : "";
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
    const contUbic = formulario.querySelector(".contenedor-ubicaciones");
    const btnAddUbic = formulario.querySelector(".btn-agregar-ubicacion");
    const btnDelUbic = formulario.querySelector(".btn-eliminar-ubicacion");

    const primerBloque = crearBloqueUbicacion();
    contUbic.appendChild(primerBloque);

    primerBloque.querySelector(".campo-pais").addEventListener("input", () => {
      actualizarLiquidacionAutomatica(formulario);
      actualizarTotalesGenerales();
    });

    btnAddUbic.addEventListener("click", () => {
      if (contUbic.children.length >= 10) {
        alert("Solo se pueden agregar hasta 10 bloques de ciudad y país.");
        return;
      }
      const bloque = crearBloqueUbicacion();
      bloque.querySelector(".campo-pais").addEventListener("input", () => {
        actualizarLiquidacionAutomatica(formulario);
        actualizarTotalesGenerales();
      });
      contUbic.appendChild(bloque);
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
    const clone = templateFuncionario.content.cloneNode(true);
    const formulario = clone.querySelector(".bloque-funcionario");
    formulario.dataset.funcionarioId = `funcionario-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    inicializarFormulario(formulario);
    contenedorFuncionarios.appendChild(formulario);
    renumerarFuncionarios();
    actualizarTotalesGenerales();
  }

  function eliminarFuncionarioSeleccionado() {
    const id = selectorFuncionarioEliminar.value;
    const formularios = document.querySelectorAll(".bloque-funcionario");

    if (!id) {
      alert("Seleccioná qué funcionario querés eliminar.");
      return;
    }

    if (formularios.length <= 1) {
      alert("Debe quedar al menos un funcionario cargado.");
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
      grupo: obtenerGrupoPorJerarquia(
        formulario.querySelector(".campo-jerarquia").value,
      ),
      lp: formulario.querySelector(".campo-lp").value.trim(),
      dni: formulario.querySelector(".campo-dni").value.trim(),
      nombre: formulario.querySelector(".campo-nombre").value.trim(),
      apellido: formulario.querySelector(".campo-apellido").value.trim(),
      siglas: formulario.querySelector(".campo-siglas").value.trim(),
      destino: formulario.querySelector(".campo-destino").value.trim(),
      superintendencia: formulario
        .querySelector(".campo-superintendencia")
        .value.trim(),
      motivoComision: formulario.querySelector(".campo-motivo").value.trim(),
      fechaInicio: formulario.querySelector(".campo-fecha-inicio").value,
      fechaFin: formulario.querySelector(".campo-fecha-fin").value,
      horaSalida: formulario.querySelector(".campo-hora-salida").value,
      horaLlegada: formulario.querySelector(".campo-hora-llegada").value,
      ubicaciones: Array.from(
        formulario.querySelectorAll(".ubicacion-item"),
      ).map((item) => ({
        ciudad: item.querySelector(".campo-ciudad").value.trim(),
        pais: item.querySelector(".campo-pais").value.trim(),
      })),
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
      numeroExpediente: formulario
        .querySelector(".campo-expediente")
        .value.trim(),
      aporteOrganismo: formulario.querySelector(".campo-aporte").value.trim(),
      totalPasajes: toNumber(formulario.dataset.totalPasajes),
      totalViaticos: toNumber(formulario.dataset.totalViaticos),
      totalAlojamiento: toNumber(formulario.dataset.totalAlojamiento),
      totalCobertura: toNumber(formulario.dataset.totalCobertura),
      valor9UsdEur: formulario.querySelector(".campo-valor-9usd-eur").value,
    }));
  }

  btnAgregarFuncionario.addEventListener("click", crearFormularioFuncionario);
  btnEliminarFuncionario.addEventListener(
    "click",
    eliminarFuncionarioSeleccionado,
  );

  btnGenerarWord.addEventListener("click", () => {
    const datos = {
      funcionarios: recolectarDatos(),
      resumen: {
        pasajes: toNumber(totalPasajes.value),
        viaticos: toNumber(totalViaticos.value),
        alojamiento: toNumber(totalAlojamiento.value),
        cobertura: toNumber(totalCobertura.value),
        general: toNumber(totalGeneral.value),
      },
    };

    localStorage.setItem("datosComisiones", JSON.stringify(datos));
    console.log("Datos reunidos para Word:", datos);
    alert(
      "Los datos fueron reunidos correctamente y quedaron listos para la futura generación del Word.",
    );
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".multiselect")) {
      cerrarTodosLosMultiselects();
    }
  });

  crearFormularioFuncionario();
});
