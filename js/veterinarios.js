// La clave bajo la que se guarda la lista en el LocalStorage
const CLAVE = "veterinarios";

// Lista de especializaciones predefinidas
const ESPECIALIZACIONES = [
  "Clínica general",
  "Cirugía",
  "Animales pequeños",
  "Animales exóticos",
  "Cardiología",
  "Dermatología",
  "Odontología",
  "Oftalmología",
  "Urgencias y cuidados intensivos"
];

// ---------- 1. Buscar los elementos del HTML (por su id) ----------
const formulario = document.getElementById("formVeterinario");
const inputId = document.getElementById("idVeterinario"); // campo oculto
const inputNombre = document.getElementById("nombre");
const inputMatricula = document.getElementById("matricula");
const selectEspecializacion = document.getElementById("especializacion");
const inputValor = document.getElementById("valorConsulta");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const mensaje = document.getElementById("mensaje");

const tabla = document.getElementById("tablaVeterinarios");
const sinDatos = document.getElementById("sinDatos");
const buscador = document.getElementById("buscador");
const selectFiltro = document.getElementById("filtroEspecializacion");
const btnNuevo = document.getElementById("btnNuevo");

const nombreEliminar = document.getElementById("nombreEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

// Los dos modals de Bootstrap
const elementoModalVeterinario = document.getElementById("modalVeterinario");
const modalVeterinario = new bootstrap.Modal(elementoModalVeterinario);
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));

// Acá guardamos el id del veterinario que se quiere eliminar (hasta que confirme)
let idParaEliminar = null;

// ---------- 2. Funciones de ayuda ----------

// Convierte 15000 en "$ 15.000,00"
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(valor);
}

function mostrarError(texto) {
  mensaje.textContent = texto;
  mensaje.classList.remove("d-none");
}

function ocultarError() {
  mensaje.classList.add("d-none");
}

// Carga las opciones de la lista de especializaciones en el <select> del formulario
function cargarOpcionesEspecializacion() {
  ESPECIALIZACIONES.forEach(function (especializacion) {
    const opcion = document.createElement("option");
    opcion.value = especializacion;
    opcion.textContent = especializacion;
    selectEspecializacion.appendChild(opcion);
  });
}

// Si un veterinario viejo tiene una especialización que no está en la lista,
// la agregamos de forma temporal para poder editarlo sin perder el dato.
function asegurarOpcion(especializacion) {
  const existe = Array.from(selectEspecializacion.options).some(function (opcion) {
    return opcion.value === especializacion;
  });
  if (!existe) {
    const opcion = document.createElement("option");
    opcion.value = especializacion;
    opcion.textContent = especializacion;
    opcion.dataset.temporal = "si";
    selectEspecializacion.appendChild(opcion);
  }
}

// Deja el formulario vacío y en modo "registrar"
function limpiarFormulario() {
  formulario.reset();
  inputId.value = "";
  selectEspecializacion.querySelectorAll("option[data-temporal]").forEach(function (opcion) {
    opcion.remove();
  });
  tituloFormulario.textContent = "Registrar veterinario";
  btnGuardar.textContent = "Guardar";
  ocultarError();
}

// Crea una celda <td> con un texto adentro.
function crearCelda(texto, clase, etiqueta) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  celda.dataset.label = etiqueta;
  if (clase) {
    celda.className = clase;
  }
  return celda;
}

// ---------- 3. FILTRO: armar las opciones según lo que hay guardado ----------

function actualizarFiltro(lista) {
  const seleccionada = selectFiltro.value; 

  selectFiltro.innerHTML = "";

  const todas = document.createElement("option");
  todas.value = "";
  todas.textContent = "Todas las especializaciones";
  selectFiltro.appendChild(todas);

  // Especializaciones distintas que existen en los datos, ordenadas alfabéticamente
  const distintas = Array.from(new Set(lista.map(function (vet) {
    return vet.especializacion;
  }))).sort(function (a, b) {
    return a.localeCompare(b, "es");
  });

  distintas.forEach(function (especializacion) {
    const opcion = document.createElement("option");
    opcion.value = especializacion;
    opcion.textContent = especializacion;
    selectFiltro.appendChild(opcion);
  });

  // Si la especialización elegida todavía existe, la dejamos seleccionada
  if (distintas.includes(seleccionada)) {
    selectFiltro.value = seleccionada;
  }
}

// ---------- 4. LISTAR: dibujar la tabla (aplicando buscador y filtro) ----------

function mostrarTabla() {
  const lista = obtenerDatos(CLAVE);

  actualizarFiltro(lista);

  const texto = buscador.value.trim().toLowerCase();
  const especializacionElegida = selectFiltro.value;

  // Nos quedamos solo con los veterinarios que cumplen el filtro y la búsqueda
  const visibles = lista.filter(function (vet) {
    const coincideFiltro = especializacionElegida === "" || vet.especializacion === especializacionElegida;
    const coincideBusqueda =
      texto === "" ||
      vet.nombre.toLowerCase().includes(texto) ||
      vet.especializacion.toLowerCase().includes(texto) ||
      String(vet.matricula).includes(texto);
    return coincideFiltro && coincideBusqueda;
  });

  tabla.innerHTML = ""; // vaciamos la tabla antes de dibujarla de nuevo

  // Mensaje cuando no hay nada para mostrar
  if (visibles.length === 0) {
    sinDatos.textContent = lista.length === 0
      ? "Todavía no hay veterinarios registrados."
      : "No se encontraron veterinarios con ese criterio.";
    sinDatos.classList.remove("d-none");
  } else {
    sinDatos.classList.add("d-none");
  }

  visibles.forEach(function (vet) {
    const fila = document.createElement("tr");

    fila.appendChild(crearCelda(vet.matricula, "dato", "Matrícula"));
    fila.appendChild(crearCelda(vet.nombre, "", "Nombre"));
    fila.appendChild(crearCelda(vet.especializacion, "", "Especialización"));
    fila.appendChild(crearCelda(formatearMoneda(vet.valorConsulta), "dato", "Valor de consulta"));

    // Celda de acciones con los botones Editar y Eliminar
    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "text-end celda-acciones";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn btn-sm btn-editar me-2";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", function () {
      editarVeterinario(vet.idVeterinario);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "btn btn-sm btn-eliminar";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function () {
      pedirConfirmacion(vet.idVeterinario);
    });

    celdaAcciones.appendChild(btnEditar);
    celdaAcciones.appendChild(btnEliminar);
    fila.appendChild(celdaAcciones);

    tabla.appendChild(fila);
  });
}

// Cada vez que se escribe en el buscador o se cambia el filtro, se redibuja la tabla
buscador.addEventListener("input", mostrarTabla);
selectFiltro.addEventListener("change", mostrarTabla);

// ---------- 5. ABRIR EL MODAL PARA UN ALTA ----------

btnNuevo.addEventListener("click", function () {
  limpiarFormulario();
  modalVeterinario.show();
});

// Al cerrarse el modal (por Cancelar, la X o después de guardar) se limpia el formulario
elementoModalVeterinario.addEventListener("hidden.bs.modal", limpiarFormulario);

// Cuando termina de abrirse, ponemos el cursor en el primer campo
elementoModalVeterinario.addEventListener("shown.bs.modal", function () {
  inputNombre.focus();
});

// ---------- 6. REGISTRAR y GUARDAR CAMBIOS ----------

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue
  ocultarError();

  // Leemos lo que escribió el usuario
  const nombre = inputNombre.value.trim();
  const especializacion = selectEspecializacion.value;
  const matricula = Number(inputMatricula.value);
  const valorConsulta = Number(inputValor.value);

  // Validaciones
  if (nombre === "") {
    mostrarError("El nombre es obligatorio.");
    return;
  }
  if (especializacion === "") {
    mostrarError("Elegí una especialización de la lista.");
    return;
  }
  if (inputMatricula.value === "" || !Number.isInteger(matricula) || matricula <= 0) {
    mostrarError("La matrícula debe ser un número entero mayor a 0.");
    return;
  }
  if (inputValor.value === "" || isNaN(valorConsulta) || valorConsulta < 0) {
    mostrarError("El valor de consulta debe ser un número válido.");
    return;
  }

  const lista = obtenerDatos(CLAVE);
  const idEditando = inputId.value;

  // No permitimos dos veterinarios con la misma matrícula
  const matriculaRepetida = lista.some(function (vet) {
    return vet.matricula === matricula && vet.idVeterinario !== idEditando;
  });
  if (matriculaRepetida) {
    mostrarError("Ya existe un veterinario con esa matrícula.");
    return;
  }

  if (idEditando === "") {
    // ALTA: es un veterinario nuevo
    lista.push({
      idVeterinario: generarId(),
      matricula: matricula,
      nombre: nombre,
      especializacion: especializacion,
      valorConsulta: valorConsulta
    });
  } else {
    // EDICIÓN: buscamos el veterinario y le cambiamos los datos
    const posicion = lista.findIndex(function (vet) {
      return vet.idVeterinario === idEditando;
    });
    if (posicion !== -1) {
      lista[posicion].matricula = matricula;
      lista[posicion].nombre = nombre;
      lista[posicion].especializacion = especializacion;
      lista[posicion].valorConsulta = valorConsulta;
    }
  }

  guardarDatos(CLAVE, lista);
  mostrarTabla();
  modalVeterinario.hide(); // al cerrarse, el evento "hidden.bs.modal" limpia el formulario
});

// ---------- 7. EDITAR: cargar los datos en el formulario y abrir el modal ----------

function editarVeterinario(id) {
  const lista = obtenerDatos(CLAVE);
  const vet = lista.find(function (v) {
    return v.idVeterinario === id;
  });
  if (!vet) {
    return;
  }

  limpiarFormulario();
  asegurarOpcion(vet.especializacion);

  inputId.value = vet.idVeterinario; // con el id cargado, el formulario sabe que está editando
  inputNombre.value = vet.nombre;
  inputMatricula.value = vet.matricula;
  selectEspecializacion.value = vet.especializacion;
  inputValor.value = vet.valorConsulta;

  tituloFormulario.textContent = "Editar veterinario";
  btnGuardar.textContent = "Guardar cambios";

  modalVeterinario.show();
}

// ---------- 8. ELIMINAR: confirmación con un modal ----------

// Paso 1: al apretar "Eliminar" en una fila, abrimos el modal de confirmación
function pedirConfirmacion(id) {
  const lista = obtenerDatos(CLAVE);
  const vet = lista.find(function (v) {
    return v.idVeterinario === id;
  });
  if (!vet) {
    return;
  }

  idParaEliminar = id;
  nombreEliminar.textContent = vet.nombre;
  modalEliminar.show();
}

// Paso 2: si confirma, borramos
btnConfirmarEliminar.addEventListener("click", function () {
  if (idParaEliminar === null) {
    return;
  }

  const lista = obtenerDatos(CLAVE);
  // Nos quedamos con todos menos el que se elimina
  const nuevaLista = lista.filter(function (v) {
    return v.idVeterinario !== idParaEliminar;
  });
  guardarDatos(CLAVE, nuevaLista);

  idParaEliminar = null;
  modalEliminar.hide();
  mostrarTabla();
});

// ---------- 9. Al cargar la página ----------
cargarOpcionesEspecializacion();
mostrarTabla(); // muestra lo que ya está guardado