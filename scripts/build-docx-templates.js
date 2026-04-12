const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT, "JavaScript", "docxTemplates.js");

const TEMPLATE_DEFINITIONS = [
  {
    id: "expulsion",
    outputName: "Expulsion.docx",
    sourceDir: path.join(ROOT, ".tmp_docx", "expulsion_colombia3"),
    transformDocument: buildExpulsionDocument,
  },
  {
    id: "elevacion",
    outputName: "Elevacion.docx",
    sourceDir: path.join(ROOT, ".tmp_docx", "elevacion3"),
    transformDocument: buildElevacionDocument,
  },
  {
    id: "ifFinalizacion",
    outputName: "If de finalizacion.docx",
    sourceDir: path.join(ROOT, ".tmp_docx", "if_finalizacion3"),
    transformDocument: buildIfFinalizacionDocument,
  },
  {
    id: "informeNotaCobro",
    outputName: "Informe y nota de cobro.docx",
    sourceDir: path.join(ROOT, ".tmp_docx", "informe_nota3"),
    transformDocument: buildInformeNotaDocument,
  },
];

function walkFiles(dir, rootDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absPath, rootDir));
      continue;
    }

    files.push({
      absPath,
      relPath: path.relative(rootDir, absPath).split(path.sep).join("/"),
    });
  }

  return files;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeRunPr(value = "") {
  return value.replace(/<w:highlight\b[^>]*\/>/g, "");
}

function extractParagraphParts(paragraph) {
  const startTagMatch = paragraph.match(/^<w:p\b[^>]*>/);
  if (!startTagMatch) {
    throw new Error("No se pudo extraer el inicio de un párrafo DOCX.");
  }

  const pPrMatch = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const runPrMatches = [...paragraph.matchAll(/<w:r\b[^>]*>(<w:rPr>[\s\S]*?<\/w:rPr>)?/g)];

  return {
    startTag: startTagMatch[0],
    pPr: pPrMatch ? pPrMatch[0] : "",
    runPrs: runPrMatches.map((match) => sanitizeRunPr(match[1] || "")),
  };
}

function buildRun(text, runPr = "") {
  return `<w:r>${runPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function buildParagraph(paragraph, runs) {
  const parts = extractParagraphParts(paragraph);
  const body = runs
    .map((run) => buildRun(run.text, run.runPr || ""))
    .join("");

  return `${parts.startTag}${parts.pPr}${body}</w:p>`;
}

function buildPlainParagraph(paragraph, text) {
  const parts = extractParagraphParts(paragraph);
  return buildParagraph(paragraph, [
    {
      text,
      runPr: parts.runPrs[0] || "",
    },
  ]);
}

function buildHeadingParagraph(paragraph, headingText, valueText) {
  const parts = extractParagraphParts(paragraph);
  return buildParagraph(paragraph, [
    {
      text: headingText,
      runPr: parts.runPrs[0] || "",
    },
    {
      text: ` ${valueText}`,
      runPr: parts.runPrs[1] || "",
    },
  ]);
}

function replaceParagraphs(xml, replacements) {
  const paragraphs = [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)];
  let output = "";
  let lastIndex = 0;

  paragraphs.forEach((match, index) => {
    const paragraphNumber = index + 1;
    output += xml.slice(lastIndex, match.index);

    if (replacements[paragraphNumber]) {
      output += replacements[paragraphNumber](match[0]);
    } else {
      output += match[0];
    }

    lastIndex = match.index + match[0].length;
  });

  output += xml.slice(lastIndex);
  return output;
}

function buildExpulsionDocument(xml) {
  return replaceParagraphs(xml, {
    7: (paragraph) =>
      buildPlainParagraph(
        paragraph,
        "COMISIÓN EXPEDIENTE {{expediente_electronico}}",
      ),
    8: (paragraph) =>
      buildPlainParagraph(
        paragraph,
        "EXPEDIENTE INTERNO N° {{numero_interno_expediente}}",
      ),
    11: (paragraph) =>
      buildPlainParagraph(paragraph, "{{expulsion_asunto_titulo}}"),
    12: (paragraph) =>
      buildPlainParagraph(paragraph, "{{expulsion_requerimiento_texto}}"),
    14: (paragraph) =>
      buildPlainParagraph(paragraph, "{{fecha_salida_corta}}"),
    16: (paragraph) =>
      buildPlainParagraph(paragraph, "{{fecha_retorno_corta}}"),
    18: (paragraph) =>
      buildPlainParagraph(paragraph, "{{expulsion_funcionarios_texto}}"),
    20: (paragraph) =>
      buildPlainParagraph(paragraph, "{{detenido_nombre_con_punto}}"),
    22: (paragraph) =>
      buildPlainParagraph(paragraph, "{{medio_transporte_texto}}"),
    24: (paragraph) =>
      buildPlainParagraph(paragraph, "{{monto_transporte_texto}}"),
    26: (paragraph) =>
      buildPlainParagraph(paragraph, "{{total_viaticos_corto}}"),
    28: (paragraph) =>
      buildPlainParagraph(paragraph, "{{total_alojamiento_corto}}"),
    30: (paragraph) =>
      buildPlainParagraph(paragraph, "{{total_cobertura_corto}}"),
    31: (paragraph) => buildPlainParagraph(paragraph, ""),
    32: (paragraph) => buildPlainParagraph(paragraph, ""),
  });
}

function buildElevacionDocument(xml) {
  return replaceParagraphs(xml, {
    2: (paragraph) =>
      buildPlainParagraph(paragraph, "{{elevacion_requerimiento_texto}}"),
    4: (paragraph) =>
      buildPlainParagraph(paragraph, "{{elevacion_postulacion_texto}}"),
  });
}

function buildIfFinalizacionDocument(xml) {
  return replaceParagraphs(xml, {
    3: (paragraph) =>
      buildPlainParagraph(
        paragraph,
        "{{if_finalizacion_requerimiento_texto}}",
      ),
  });
}

function buildInformeNotaDocument(xml) {
  return replaceParagraphs(xml, {
    3: (paragraph) =>
      buildPlainParagraph(paragraph, "{{informe_requerimiento_texto}}"),
    5: (paragraph) =>
      buildPlainParagraph(paragraph, "{{informe_designacion_texto}}"),
    9: (paragraph) =>
      buildPlainParagraph(paragraph, "{{informe_grupo_zona_parrafo}}"),
    11: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "VIÁTICOS:",
        "{{detalle_viaticos_texto}}",
      ),
    13: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "ALOJAMIENTO:",
        "{{detalle_alojamiento_texto}}",
      ),
    15: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "COBERTURA MÉDICO ASISTENCIAL:",
        "{{detalle_cobertura_texto}}",
      ),
    17: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "COSTO TOTAL DE LA COMISIÓN:",
        "{{costo_total_texto}}",
      ),
    34: (paragraph) =>
      buildPlainParagraph(paragraph, "{{nota_intro_texto}}"),
    38: (paragraph) =>
      buildPlainParagraph(paragraph, "{{informe_grupo_zona_parrafo}}"),
    40: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "VIÁTICOS:",
        "{{detalle_viaticos_texto}}",
      ),
    42: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "ALOJAMIENTO:",
        "{{detalle_alojamiento_texto}}",
      ),
    44: (paragraph) =>
      buildHeadingParagraph(
        paragraph,
        "COBERTURA MÉDICO ASISTENCIAL:",
        "{{detalle_cobertura_texto}}",
      ),
  });
}

function buildManifest() {
  const manifest = {};

  for (const definition of TEMPLATE_DEFINITIONS) {
    const templateFiles = {};

    for (const file of walkFiles(definition.sourceDir)) {
      let contents = fs.readFileSync(file.absPath);

      if (file.relPath === "word/document.xml") {
        const documentXml = contents.toString("utf8");
        contents = Buffer.from(
          definition.transformDocument(documentXml),
          "utf8",
        );
      }

      templateFiles[file.relPath] = contents.toString("base64");
    }

    manifest[definition.id] = {
      outputName: definition.outputName,
      templatePaths: ["word/document.xml"],
      files: templateFiles,
    };
  }

  return manifest;
}

function main() {
  const manifest = buildManifest();
  const js = `window.DOCX_TEMPLATES = ${JSON.stringify(manifest)};\n`;
  fs.writeFileSync(OUTPUT_FILE, js, "utf8");
  console.log(`Plantillas DOCX generadas en: ${OUTPUT_FILE}`);
}

main();
