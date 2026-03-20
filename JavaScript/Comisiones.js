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

  function crearBloqueUbicacion() {
    const contenedor = document.createElement("div");
    contenedor.className = "ubicacion-item";

    contenedor.innerHTML = `
      <div class="fila fila-dos">
        <div class="campo">
          <label>Ciudad</label>
          <input type="text" class="campo-ciudad">
        </div>

        <div class="campo">
          <label>País</label>
          <input type="text" class="campo-pais">
        </div>
      </div>
    `;

    return contenedor;
  }

  function actualizarEstadoEliminarUbicacion(formulario) {
    const contenedorUbicaciones = formulario.querySelector(
      ".contenedor-ubicaciones",
    );
    const btnEliminarUbicacion = formulario.querySelector(
      ".btn-eliminar-ubicacion",
    );

    if (contenedorUbicaciones.children.length > 1) {
      btnEliminarUbicacion.classList.remove("oculto");
    } else {
      btnEliminarUbicacion.classList.add("oculto");
    }
  }

  function calcularDuracion(formulario) {
    const fechaInicio = formulario.querySelector(".campo-fecha-inicio").value;
    const fechaFin = formulario.querySelector(".campo-fecha-fin").value;
    const campoDuracion = formulario.querySelector(".campo-duracion");

    if (!fechaInicio || !fechaFin) {
      campoDuracion.value = "";
      return;
    }

    const inicio = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    if (fin < inicio) {
      campoDuracion.value = "Rango inválido";
      return;
    }

    const diferencia = fin - inicio;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

    campoDuracion.value = dias === 1 ? "1 día" : `${dias} días`;
  }

  function cerrarTodosLosMultiselects() {
    document.querySelectorAll(".multiselect").forEach((item) => {
      item.classList.remove("abierto");
    });
  }

  function actualizarTextoMultiselect(multiselect) {
    const boton = multiselect.querySelector(".multiselect-boton");
    const checksSeleccionados = multiselect.querySelectorAll(
      'input[type="checkbox"]:checked',
    );
    const textos = Array.from(checksSeleccionados).map((check) => check.value);

    if (textos.length === 0) {
      boton.textContent = "EN CASO DE EROGAR";
      return;
    }

    boton.textContent = textos.join(", ");
  }

  function inicializarMultiselects(formulario) {
    const multiselects = formulario.querySelectorAll(".multiselect");

    multiselects.forEach((multiselect) => {
      const boton = multiselect.querySelector(".multiselect-boton");
      const checks = multiselect.querySelectorAll('input[type="checkbox"]');

      boton.addEventListener("click", (e) => {
        e.stopPropagation();

        document.querySelectorAll(".multiselect").forEach((otro) => {
          if (otro !== multiselect) {
            otro.classList.remove("abierto");
          }
        });

        multiselect.classList.toggle("abierto");
      });

      checks.forEach((check) => {
        check.addEventListener("change", () => {
          actualizarTextoMultiselect(multiselect);
        });
      });

      actualizarTextoMultiselect(multiselect);
    });
  }

  function actualizarSelectorEliminarFuncionario() {
    const formularios = document.querySelectorAll(".bloque-funcionario");
    selectorFuncionarioEliminar.innerHTML = `<option value="">Seleccionar funcionario</option>`;

    formularios.forEach((formulario, indice) => {
      const opcion = document.createElement("option");
      opcion.value = formulario.dataset.funcionarioId;
      opcion.textContent = `Funcionario ${indice + 1}`;
      selectorFuncionarioEliminar.appendChild(opcion);
    });
  }

  function renumerarFuncionarios() {
    const formularios = document.querySelectorAll(".bloque-funcionario");

    formularios.forEach((formulario, indice) => {
      formulario.dataset.ordenVisual = indice + 1;
      const numero = formulario.querySelector(".numero-funcionario");
      if (numero) {
        numero.textContent = indice + 1;
      }
    });

    actualizarSelectorEliminarFuncionario();
  }

  function inicializarFormulario(formulario) {
    const contenedorUbicaciones = formulario.querySelector(
      ".contenedor-ubicaciones",
    );
    const btnAgregarUbicacion = formulario.querySelector(
      ".btn-agregar-ubicacion",
    );
    const btnEliminarUbicacion = formulario.querySelector(
      ".btn-eliminar-ubicacion",
    );
    const campoFechaInicio = formulario.querySelector(".campo-fecha-inicio");
    const campoFechaFin = formulario.querySelector(".campo-fecha-fin");

    contenedorUbicaciones.appendChild(crearBloqueUbicacion());
    actualizarEstadoEliminarUbicacion(formulario);

    btnAgregarUbicacion.addEventListener("click", () => {
      if (contenedorUbicaciones.children.length >= 10) {
        alert("Solo se pueden agregar hasta 10 bloques de ciudad y país.");
        return;
      }

      contenedorUbicaciones.appendChild(crearBloqueUbicacion());
      actualizarEstadoEliminarUbicacion(formulario);
    });

    btnEliminarUbicacion.addEventListener("click", () => {
      if (contenedorUbicaciones.children.length > 1) {
        contenedorUbicaciones.removeChild(
          contenedorUbicaciones.lastElementChild,
        );
      }

      actualizarEstadoEliminarUbicacion(formulario);
    });

    campoFechaInicio.addEventListener("change", () =>
      calcularDuracion(formulario),
    );
    campoFechaFin.addEventListener("change", () =>
      calcularDuracion(formulario),
    );

    inicializarMultiselects(formulario);
  }

  function crearFormularioFuncionario() {
    const clon = templateFuncionario.content.cloneNode(true);
    const formulario = clon.querySelector(".bloque-funcionario");

    formulario.dataset.funcionarioId = `funcionario-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    inicializarFormulario(formulario);
    contenedorFuncionarios.appendChild(formulario);
    renumerarFuncionarios();
  }

  function eliminarFuncionarioSeleccionado() {
    const formularios = document.querySelectorAll(".bloque-funcionario");
    const idSeleccionado = selectorFuncionarioEliminar.value;

    if (!idSeleccionado) {
      alert("Seleccioná qué funcionario querés eliminar.");
      return;
    }

    if (formularios.length <= 1) {
      alert("Debe quedar al menos un funcionario cargado.");
      return;
    }

    const formularioAEliminar = document.querySelector(
      `.bloque-funcionario[data-funcionario-id="${idSeleccionado}"]`,
    );

    if (formularioAEliminar) {
      formularioAEliminar.remove();
      renumerarFuncionarios();
    }
  }

  function obtenerValoresMultiselect(multiselect) {
    const checksSeleccionados = multiselect.querySelectorAll(
      'input[type="checkbox"]:checked',
    );
    return Array.from(checksSeleccionados).map((check) => check.value);
  }

  function recolectarDatos() {
    const formularios = document.querySelectorAll(".bloque-funcionario");

    return Array.from(formularios).map((formulario, indice) => {
      const ubicaciones = Array.from(
        formulario.querySelectorAll(".contenedor-ubicaciones .ubicacion-item"),
      ).map((ubicacion) => ({
        ciudad: ubicacion.querySelector(".campo-ciudad")?.value.trim() || "",
        pais: ubicacion.querySelector(".campo-pais")?.value.trim() || "",
      }));

      const multiselects = formulario.querySelectorAll(".multiselect");

      return {
        funcionario: indice + 1,
        jerarquia: formulario.querySelector(".campo-jerarquia")?.value || "",
        lp: formulario.querySelector(".campo-lp")?.value.trim() || "",
        dni: formulario.querySelector(".campo-dni")?.value.trim() || "",
        nombre: formulario.querySelector(".campo-nombre")?.value.trim() || "",
        apellido:
          formulario.querySelector(".campo-apellido")?.value.trim() || "",
        destino: formulario.querySelector(".campo-destino")?.value.trim() || "",
        superintendencia:
          formulario.querySelector(".campo-superintendencia")?.value.trim() ||
          "",
        motivoComision:
          formulario.querySelector(".campo-motivo")?.value.trim() || "",
        fechaInicio:
          formulario.querySelector(".campo-fecha-inicio")?.value || "",
        fechaFin: formulario.querySelector(".campo-fecha-fin")?.value || "",
        horaSalida: formulario.querySelector(".campo-hora-salida")?.value || "",
        horaLlegada:
          formulario.querySelector(".campo-hora-llegada")?.value || "",
        ubicaciones,
        duracionTotal: formulario.querySelector(".campo-duracion")?.value || "",
        gastos: obtenerValoresMultiselect(multiselects[0]),
        numeroExpediente:
          formulario.querySelector(".campo-expediente")?.value.trim() || "",
        medioTransporte: obtenerValoresMultiselect(multiselects[1]),
        aporteOrganismo:
          formulario.querySelector(".campo-aporte")?.value.trim() || "",
      };
    });
  }

  btnAgregarFuncionario.addEventListener("click", () => {
    crearFormularioFuncionario();
    btnAgregarFuncionario.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  btnEliminarFuncionario.addEventListener("click", () => {
    eliminarFuncionarioSeleccionado();
  });

  btnGenerarWord.addEventListener("click", () => {
    const datos = recolectarDatos();
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
