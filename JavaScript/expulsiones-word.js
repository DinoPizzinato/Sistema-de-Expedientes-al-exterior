(function () {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  const MONTHS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const CRC_TABLE = createCrcTable();
  const JERARQUIAS_SUBOFICIALES = new Set([
    "agente",
    "cabo",
    "cabo_primero",
    "sargento",
    "sargento_primero",
    "suboficial_escribiente",
    "suboficial_auxiliar",
    "suboficial_mayor",
  ]);
  const JERARQUIAS_SUBALTERNOS = new Set([
    "ayudante",
    "subinspector",
    "inspector",
    "principal",
    "subcomisario",
  ]);
  const JERARQUIAS_SUPERIORES = new Set([
    "comisario",
    "comisario_inspector",
    "comisario_mayor",
    "comisario_general",
    "subjefe_policia",
    "jefe_policia",
  ]);
  const DEPENDENCIAS_FEMENINAS = [
    "superintendencia",
    "direccion",
    "dirección",
    "fiscalia",
    "fiscalía",
    "comisaria",
    "comisaría",
    "division",
    "división",
    "seccion",
    "sección",
    "secretaria",
    "secretaría",
  ];
  const DEPENDENCIAS_MASCULINAS = ["departamento", "juzgado", "grupo"];
  const SUPERINTENDENCIA_MENCIONADA =
    "Superintendencia de INVESTIGACIONES FEDERALES";
  const OFFICIAL_COUNTRY_NAMES = buildOfficialCountryNameMap();

  function createCrcTable() {
    const table = new Uint32Array(256);

    for (let i = 0; i < 256; i += 1) {
      let value = i;
      for (let j = 0; j < 8; j += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[i] = value >>> 0;
    }

    return table;
  }

  function buildOfficialCountryNameMap() {
    const entries = [
      ["Argentina", "República Argentina"],
      ["Bolivia", "Estado Plurinacional de Bolivia"],
      ["Brasil", "República Federativa del Brasil"],
      ["Brazil", "República Federativa del Brasil"],
      ["Chile", "República de Chile"],
      ["Colombia", "República de Colombia"],
      ["Ecuador", "República del Ecuador"],
      ["Guyana", "República Cooperativa de Guyana"],
      ["Paraguay", "República del Paraguay"],
      ["Perú", "República del Perú"],
      ["Peru", "República del Perú"],
      ["Uruguay", "República Oriental del Uruguay"],
      ["Venezuela", "República Bolivariana de Venezuela"],
      ["Surinam", "República de Surinam"],
      ["Suriname", "República de Surinam"],
      ["Belice", "República de Belice"],
      ["Costa Rica", "República de Costa Rica"],
      ["El Salvador", "República de El Salvador"],
      ["Guatemala", "República de Guatemala"],
      ["Honduras", "República de Honduras"],
      ["Nicaragua", "República de Nicaragua"],
      ["Panamá", "República de Panamá"],
      ["Panama", "República de Panamá"],
      ["República Dominicana", "República Dominicana"],
      ["Republica Dominicana", "República Dominicana"],
      ["Cuba", "República de Cuba"],
      ["Haití", "República de Haití"],
      ["Haiti", "República de Haití"],
      ["Jamaica", "Jamaica"],
      ["Antigua y Barbuda", "Antigua y Barbuda"],
      ["Bahamas", "Mancomunidad de las Bahamas"],
      ["Barbados", "Barbados"],
      ["Granada", "Granada"],
      ["San Cristóbal y Nieves", "Federación de San Cristóbal y Nieves"],
      ["San Cristobal y Nieves", "Federación de San Cristóbal y Nieves"],
      ["Saint Kitts and Nevis", "Federación de San Cristóbal y Nieves"],
      ["Santa Lucía", "Santa Lucía"],
      ["Santa Lucia", "Santa Lucía"],
      ["San Vicente y las Granadinas", "San Vicente y las Granadinas"],
      ["Trinidad y Tobago", "República de Trinidad y Tobago"],
      ["Canadá", "Canadá"],
      ["Canada", "Canadá"],
      ["Estados Unidos", "Estados Unidos de América"],
      ["Estados Unidos de América", "Estados Unidos de América"],
      ["Estados Unidos de America", "Estados Unidos de América"],
      ["EEUU", "Estados Unidos de América"],
      ["EE. UU.", "Estados Unidos de América"],
      ["USA", "Estados Unidos de América"],
      ["United States", "Estados Unidos de América"],
      ["México", "Estados Unidos Mexicanos"],
      ["Mexico", "Estados Unidos Mexicanos"],
      ["Estados Unidos Mexicanos", "Estados Unidos Mexicanos"],
      ["España", "Reino de España"],
      ["Espana", "Reino de España"],
      ["Italia", "República Italiana"],
      ["Francia", "República Francesa"],
      ["Alemania", "República Federal de Alemania"],
      ["Portugal", "República Portuguesa"],
      ["Reino Unido", "Reino Unido de Gran Bretaña e Irlanda del Norte"],
      ["Gran Bretaña", "Reino Unido de Gran Bretaña e Irlanda del Norte"],
      ["Inglaterra", "Reino Unido de Gran Bretaña e Irlanda del Norte"],
      ["Países Bajos", "Reino de los Países Bajos"],
      ["Paises Bajos", "Reino de los Países Bajos"],
      ["Bélgica", "Reino de Bélgica"],
      ["Belgica", "Reino de Bélgica"],
      ["Suiza", "Confederación Suiza"],
      ["Austria", "República de Austria"],
      ["Irlanda", "Irlanda"],
      ["Dinamarca", "Reino de Dinamarca"],
      ["Suecia", "Reino de Suecia"],
      ["Noruega", "Reino de Noruega"],
      ["Finlandia", "República de Finlandia"],
      ["Polonia", "República de Polonia"],
      ["Rumania", "Rumania"],
      ["Bulgaria", "República de Bulgaria"],
      ["Grecia", "República Helénica"],
      ["Turquía", "República de Turquía"],
      ["Turquia", "República de Turquía"],
      ["Rusia", "Federación de Rusia"],
      ["Ucrania", "Ucrania"],
      ["Georgia", "Georgia"],
      ["Armenia", "República de Armenia"],
      ["Azerbaiyán", "República de Azerbaiyán"],
      ["Azerbaiyan", "República de Azerbaiyán"],
      ["Israel", "Estado de Israel"],
      ["Egipto", "República Árabe de Egipto"],
      ["Marruecos", "Reino de Marruecos"],
      ["Sudáfrica", "República de Sudáfrica"],
      ["Sudafrica", "República de Sudáfrica"],
      ["Australia", "Mancomunidad de Australia"],
      ["Nueva Zelanda", "Nueva Zelanda"],
      ["China", "República Popular China"],
      ["Japón", "Japón"],
      ["Japon", "Japón"],
      ["Corea del Sur", "República de Corea"],
      ["India", "República de la India"],
    ];

    return new Map(
      entries.flatMap(([alias, official]) => [
        [normalizarTexto(alias), official],
        [normalizarTexto(official), official],
      ]),
    );
  }

  function crc32(bytes) {
    let crc = 0xffffffff;

    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  function escapeXml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function decodeBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  function encodeText(text) {
    return textEncoder.encode(text);
  }

  function decodeText(bytes) {
    return textDecoder.decode(bytes);
  }

  function renderTemplate(template, context) {
    let rendered = template.replace(/\{\{\{([a-zA-Z0-9_]+)\}\}\}/g, (_, key) =>
      String(context[key] ?? ""),
    );

    rendered = rendered.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) =>
      escapeXml(context[key] ?? ""),
    );

    return rendered;
  }

  function normalizeSpaces(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarTexto(value) {
    return normalizeSpaces(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,/()#-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function upper(value) {
    return normalizeSpaces(value).toUpperCase();
  }

  function uniqueBy(items, keyFn) {
    const seen = new Set();
    const result = [];

    items.forEach((item) => {
      const key = keyFn(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    });

    return result;
  }

  function formatDateShort(value) {
    const [year, month, day] = String(value || "").split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
  }

  function formatDateRangeLong(start, end) {
    const startDate = parseIsoDate(start);
    const endDate = parseIsoDate(end);

    if (!startDate || !endDate) return "";

    const sameMonth =
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear();

    if (sameMonth) {
      return `${pad2(startDate.getDate())} al ${pad2(endDate.getDate())} de ${
        MONTHS[startDate.getMonth()]
      } de ${startDate.getFullYear()}`;
    }

    return `${pad2(startDate.getDate())} de ${
      MONTHS[startDate.getMonth()]
    } de ${startDate.getFullYear()} al ${pad2(endDate.getDate())} de ${
      MONTHS[endDate.getMonth()]
    } de ${endDate.getFullYear()}`;
  }

  function parseIsoDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function pad2(value) {
    return String(Math.trunc(value)).padStart(2, "0");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function safeNumber(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function currencyMeta(currency) {
    if (String(currency).toUpperCase() === "EUR") {
      return {
        symbol: "EUR",
        singular: "EURO",
        plural: "EUROS",
      };
    }

    return {
      symbol: "U$S",
      singular: "DÓLAR ESTADOUNIDENSE",
      plural: "DÓLARES ESTADOUNIDENSES",
    };
  }

  function numberToWords(value) {
    const number = Math.trunc(Math.abs(value));

    if (number === 0) return "CERO";

    if (number < 30) {
      return [
        "",
        "UN",
        "DOS",
        "TRES",
        "CUATRO",
        "CINCO",
        "SEIS",
        "SIETE",
        "OCHO",
        "NUEVE",
        "DIEZ",
        "ONCE",
        "DOCE",
        "TRECE",
        "CATORCE",
        "QUINCE",
        "DIECISÉIS",
        "DIECISIETE",
        "DIECIOCHO",
        "DIECINUEVE",
        "VEINTE",
        "VEINTIÚN",
        "VEINTIDÓS",
        "VEINTITRÉS",
        "VEINTICUATRO",
        "VEINTICINCO",
        "VEINTISÉIS",
        "VEINTISIETE",
        "VEINTIOCHO",
        "VEINTINUEVE",
      ][number];
    }

    if (number < 100) {
      const tens = [
        "",
        "",
        "",
        "TREINTA",
        "CUARENTA",
        "CINCUENTA",
        "SESENTA",
        "SETENTA",
        "OCHENTA",
        "NOVENTA",
      ];
      const ten = Math.trunc(number / 10);
      const unit = number % 10;
      return unit ? `${tens[ten]} Y ${numberToWords(unit)}` : tens[ten];
    }

    if (number === 100) return "CIEN";

    if (number < 1000) {
      const hundreds = [
        "",
        "CIENTO",
        "DOSCIENTOS",
        "TRESCIENTOS",
        "CUATROCIENTOS",
        "QUINIENTOS",
        "SEISCIENTOS",
        "SETECIENTOS",
        "OCHOCIENTOS",
        "NOVECIENTOS",
      ];
      const hundred = Math.trunc(number / 100);
      const rest = number % 100;
      return rest
        ? `${hundreds[hundred]} ${numberToWords(rest)}`
        : hundreds[hundred];
    }

    if (number < 2000) {
      const rest = number % 1000;
      return rest ? `MIL ${numberToWords(rest)}` : "MIL";
    }

    if (number < 1000000) {
      const thousands = Math.trunc(number / 1000);
      const rest = number % 1000;
      const thousandsText = `${numberToWords(thousands)} MIL`;
      return rest ? `${thousandsText} ${numberToWords(rest)}` : thousandsText;
    }

    if (number < 2000000) {
      const rest = number % 1000000;
      return rest ? `UN MILLÓN ${numberToWords(rest)}` : "UN MILLÓN";
    }

    const millions = Math.trunc(number / 1000000);
    const rest = number % 1000000;
    const millionsText = `${numberToWords(millions)} MILLONES`;
    return rest ? `${millionsText} ${numberToWords(rest)}` : millionsText;
  }

  function amountToWords(value, currency) {
    const meta = currencyMeta(currency);
    const absolute = Math.abs(safeNumber(value));
    let integerPart = Math.trunc(absolute);
    let cents = Math.round((absolute - integerPart) * 100);

    if (cents === 100) {
      integerPart += 1;
      cents = 0;
    }

    const currencyName = integerPart === 1 ? meta.singular : meta.plural;
    let text = `${currencyName} ${numberToWords(integerPart)}`;

    if (cents > 0) {
      text += ` CON ${pad2(cents)}/100`;
    }

    return `${text} (${meta.symbol} ${formatMoney(absolute)})`;
  }

  function quantityText(value, singular, plural) {
    const amount = Math.trunc(safeNumber(value));
    const label = amount === 1 ? singular : plural;
    return `${numberToWords(amount)} (${pad2(amount)}) ${label}`;
  }

  function buildDailyBreakdown(funcionario) {
    const diasCalendario = Math.trunc(safeNumber(funcionario.diasCobertura));
    if (diasCalendario <= 0) {
      return { fullDays: 0, halfDays: 0 };
    }

    if (diasCalendario === 1) {
      if (
        String(funcionario.horaSalida || "") < "12:00" ||
        String(funcionario.horaLlegada || "") >= "12:00"
      ) {
        return { fullDays: 1, halfDays: 0 };
      }
      return { fullDays: 0, halfDays: 1 };
    }

    let fullDays = 0;
    let halfDays = 0;

    if (String(funcionario.horaSalida || "") < "12:00") {
      fullDays += 1;
    } else {
      halfDays += 1;
    }

    if (String(funcionario.horaLlegada || "") >= "12:00") {
      fullDays += 1;
    } else {
      halfDays += 1;
    }

    fullDays += Math.max(0, diasCalendario - 2);

    return { fullDays, halfDays };
  }

  function formatRankText(funcionario) {
    const text = normalizeSpaces(
      funcionario.jerarquiaTexto || funcionario.jerarquia || "",
    );

    return text
      .replace(/\s+\([^)]*\)$/g, "")
      .replace(/\b1ro\b/gi, "1º")
      .replace(/\b1°\b/gi, "1º");
  }

  function formatPersonName(funcionario) {
    if (normalizeSpaces(funcionario.siglas)) {
      return upper(funcionario.siglas);
    }

    const nombre = normalizeSpaces(funcionario.nombre);
    const apellido = upper(funcionario.apellido);
    return normalizeSpaces([nombre, apellido].filter(Boolean).join(" "));
  }

  function formatFuncionarioBase(funcionario) {
    const parts = [
      formatRankText(funcionario),
      funcionario.lp ? `L.P. ${normalizeSpaces(funcionario.lp)}` : "",
      funcionario.dni ? `(D.N.I. N° ${normalizeSpaces(funcionario.dni)})` : "",
      formatPersonName(funcionario),
    ].filter(Boolean);

    return normalizeSpaces(parts.join(" "));
  }

  function buildDependenciaConArticulo(value, capitalize = false) {
    const dependencia = normalizeSpaces(value);
    if (!dependencia) return "";

    const normalized = normalizarTexto(dependencia);

    if (/^(la|el|las|los)\b/.test(normalized)) {
      if (!capitalize) return dependencia;
      return dependencia.charAt(0).toUpperCase() + dependencia.slice(1);
    }

    let article = "la";
    if (DEPENDENCIAS_MASCULINAS.some((item) => normalized.startsWith(item))) {
      article = "el";
    } else if (
      !DEPENDENCIAS_FEMENINAS.some((item) => normalized.startsWith(item))
    ) {
      article = "la";
    }

    const text = `${article} ${dependencia}`;
    return capitalize ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function buildDependenciaPrincipal(funcionarios) {
    const dependenciaEspecial = funcionarios.find(
      (funcionario) =>
        normalizarTexto(funcionario.destino) ===
        normalizarTexto(SUPERINTENDENCIA_MENCIONADA),
    );

    if (dependenciaEspecial) {
      return normalizeSpaces(dependenciaEspecial.destino);
    }

    return normalizeSpaces(
      funcionarios.find((funcionario) => normalizeSpaces(funcionario.destino))
        ?.destino || "",
    );
  }

  function buildDependenciaFrase(
    funcionario,
    dependenciaPrincipal,
    options = {},
  ) {
    const { modoSuperintendencia = "completo" } = options;
    const dependencia = normalizeSpaces(funcionario.destino);

    if (!dependencia) return "";

    if (
      dependenciaPrincipal &&
      normalizarTexto(dependencia) ===
        normalizarTexto(SUPERINTENDENCIA_MENCIONADA) &&
      normalizarTexto(dependenciaPrincipal) ===
        normalizarTexto(SUPERINTENDENCIA_MENCIONADA)
    ) {
      if (modoSuperintendencia === "referenciada") {
        return "perteneciente a la Superintendencia mencionada en primer termino";
      }

      return `perteneciente a ${buildDependenciaConArticulo(dependencia)}`;
    }

    return `de ${buildDependenciaConArticulo(dependencia)}`;
  }

  function formatFuncionarioConDependencia(
    funcionario,
    dependenciaPrincipal,
    options = {},
  ) {
    const base = formatFuncionarioBase(funcionario);
    const dependencia = buildDependenciaFrase(
      funcionario,
      dependenciaPrincipal,
      options,
    );

    if (!dependencia) return base;

    return `${base} ${dependencia}`;
  }

  function formatTreatmentName(treatment, name) {
    const personName = normalizeSpaces(name);
    if (!personName) return "";

    if (treatment === "doctora") {
      return `Doctora ${personName}`;
    }

    return `Doctor ${personName}`;
  }

  function buildAuthorityRolePhrase(role, treatment, name) {
    const fullName = formatTreatmentName(treatment, name);
    if (!fullName) return "";

    if (role === "juez") {
      return treatment === "doctora"
        ? `a cargo de la ${fullName}`
        : `a cargo del ${fullName}`;
    }

    return treatment === "doctora"
      ? `Secretaría a cargo de la ${fullName}`
      : `Secretaría a cargo del ${fullName}`;
  }

  function buildCargoCategoria(funcionario) {
    const jerarquia = String(funcionario.jerarquia || "").trim();

    if (JERARQUIAS_SUPERIORES.has(jerarquia)) {
      return {
        order: 1,
        singular: "Oficial Superior",
        plural: "Oficiales Superiores",
      };
    }

    if (JERARQUIAS_SUBALTERNOS.has(jerarquia)) {
      return {
        order: 2,
        singular: "Oficial Subalterno",
        plural: "Oficiales Subalternos",
      };
    }

    if (JERARQUIAS_SUBOFICIALES.has(jerarquia)) {
      return {
        order: 3,
        singular: "Suboficial",
        plural: "Suboficiales",
      };
    }

    return {
      order: 4,
      singular: "funcionario",
      plural: "funcionarios",
    };
  }

  function buildPostulacionFuncionariosText(funcionarios) {
    const counts = new Map();

    funcionarios.forEach((funcionario) => {
      const categoria = buildCargoCategoria(funcionario);
      const key = `${categoria.order}|${categoria.singular}|${categoria.plural}`;
      const current = counts.get(key) || { ...categoria, amount: 0 };
      current.amount += 1;
      counts.set(key, current);
    });

    return joinNatural(
      Array.from(counts.values())
        .sort((a, b) => a.order - b.order)
        .map((categoria) =>
          quantityText(categoria.amount, categoria.singular, categoria.plural),
        ),
    );
  }

  function joinNatural(items) {
    const filtered = items.filter(Boolean);

    if (!filtered.length) return "";
    if (filtered.length === 1) return filtered[0];
    if (filtered.length === 2) return `${filtered[0]} y ${filtered[1]}`;

    return `${filtered.slice(0, -1).join(", ")} y ${
      filtered[filtered.length - 1]
    }`;
  }

  function buildDestinationText(ubicaciones) {
    const normalized = uniqueBy(
      (ubicaciones || [])
        .map((ubicacion) => ({
          ciudad: normalizeSpaces(ubicacion.ciudad),
          pais: normalizeSpaces(ubicacion.pais),
        }))
        .filter((ubicacion) => ubicacion.ciudad || ubicacion.pais),
      (ubicacion) =>
        `${normalizarTexto(ubicacion.ciudad)}|${normalizarTexto(ubicacion.pais)}`,
    );

    const pieces = normalized.map((ubicacion) => {
      if (ubicacion.ciudad && ubicacion.pais) {
        return `${upper(ubicacion.ciudad)}, ${upper(
          getOfficialCountryName(ubicacion.pais),
        )}`;
      }

      if (ubicacion.ciudad) return upper(ubicacion.ciudad);
      return upper(getOfficialCountryName(ubicacion.pais));
    });

    return joinNatural(pieces);
  }

  function buildMissionDestinationText(ubicaciones) {
    const normalized = uniqueBy(
      (ubicaciones || [])
        .map((ubicacion) => ({
          ciudad: normalizeSpaces(ubicacion.ciudad),
          pais: normalizeSpaces(ubicacion.pais),
        }))
        .filter((ubicacion) => ubicacion.ciudad || ubicacion.pais),
      (ubicacion) =>
        `${normalizarTexto(ubicacion.ciudad)}|${normalizarTexto(ubicacion.pais)}`,
    );

    return joinNatural(
      normalized.map((ubicacion) => {
        if (ubicacion.ciudad && ubicacion.pais) {
          return `la Ciudad de ${upper(ubicacion.ciudad)}, ${upper(
            getOfficialCountryName(ubicacion.pais),
          )}`;
        }

        if (ubicacion.ciudad) {
          return `la Ciudad de ${upper(ubicacion.ciudad)}`;
        }

        return upper(getOfficialCountryName(ubicacion.pais));
      }),
    );
  }

  function buildSharedDestinationText(funcionarios) {
    return buildMissionDestinationText(
      funcionarios.flatMap((funcionario) =>
        Array.isArray(funcionario.ubicaciones) ? funcionario.ubicaciones : [],
      ),
    );
  }

  function buildDestinationCountriesText(funcionarios) {
    const paises = uniqueBy(
      funcionarios.flatMap((funcionario) =>
        (Array.isArray(funcionario.ubicaciones) ? funcionario.ubicaciones : [])
          .map((ubicacion) => normalizeSpaces(ubicacion.pais))
          .filter(Boolean),
      ),
      normalizarTexto,
    );

    return joinNatural(
      paises.map((pais) => upper(simplifyCountryNameForTitle(pais))),
    );
  }

  function buildExpulsionTitle(funcionarios) {
    const paises = buildDestinationCountriesText(funcionarios);
    return paises ? `EXPULSIÓN A ${paises}` : "EXPULSIÓN";
  }

  function getOfficialCountryName(value) {
    const text = normalizeSpaces(value);
    if (!text) return "";

    return OFFICIAL_COUNTRY_NAMES.get(normalizarTexto(text)) || text;
  }

  function simplifyCountryNameForTitle(value) {
    const normalized = normalizarTexto(value);
    if (!normalized) return "";

    let text = normalized
      .replace(/^re.*?blica federativa del /, "")
      .replace(/^re.*?blica oriental del /, "")
      .replace(/^re.*?blica bolivariana de /, "")
      .replace(/^re.*?blica cooperativa de /, "")
      .replace(/^estado plurinacional de /, "")
      .replace(/^re.*?blica de /, "")
      .replace(/^re.*?blica del /, "")
      .replace(/^federacion de /, "")
      .replace(/^mancomunidad de las /, "")
      .replace(/^mancomunidad de /, "");

    if (text === "estados unidos mexicanos") {
      return "México";
    }

    if (text === "estados unidos de america") {
      return "Estados Unidos";
    }

    return text
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function buildTransportText(transporte) {
    return `${upper((transporte || []).join(" / "))}.`;
  }

  function buildDateTimeSummary(funcionarios, dateField, timeField) {
    return uniqueBy(
      funcionarios
        .map((funcionario) => {
          const date = normalizeSpaces(funcionario[dateField]);
          if (!date) return "";
          return formatDateShort(date);
        })
        .filter(Boolean),
      normalizarTexto,
    ).join(" / ");
  }

  function buildTransportSummary(funcionarios) {
    const transportes = uniqueBy(
      funcionarios.flatMap((funcionario) =>
        Array.isArray(funcionario.transporte) ? funcionario.transporte : [],
      ),
      normalizarTexto,
    );

    if (!transportes.length) return "";
    return buildTransportText(transportes);
  }

  function buildDependenciasClause(funcionarios) {
    const dependenciaPrincipal = buildDependenciaPrincipal(funcionarios);

    if (!dependenciaPrincipal) {
      return "la dependencia interviniente";
    }

    return buildDependenciaConArticulo(dependenciaPrincipal);
  }

  function buildGrupoZonaDescription(funcionarios) {
    const combinaciones = uniqueBy(
      funcionarios
        .map((funcionario) => {
          if (!funcionario.grupo || !funcionario.zona) return "";
          return `Grupo ${funcionario.grupo}, Zona ${funcionario.zona}`;
        })
        .filter(Boolean),
      normalizarTexto,
    );

    if (!combinaciones.length) return "";
    if (combinaciones.length === 1) return combinaciones[0];

    return `${joinNatural(combinaciones)} según corresponda a cada funcionario designado`;
  }

  function buildDesignacionText(funcionarios, destinoCompartido) {
    return joinNatural(
      funcionarios.map((funcionario) => {
        const partes = [`al ${formatFuncionarioConDependencia(funcionario)}`];
        const destino = normalizeSpaces(destinoCompartido);
        const fechas = formatDateRangeLong(
          funcionario.fechaInicio,
          funcionario.fechaFin,
        );
        const horas = [
          normalizeSpaces(funcionario.horaSalida)
            ? `salida ${normalizeSpaces(funcionario.horaSalida)} hs`
            : "",
          normalizeSpaces(funcionario.horaLlegada)
            ? `arribo ${normalizeSpaces(funcionario.horaLlegada)} hs`
            : "",
        ].filter(Boolean);
        const transporte = buildTransportText(funcionario.transporte).replace(
          /\.$/,
          "",
        );

        if (destino) {
          partes.push(`quien se trasladará a ${destino}`);
        }

        if (fechas) {
          partes.push(`desde el día ${fechas}`);
        }

        if (horas.length) {
          partes.push(`con ${joinNatural(horas)}`);
        }

        partes.push("incluido el tiempo de viaje");

        if (transporte) {
          partes.push(`mediante ${transporte}`);
        }

        return partes.join(", ");
      }),
    );
  }

  function buildFuncionariosExpulsionText(funcionarios) {
    return `${joinNatural(
      funcionarios.map((funcionario) =>
        formatFuncionarioConDependencia(funcionario),
      ),
    )}.`;
  }

  function buildAuthorityText(datosJudiciales) {
    const parts = [normalizeSpaces(datosJudiciales.organismoJudicial)];

    if (normalizeSpaces(datosJudiciales.juezACargo)) {
      parts.push(`a cargo de ${normalizeSpaces(datosJudiciales.juezACargo)}`);
    }

    if (normalizeSpaces(datosJudiciales.secretariaACargo)) {
      parts.push(
        `Secretaría a cargo de ${normalizeSpaces(datosJudiciales.secretariaACargo)}`,
      );
    }

    return parts.filter(Boolean).join(", ");
  }

  function buildRequerimientoBase(datosJudiciales) {
    const separadorAutoridad =
      normalizeSpaces(datosJudiciales.juezACargo) ||
      normalizeSpaces(datosJudiciales.secretariaACargo)
        ? ","
        : "";

    return `${buildAuthorityText(
      datosJudiciales,
    )}${separadorAutoridad} en el marco del Expediente Nº ${normalizeSpaces(
      datosJudiciales.numeroExpedienteCausaJudicial,
    )} caratulado: "${normalizeSpaces(datosJudiciales.caratulaCausaJudicial)}"`;
  }

  function buildMissionDestinationText(ubicaciones) {
    const normalized = uniqueBy(
      (ubicaciones || [])
        .map((ubicacion) => ({
          ciudad: normalizeSpaces(ubicacion.ciudad),
          pais: normalizeSpaces(ubicacion.pais),
        }))
        .filter((ubicacion) => ubicacion.ciudad || ubicacion.pais),
      (ubicacion) =>
        `${normalizarTexto(ubicacion.ciudad)}|${normalizarTexto(ubicacion.pais)}`,
    );

    return joinNatural(
      normalized.map((ubicacion) => {
        if (ubicacion.ciudad && ubicacion.pais) {
          return `la Ciudad de ${upper(ubicacion.ciudad)}, ${upper(
            getOfficialCountryName(ubicacion.pais),
          )}`;
        }

        if (ubicacion.ciudad) {
          return `la Ciudad de ${upper(ubicacion.ciudad)}`;
        }

        return upper(getOfficialCountryName(ubicacion.pais));
      }),
    );
  }

  function buildSharedDestinationText(funcionarios) {
    return buildMissionDestinationText(
      funcionarios.flatMap((funcionario) =>
        Array.isArray(funcionario.ubicaciones) ? funcionario.ubicaciones : [],
      ),
    );
  }

  function buildDateTimeSummary(funcionarios, dateField, timeField) {
    return uniqueBy(
      funcionarios
        .map((funcionario) => {
          const date = normalizeSpaces(funcionario[dateField]);
          return date ? formatDateShort(date) : "";
        })
        .filter(Boolean),
      normalizarTexto,
    ).join(" / ");
  }

  function buildDependenciasClause(funcionarios) {
    const dependenciaPrincipal = buildDependenciaPrincipal(funcionarios);
    if (!dependenciaPrincipal) {
      return "la dependencia interviniente";
    }

    return buildDependenciaConArticulo(dependenciaPrincipal);
  }

  function buildFuncionariosMisionTexto(
    funcionarios,
    dependenciaPrincipal,
    mode,
    options = {},
  ) {
    const { articlePrefix = "" } = options;

    return joinNatural(
      funcionarios.map((funcionario) => {
        const descripcion = formatFuncionarioConDependencia(
          funcionario,
          dependenciaPrincipal,
          options,
        );

        if (mode === "objeto") {
          return `al ${descripcion}`;
        }

        return articlePrefix ? `${articlePrefix} ${descripcion}` : descripcion;
      }),
    );
  }

  function buildTravelClause(funcionarios, destinoCompartido) {
    const fechas = formatDateRangeLong(
      funcionarios[0]?.fechaInicio,
      funcionarios[0]?.fechaFin,
    );
    const plural = funcionarios.length > 1;
    const partes = [];

    if (destinoCompartido) {
      partes.push(
        `${plural ? "quienes se trasladarán" : "quien se trasladará"} a ${destinoCompartido}`,
      );
    }

    if (fechas) {
      partes.push(`desde el día ${fechas}`);
    }

    partes.push("incluido el tiempo de viaje");

    return partes.join(", ");
  }

  function buildDesignacionText(
    funcionarios,
    destinoCompartido,
    dependenciaPrincipal,
  ) {
    const funcionariosTexto = buildFuncionariosMisionTexto(
      funcionarios,
      dependenciaPrincipal,
      "objeto",
      { modoSuperintendencia: "referenciada" },
    );
    const traslado = buildTravelClause(funcionarios, destinoCompartido);

    if (!traslado) return funcionariosTexto;
    return `${funcionariosTexto}, ${traslado}`;
  }

  function buildNotaDesignacionText(
    funcionarios,
    destinoCompartido,
    dependenciaPrincipal,
  ) {
    const funcionariosTexto = buildFuncionariosMisionTexto(
      funcionarios,
      dependenciaPrincipal,
      "lista",
      {
        modoSuperintendencia: "completo",
        articlePrefix: "el",
      },
    );
    const traslado = buildTravelClause(funcionarios, destinoCompartido);

    if (!traslado) return funcionariosTexto;
    return `${funcionariosTexto}, ${traslado}`;
  }

  function buildFuncionariosExpulsionText(funcionarios, dependenciaPrincipal) {
    return `${joinNatural(
      funcionarios.map((funcionario) =>
        formatFuncionarioConDependencia(funcionario, dependenciaPrincipal, {
          modoSuperintendencia: "completo",
        }),
      ),
    )}.`;
  }

  function buildAuthorityRequesterVerb(datosJudiciales) {
    const autoridades = [
      normalizeSpaces(datosJudiciales.juezACargo),
      normalizeSpaces(datosJudiciales.secretariaACargo),
    ].filter(Boolean);

    return autoridades.length > 1 ? "quienes solicitaron" : "quien solicitó";
  }

  function buildAuthorityText(datosJudiciales) {
    const organismoJudicial = buildDependenciaConArticulo(
      normalizeSpaces(datosJudiciales.organismoJudicial),
    );
    const parts = [organismoJudicial];

    const juezText = buildAuthorityRolePhrase(
      "juez",
      datosJudiciales.tratamientoJuez,
      datosJudiciales.juezACargo,
    );
    if (juezText) {
      parts.push(juezText);
    }

    const secretarioText = buildAuthorityRolePhrase(
      "secretario",
      datosJudiciales.tratamientoSecretario,
      datosJudiciales.secretariaACargo,
    );
    if (secretarioText) {
      parts.push(secretarioText);
    }

    return parts.filter(Boolean).join(", ");
  }

  function agregarMontoPorMoneda(totales, moneda, monto) {
    const amount = safeNumber(monto);
    const currency =
      String(moneda || "")
        .trim()
        .toUpperCase() || "USD";

    if (amount <= 0) return;
    totales[currency] = (totales[currency] || 0) + amount;
  }

  function buildTotalsByCurrency(funcionarios) {
    const totals = {
      pasajes: {},
      viaticos: {},
      alojamiento: {},
      cobertura: {},
      general: {},
    };

    funcionarios.forEach((funcionario) => {
      const moneda = funcionario.moneda || "USD";
      const totalPasajes = safeNumber(funcionario.totalPasajes);
      const totalViaticos = safeNumber(funcionario.totalViaticos);
      const totalAlojamiento = safeNumber(funcionario.totalAlojamiento);
      const totalCobertura = safeNumber(funcionario.totalCobertura);

      agregarMontoPorMoneda(totals.pasajes, moneda, totalPasajes);
      agregarMontoPorMoneda(totals.viaticos, moneda, totalViaticos);
      agregarMontoPorMoneda(totals.alojamiento, moneda, totalAlojamiento);
      agregarMontoPorMoneda(totals.cobertura, moneda, totalCobertura);
      agregarMontoPorMoneda(
        totals.general,
        moneda,
        totalPasajes + totalViaticos + totalAlojamiento + totalCobertura,
      );
    });

    return totals;
  }

  function formatCurrencyTotalsShort(totales, emptyText = "NO EROGA.") {
    const partes = Object.entries(totales)
      .filter(([, monto]) => safeNumber(monto) > 0)
      .sort(([monedaA], [monedaB]) => monedaA.localeCompare(monedaB))
      .map(
        ([moneda, monto]) =>
          `${currencyMeta(moneda).symbol} ${formatMoney(monto)}`,
      );

    return partes.length ? `${joinNatural(partes)}.` : emptyText;
  }

  function formatCurrencyTotalsWords(totales) {
    return joinNatural(
      Object.entries(totales)
        .filter(([, monto]) => safeNumber(monto) > 0)
        .sort(([monedaA], [monedaB]) => monedaA.localeCompare(monedaB))
        .map(([moneda, monto]) => amountToWords(monto, moneda)),
    );
  }

  function buildViaticosLine(funcionario) {
    const total = safeNumber(funcionario.totalViaticos);
    const diasComputables = safeNumber(funcionario.diasComputables);

    if (total <= 0 || diasComputables <= 0) return "";

    const breakdown = buildDailyBreakdown(funcionario);
    const partes = [];
    const rate = total / diasComputables;

    if (breakdown.fullDays > 0) {
      partes.push(
        `${quantityText(breakdown.fullDays, "día", "días")} al CIEN POR CIENTO (100%)`,
      );
    }

    if (breakdown.halfDays > 0) {
      partes.push(
        `${quantityText(
          breakdown.halfDays,
          "día",
          "días",
        )} al CINCUENTA POR CIENTO (50%)`,
      );
    }

    return `Para ${formatFuncionarioBase(funcionario)}: eroga una suma diaria e individual de ${amountToWords(
      rate,
      funcionario.moneda,
    )}, que por el término de ${quantityText(
      funcionario.diasCobertura,
      "día",
      "días",
    )} de comisión, ${partes.join(" y ")}, suma un total individual de ${amountToWords(
      total,
      funcionario.moneda,
    )}.`;
  }

  function buildAlojamientoLine(funcionario) {
    const total = safeNumber(funcionario.totalAlojamiento);
    const noches = safeNumber(funcionario.nochesAlojamiento);

    if (total <= 0 || noches <= 0) return "";

    return `Para ${formatFuncionarioBase(funcionario)}: eroga una suma diaria e individual de ${amountToWords(
      total / noches,
      funcionario.moneda,
    )}, se abonan ${quantityText(
      noches,
      "noche",
      "noches",
    )} al CIEN POR CIENTO (100%), lo que suma un total individual de ${amountToWords(
      total,
      funcionario.moneda,
    )}.`;
  }

  function buildCoberturaLine(funcionario) {
    const total = safeNumber(funcionario.totalCobertura);
    if (total <= 0) return "";

    return `Para ${formatFuncionarioBase(funcionario)}: eroga un total de ${amountToWords(
      total,
      funcionario.moneda,
    )}.`;
  }

  function buildPasajesLine(funcionario) {
    const total = safeNumber(funcionario.totalPasajes);
    if (total <= 0) return "";

    return `Para ${formatFuncionarioBase(funcionario)}: eroga un total de ${amountToWords(
      total,
      funcionario.moneda,
    )}.`;
  }

  function buildExpenseParagraph(
    funcionarios,
    lineBuilder,
    totalesMoneda,
    emptyText,
  ) {
    const lineas = funcionarios.map(lineBuilder).filter(Boolean);

    if (!lineas.length) {
      return emptyText;
    }

    const totalGeneral = formatCurrencyTotalsWords(totalesMoneda);
    return `${lineas.join(" ")} Total general: ${totalGeneral}.`;
  }

  function buildMontoTransporteText(funcionarios, totales) {
    if (
      !Object.values(totales.pasajes).some((monto) => safeNumber(monto) > 0)
    ) {
      return "NO APLICA - A/C DIRECCIÓN NACIONAL DE MIGRACIONES (DNM).";
    }

    return buildExpenseParagraph(
      funcionarios,
      buildPasajesLine,
      totales.pasajes,
      "NO APLICA - A/C DIRECCIÓN NACIONAL DE MIGRACIONES (DNM).",
    );
  }

  function buildFuncionariosDestinoTexto(count, capitalized = false) {
    let text = "los funcionarios";

    if (count === 1) {
      text = "el funcionario";
    } else if (count === 2) {
      text = "ambos funcionarios";
    }

    return capitalized ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function allFuncionariosShare(funcionarios, valueFn) {
    if (!funcionarios.length) return false;
    const first = valueFn(funcionarios[0]);
    return funcionarios.every((funcionario) => valueFn(funcionario) === first);
  }

  function buildViaticosResumenModelo(funcionarios, totals) {
    if (
      !Object.values(totals.viaticos).some((monto) => safeNumber(monto) > 0)
    ) {
      return "NO EROGA.";
    }

    const compatibles =
      funcionarios.length > 0 &&
      allFuncionariosShare(funcionarios, (funcionario) => funcionario.moneda) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        safeNumber(funcionario.totalViaticos),
      ) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        safeNumber(funcionario.diasComputables),
      ) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        safeNumber(funcionario.diasCobertura),
      ) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        JSON.stringify(buildDailyBreakdown(funcionario)),
      );

    if (!compatibles) {
      return buildExpenseParagraph(
        funcionarios,
        buildViaticosLine,
        totals.viaticos,
        "NO EROGA.",
      );
    }

    const referencia = funcionarios[0];
    const breakdown = buildDailyBreakdown(referencia);
    const partes = [];
    const rate =
      safeNumber(referencia.diasComputables) > 0
        ? safeNumber(referencia.totalViaticos) /
          safeNumber(referencia.diasComputables)
        : 0;

    if (breakdown.fullDays > 0) {
      partes.push(
        `${quantityText(breakdown.fullDays, "día", "días")} al CIEN POR CIENTO (100%)`,
      );
    }

    if (breakdown.halfDays > 0) {
      partes.push(
        `${quantityText(
          breakdown.halfDays,
          "día",
          "días",
        )} al CINCUENTA POR CIENTO (50%)`,
      );
    }

    return `Eroga una suma diaria e individual de ${amountToWords(
      rate,
      referencia.moneda,
    )}, que por el término de ${quantityText(
      referencia.diasCobertura,
      "día",
      "días",
    )} de comisión, ${partes.join(" y ")}, suma un total para ${buildFuncionariosDestinoTexto(
      funcionarios.length,
    )} de ${formatCurrencyTotalsWords(totals.viaticos)}.`;
  }

  function buildAlojamientoResumenModelo(funcionarios, totals) {
    if (
      !Object.values(totals.alojamiento).some((monto) => safeNumber(monto) > 0)
    ) {
      return "NO EROGA.";
    }

    const compatibles =
      funcionarios.length > 0 &&
      allFuncionariosShare(funcionarios, (funcionario) => funcionario.moneda) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        safeNumber(funcionario.totalAlojamiento),
      ) &&
      allFuncionariosShare(funcionarios, (funcionario) =>
        safeNumber(funcionario.nochesAlojamiento),
      );

    if (!compatibles) {
      return buildExpenseParagraph(
        funcionarios,
        buildAlojamientoLine,
        totals.alojamiento,
        "NO EROGA.",
      );
    }

    const referencia = funcionarios[0];
    const noches = safeNumber(referencia.nochesAlojamiento);
    const rate =
      noches > 0 ? safeNumber(referencia.totalAlojamiento) / noches : 0;

    return `Eroga una suma diaria e individual de ${amountToWords(
      rate,
      referencia.moneda,
    )}, se abonan ${quantityText(
      noches,
      "día",
      "días",
    )} al CIEN POR CIENTO (100%), lo que suma un total para ${buildFuncionariosDestinoTexto(
      funcionarios.length,
    )} de ${formatCurrencyTotalsWords(totals.alojamiento)}.`;
  }

  function buildCoberturaResumenModelo(funcionarios, totals) {
    if (
      !Object.values(totals.cobertura).some((monto) => safeNumber(monto) > 0)
    ) {
      return "NO EROGA.";
    }

    return `${buildFuncionariosDestinoTexto(
      funcionarios.length,
      true,
    )} eroga un total de ${formatCurrencyTotalsWords(totals.cobertura)}.`;
  }

  function buildSummaryTexts(funcionarios) {
    const totals = buildTotalsByCurrency(funcionarios);

    return {
      totalViaticosCorto: formatCurrencyTotalsShort(totals.viaticos),
      totalAlojamientoCorto: formatCurrencyTotalsShort(totals.alojamiento),
      totalCoberturaCorto: formatCurrencyTotalsShort(totals.cobertura),
      montoTransporteTexto: buildMontoTransporteText(funcionarios, totals),
      detalleViaticosTexto: buildViaticosResumenModelo(funcionarios, totals),
      detalleAlojamientoTexto: buildAlojamientoResumenModelo(
        funcionarios,
        totals,
      ),
      detalleCoberturaTexto: buildCoberturaResumenModelo(funcionarios, totals),
      costoTotalTexto: Object.values(totals.general).some(
        (monto) => safeNumber(monto) > 0,
      )
        ? `${formatCurrencyTotalsWords(totals.general)}.`
        : "NO EROGA.",
    };
  }

  function validateData(data) {
    const errors = [];
    const datosJudiciales = data.datosJudiciales || {};
    const funcionarios = Array.isArray(data.funcionarios)
      ? data.funcionarios
      : [];

    const requiredGeneral = [
      ["número interno de expediente", datosJudiciales.numeroInternoExpediente],
      ["número de expediente", datosJudiciales.expedienteElectronico],
      ["organismo judicial", datosJudiciales.organismoJudicial],
      ["carátula de la causa judicial", datosJudiciales.caratulaCausaJudicial],
      [
        "número de expediente de la causa judicial",
        datosJudiciales.numeroExpedienteCausaJudicial,
      ],
      ["nombre del detenido", datosJudiciales.nombreDetenido],
      ["nacionalidad del detenido", datosJudiciales.nacionalidadDetenido],
    ];

    requiredGeneral.forEach(([label, value]) => {
      if (!normalizeSpaces(value)) {
        errors.push(`Falta completar ${label}.`);
      }
    });

    if (
      normalizeSpaces(datosJudiciales.juezACargo) &&
      !normalizeSpaces(datosJudiciales.tratamientoJuez)
    ) {
      errors.push("Falta seleccionar Doctor o Doctora para el juez.");
    }

    if (
      normalizeSpaces(datosJudiciales.secretariaACargo) &&
      !normalizeSpaces(datosJudiciales.tratamientoSecretario)
    ) {
      errors.push("Falta seleccionar Doctor o Doctora para el secretario/a.");
    }

    if (!funcionarios.length) {
      errors.push("Debe haber al menos un funcionario cargado.");
      return errors;
    }

    funcionarios.forEach((funcionario, index) => {
      const prefix = `Funcionario ${index + 1}`;
      const requiredFuncionario = [
        ["jerarquía", funcionario.jerarquiaTexto || funcionario.jerarquia],
        ["L.P.", funcionario.lp],
        ["D.N.I.", funcionario.dni],
        [
          "nombre o siglas",
          normalizeSpaces(funcionario.siglas) ||
            normalizeSpaces(funcionario.nombre) ||
            normalizeSpaces(funcionario.apellido),
        ],
        ["destino del funcionario", funcionario.destino],
        ["fecha de inicio", funcionario.fechaInicio],
        ["fecha de finalización", funcionario.fechaFin],
        ["horario de salida", funcionario.horaSalida],
        ["horario de llegada", funcionario.horaLlegada],
      ];

      requiredFuncionario.forEach(([label, value]) => {
        if (!normalizeSpaces(value)) {
          errors.push(`${prefix}: falta completar ${label}.`);
        }
      });

      const ubicaciones = Array.isArray(funcionario.ubicaciones)
        ? funcionario.ubicaciones.filter(
            (item) =>
              normalizeSpaces(item.ciudad) || normalizeSpaces(item.pais),
          )
        : [];

      if (!ubicaciones.length) {
        errors.push(`${prefix}: falta cargar al menos una ciudad o país.`);
      }

      if (
        !Array.isArray(funcionario.transporte) ||
        !funcionario.transporte.length
      ) {
        errors.push(`${prefix}: falta seleccionar el medio de transporte.`);
      }
    });

    return errors;
  }

  function buildContext(data) {
    const errors = validateData(data);
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }

    const datosJudiciales = data.datosJudiciales;
    const funcionarios = data.funcionarios;
    const authorityText = buildAuthorityText(datosJudiciales);
    const authorityRequesterVerb = buildAuthorityRequesterVerb(datosJudiciales);
    const requerimientoBase = buildRequerimientoBase(datosJudiciales);
    const dependenciaPrincipal = buildDependenciaPrincipal(funcionarios);
    const destinoCompartido = buildSharedDestinationText(funcionarios);
    const designacionText = buildDesignacionText(
      funcionarios,
      destinoCompartido,
      dependenciaPrincipal,
    );
    const notaDesignacionText = buildNotaDesignacionText(
      funcionarios,
      destinoCompartido,
      dependenciaPrincipal,
    );
    const nombresConDependencia = buildFuncionariosExpulsionText(
      funcionarios,
      dependenciaPrincipal,
    );
    const expulsionAsuntoTitulo = buildExpulsionTitle(funcionarios);
    const fechaSalidaCorta = buildDateTimeSummary(
      funcionarios,
      "fechaInicio",
      "horaSalida",
    );
    const fechaRetornoCorta = buildDateTimeSummary(
      funcionarios,
      "fechaFin",
      "horaLlegada",
    );
    const nombreDetenido = normalizeSpaces(datosJudiciales.nombreDetenido);
    const nacionalidad = normalizeSpaces(datosJudiciales.nacionalidadDetenido);
    const grupoZona = buildGrupoZonaDescription(funcionarios);
    const dependenciasClause = buildDependenciasClause(funcionarios);
    const summaryTexts = buildSummaryTexts(funcionarios);

    return {
      expediente_electronico: normalizeSpaces(
        datosJudiciales.expedienteElectronico,
      ),
      numero_interno_expediente: normalizeSpaces(
        datosJudiciales.numeroInternoExpediente,
      ),
      expulsion_asunto_titulo: expulsionAsuntoTitulo,
      fecha_salida_corta: fechaSalidaCorta,
      fecha_retorno_corta: fechaRetornoCorta,
      detenido_nombre_con_punto: `${nombreDetenido}.`,
      medio_transporte_texto: buildTransportSummary(funcionarios),
      total_viaticos_corto: summaryTexts.totalViaticosCorto,
      total_alojamiento_corto: summaryTexts.totalAlojamientoCorto,
      total_cobertura_corto: summaryTexts.totalCoberturaCorto,
      monto_transporte_texto: summaryTexts.montoTransporteTexto,
      detalle_viaticos_texto: summaryTexts.detalleViaticosTexto,
      detalle_alojamiento_texto: summaryTexts.detalleAlojamientoTexto,
      detalle_cobertura_texto: summaryTexts.detalleCoberturaTexto,
      costo_total_texto: summaryTexts.costoTotalTexto,
      expulsion_requerimiento_texto: `Requerimiento efectuado por ${authorityText} en el marco del Expediente Nº ${normalizeSpaces(
        datosJudiciales.numeroExpedienteCausaJudicial,
      )} caratulado: "${normalizeSpaces(
        datosJudiciales.caratulaCausaJudicial,
      )}".`,
      expulsion_funcionarios_texto: nombresConDependencia,
      elevacion_requerimiento_texto: `Se tomó conocimiento del presente expediente relacionado con el requerimiento efectuado por ${requerimientoBase}, ${authorityRequesterVerb} cumplimentar la expulsión de nuestro país del ciudadano de nacionalidad ${nacionalidad} "${nombreDetenido}".`,
      elevacion_postulacion_texto: `Previa intervención de esta área ha tomado razón del presente ${dependenciasClause}, quien postuló a ${buildPostulacionFuncionariosText(
        funcionarios,
      )}.`,
      if_finalizacion_requerimiento_texto: `El presente expediente se encuentra relacionado con el requerimiento efectuado por ${requerimientoBase}, ${authorityRequesterVerb} cumplimentar la expulsión de nuestro país del ciudadano de nacionalidad ${nacionalidad} "${nombreDetenido}".`,
      informe_requerimiento_texto: `Se diligencia el presente expediente, acorde a lo dispuesto por la Gestión ADMINISTRATIVA - JEFATURA en ORDEN #14, relacionado con el requerimiento efectuado por ${requerimientoBase}, ${authorityRequesterVerb} cumplimentar la expulsión de nuestro país del ciudadano de nacionalidad ${nacionalidad} mencionado anteriormente.`,
      informe_designacion_texto: `${buildDependenciaConArticulo(
        dependenciaPrincipal,
        true,
      )} designó para cumplimentar dicha misión ${designacionText}, a fin de efectivizar dicho desplazamiento.`,
      informe_grupo_zona_parrafo: `El gasto resultante de la presente misión se calculó conforme lo previsto por el Decreto Nro. 997 de fecha 7 de septiembre de 2016 y Decisión Administrativa Nro. 888/2024, Anexo III y IV, nivel jerárquico ${grupoZona || "según corresponda"} y directivas impartidas por el Comando Institucional tendientes a la optimización de los recursos, a saber:`,
      nota_intro_texto: `En razón del expediente electrónico: ${normalizeSpaces(
        datosJudiciales.expedienteElectronico,
      )}, relacionado con la expulsión de nuestro país del ciudadano de nacionalidad ${nacionalidad} "${nombreDetenido}" y para la cual ${
        funcionarios.length > 1 ? "fueron designados" : "fue designado"
      } ${notaDesignacionText}, a fin de efectivizar dicho desplazamiento.`,
    };
  }

  function createZip(entries) {
    const now = new Date();
    const dosTime =
      ((now.getHours() & 0x1f) << 11) |
      ((now.getMinutes() & 0x3f) << 5) |
      Math.trunc(now.getSeconds() / 2);
    const dosDate =
      (((now.getFullYear() - 1980) & 0x7f) << 9) |
      (((now.getMonth() + 1) & 0x0f) << 5) |
      (now.getDate() & 0x1f);

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    entries.forEach((entry) => {
      const nameBytes = encodeText(entry.name);
      const data = entry.bytes;
      const crc = crc32(data);

      const local = new Uint8Array(30 + nameBytes.length + data.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, dosTime, true);
      localView.setUint16(12, dosDate, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, data.length, true);
      localView.setUint32(22, data.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      local.set(data, 30 + nameBytes.length);
      localParts.push(local);

      const central = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, dosTime, true);
      centralView.setUint16(14, dosDate, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, data.length, true);
      centralView.setUint32(24, data.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length;
    });

    const centralSize = centralParts.reduce(
      (sum, item) => sum + item.length,
      0,
    );
    const centralOffset = offset;

    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, entries.length, true);
    endView.setUint16(10, entries.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, centralOffset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  function buildDocumentBlob(templateDefinition, context) {
    const entries = Object.entries(templateDefinition.files).map(
      ([name, base64]) => {
        let bytes = decodeBase64(base64);

        if (templateDefinition.templatePaths.includes(name)) {
          const templateText = decodeText(bytes);
          const rendered = renderTemplate(templateText, context);
          bytes = encodeText(rendered);
        }

        return { name, bytes };
      },
    );

    return createZip(entries);
  }

  function downloadBlob(filename, blob, delay) {
    window.setTimeout(() => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, delay);
  }

  function generarDocumentos(datos) {
    if (!window.DOCX_TEMPLATES) {
      throw new Error("No se pudieron cargar las plantillas DOCX.");
    }

    const context = buildContext(datos);
    const templateOrder = [
      "expulsion",
      "elevacion",
      "ifFinalizacion",
      "informeNotaCobro",
    ];

    const generated = [];

    templateOrder.forEach((key, index) => {
      const definition = window.DOCX_TEMPLATES[key];
      if (!definition) {
        throw new Error(`Falta la plantilla ${key}.`);
      }

      const blob = buildDocumentBlob(definition, context);
      generated.push(definition.outputName);
      downloadBlob(definition.outputName, blob, index * 250);
    });

    return generated;
  }

  window.ExpulsionesWord = {
    generarDocumentos,
  };
})();
