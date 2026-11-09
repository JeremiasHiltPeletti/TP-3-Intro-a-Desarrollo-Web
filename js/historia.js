
// Recuperamos las historias clínicas guardadas
let historias = obtenerDatos("historias");

// Recuperamos las mascotas registradas
let mascotas = obtenerDatos("mascotas");

// Recuperamos los veterinarios registrados
let veterinarios = obtenerDatos("veterinarios");


// Obtenemos los elementos del formulario
const formulario = document.getElementById("form-historia");

const selectMascota = document.getElementById("idMascota");

const selectVeterinario = document.getElementById("idVeterinario");

const filtroMascota = document.getElementById("filtroMascota");



function cargarMascotas() {

    // Recorremos todas las mascotas registradas
    mascotas.forEach(function(mascota) {

        // Creamos una opción para el formulario
        const opcionFormulario = document.createElement("option");

        opcionFormulario.value = mascota.idMascota;
        opcionFormulario.textContent = mascota.nombreMascota;

        selectMascota.appendChild(opcionFormulario);


        // Creamos una opción para el filtro
        const opcionFiltro = document.createElement("option");

        opcionFiltro.value = mascota.idMascota;
        opcionFiltro.textContent = mascota.nombreMascota;

        filtroMascota.appendChild(opcionFiltro);

    });

}



function cargarVeterinarios() {

    // Recorremos todos los veterinarios registrados
    veterinarios.forEach(function(veterinario) {

        // Creamos una opción para el selector
        const opcion = document.createElement("option");

        // Guardamos el ID del veterinario
        opcion.value = veterinario.idVeterinario;

        // Mostramos el nombre del veterinario
        opcion.textContent = veterinario.nombre;

        // Agregamos la opción al selector
        selectVeterinario.appendChild(opcion);


    });

}

// Cargamos los selectores al iniciar la página
cargarMascotas();
cargarVeterinarios();
// Mostramos las historias clínicas al iniciar la página
renderHistorias();


formulario.addEventListener("submit", function(evento) {

    // Evitamos que la página se recargue
    evento.preventDefault();

    // Obtenemos los datos del formulario
    const datos = new FormData(formulario);

    // Creamos el nuevo registro de historia clínica
    const nuevaHistoria = {
        idHistoria: generarId(),
        idMascota: datos.get("idMascota"),
        idVeterinario: datos.get("idVeterinario"),
        fecha: datos.get("fecha"),
        motivo: datos.get("motivo").trim(),
        diagnostico: datos.get("diagnostico").trim(),
        tratamiento: datos.get("tratamiento").trim(),
        observaciones: datos.get("observaciones").trim()
    };

    // Agregamos la consulta al listado
    historias.push(nuevaHistoria);

    // Guardamos los datos en LocalStorage
    guardarDatos("historias", historias);

   // Actualizamos la tabla
    renderHistorias();

});


// Buscamos el nombre de una mascota por su ID
function obtenerNombreMascota(idMascota) {

    const mascota = mascotas.find(function(mascota) {
        return mascota.idMascota === idMascota;
    });

    return mascota ? mascota.nombreMascota : "Mascota no encontrada";
}


// Buscamos el nombre de un veterinario por su ID
function obtenerNombreVeterinario(idVeterinario) {

    const veterinario = veterinarios.find(function(veterinario) {
        return veterinario.idVeterinario === idVeterinario;
    });

    return veterinario ? veterinario.nombre : "Veterinario no encontrado";
}

// Evitamos que los textos ingresados se interpreten como código HTML
function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}

// Mostramos las historias clínicas en la tabla
function renderHistorias() {

    // Obtenemos el cuerpo de la tabla
    const listado = document.getElementById("listado-historias");

    // Limpiamos el contenido anterior
    listado.innerHTML = "";

    
    // Obtenemos la mascota seleccionada en el filtro
    const mascotaSeleccionada = filtroMascota.value;

    // Filtramos las historias clínicas
    const historiasFiltradas = historias.filter(function(historia) {

    // Si no se seleccionó una mascota, mostramos todas
    if (mascotaSeleccionada === "") {
        return true;
    }

    // Mostramos solamente las historias de esa mascota
    return historia.idMascota === mascotaSeleccionada;
    });

    // Recorremos las historias filtradas
    historiasFiltradas.forEach(function(historia) {

        // Creamos una nueva fila
        const fila = document.createElement("tr");

        // Agregamos los datos de la consulta
        fila.innerHTML = `
            <td>${historia.fecha}</td>
            <td>${escaparHTML(obtenerNombreMascota(historia.idMascota))}</td>
            <td>${escaparHTML(obtenerNombreVeterinario(historia.idVeterinario))}</td>
            <td>${escaparHTML(historia.motivo)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="verDetalleHistoria('${historia.idHistoria}')">
                 Ver detalle
                </button>
            </td>
        `;

        // Agregamos la fila a la tabla
        listado.appendChild(fila);
    });

    // Actualizamos el contador de historias
    document.getElementById("totalHistorias").textContent = historiasFiltradas.length;
}

// Detectamos cuando se cambia la mascota del filtro
filtroMascota.addEventListener("change", function() {

    // Actualizamos la tabla
    renderHistorias();

});

// Mostramos el detalle completo de una consulta
function verDetalleHistoria(idHistoria) {

    // Buscamos la historia clínica seleccionada
    const historia = historias.find(function(historia) {
        return historia.idHistoria === idHistoria;
    });

    // Si no encontramos el registro, terminamos la función
    if (!historia) {
        return;
    }

    // Obtenemos el contenedor donde mostraremos los datos
    const detalle = document.getElementById("detalleHistoria");

    // Cargamos la información de la consulta
   detalle.innerHTML = `
    <p><strong>Mascota:</strong> ${escaparHTML(obtenerNombreMascota(historia.idMascota))}</p>
    <p><strong>Veterinario:</strong> ${escaparHTML(obtenerNombreVeterinario(historia.idVeterinario))}</p>
    <p><strong>Fecha:</strong> ${escaparHTML(historia.fecha)}</p>
    <p><strong>Motivo de consulta:</strong> ${escaparHTML(historia.motivo)}</p>
    <p><strong>Diagnóstico:</strong> ${escaparHTML(historia.diagnostico)}</p>
    <p><strong>Tratamiento:</strong> ${escaparHTML(historia.tratamiento)}</p>
    <p><strong>Observaciones:</strong> ${escaparHTML(historia.observaciones || "Sin observaciones")}</p>
    `;

    // Abrimos el modal de Bootstrap
    const modal = new bootstrap.Modal(document.getElementById("modalHistoria"));

    modal.show();
}