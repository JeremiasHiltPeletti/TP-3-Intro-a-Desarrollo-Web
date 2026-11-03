// Gestión de turnos
// Usa las funciones compartidas de storage.js (obtenerDatos, guardarDatos, generarId)

// Claves de LocalStorage
const CLAVE_TURNOS = 'turnos';
const CLAVE_MASCOTAS = 'mascotas';
const CLAVE_VETERINARIOS = 'veterinarios';

// Referencias a los elementos del DOM
const selectMascota = document.getElementById('idMascota');
const selectVeterinario = document.getElementById('idVeterinario');
const filtroVeterinario = document.getElementById('filtroVeterinario');
const filtroFecha = document.getElementById('filtroFecha');
const botonLimpiarFiltros = document.getElementById('botonLimpiarFiltros');
const avisoTurnos = document.getElementById('avisoTurnos');
const botonAgregarTurno = document.getElementById('botonAgregarTurno');

// Llena los selectores con lo que ya está guardado
function cargarSelectores() {
  const mascotas = obtenerDatos(CLAVE_MASCOTAS);
  const veterinarios = obtenerDatos(CLAVE_VETERINARIOS);

  mascotas.forEach((mascota) => {
    selectMascota.innerHTML += `
      <option value="${mascota.idMascota}">
        ${mascota.nombreMascota} (${mascota.nombreDuenio})
      </option>`;
  });

  veterinarios.forEach((vet) => {
    const opcion = `<option value="${vet.idVeterinario}">${vet.nombre}</option>`;
    selectVeterinario.innerHTML += opcion;  // selector del formulario
    filtroVeterinario.innerHTML += opcion;  // selector del filtro
  });

  // Sin mascotas o sin veterinarios no se puede registrar un turno
  if (mascotas.length === 0 || veterinarios.length === 0) {
    avisoTurnos.textContent =
      'Para registrar turnos primero tenés que cargar al menos una mascota y un veterinario.';
    avisoTurnos.classList.remove('d-none');
    botonAgregarTurno.disabled = true;
  }
}

cargarSelectores();

// ---------- LISTA DE TURNOS ----------
let turnos = obtenerDatos(CLAVE_TURNOS);

const listadoTurnos = document.getElementById('listado-turnos');
const total = document.getElementById('total');
const formTurno = document.getElementById('form-turno');

// Los turnos guardan solo los ids; acá buscamos el nombre para mostrarlo
function nombreMascota(id) {
  const mascota = obtenerDatos(CLAVE_MASCOTAS).find((m) => m.idMascota === id);
  return mascota ? mascota.nombreMascota : 'Mascota eliminada';
}

function nombreVeterinario(id) {
  const vet = obtenerDatos(CLAVE_VETERINARIOS).find((v) => v.idVeterinario === id);
  return vet ? vet.nombre : 'Veterinario eliminado';
}

// El input date entrega AAAA-MM-DD; lo mostramos como DD/MM/AAAA
function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

// El motivo lo escribe el usuario: evitamos que se interprete como HTML
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Devuelve solo los turnos que cumplen los filtros elegidos (veterinario y/o fecha)
function obtenerTurnosFiltrados() {
  const idVet = filtroVeterinario.value;
  const fecha = filtroFecha.value;

  return turnos.filter((t) =>
    (idVet === '' || t.idVeterinario === idVet) &&
    (fecha === '' || t.fecha === fecha)
  );
}

function render() {
  listadoTurnos.innerHTML = '';

  const visibles = obtenerTurnosFiltrados();

  if (visibles.length === 0) {
    const mensaje = turnos.length === 0
      ? 'No hay turnos registrados actualmente.'
      : 'No hay turnos que coincidan con los filtros.';
    listadoTurnos.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-3">${mensaje}</td>
      </tr>`;
  } else {
    // Ordenamos por fecha y hora (sobre una copia, sin alterar la lista guardada)
    const ordenados = [...visibles].sort((a, b) =>
      (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
    );

    ordenados.forEach((turno) => {
      listadoTurnos.innerHTML += `
        <tr>
          <td class="ps-4">${formatearFecha(turno.fecha)}</td>
          <td>${turno.hora}</td>
          <td><strong>${nombreMascota(turno.idMascota)}</strong></td>
          <td>${nombreVeterinario(turno.idVeterinario)}</td>
          <td>${escaparHTML(turno.motivo)}</td>
          <td class="text-center pe-4">
            <button class="btn btn-danger btn-sm" onclick="eliminarTurno('${turno.idTurno}')">
              Eliminar
            </button>
          </td>
        </tr>`;
    });
  }

  // El contador muestra cuántos turnos se están viendo
  total.textContent = visibles.length;
}

render(); // carga inicial al entrar a la página

// ---------- REGISTRAR UN TURNO ----------
function mostrarAviso(texto) {
  avisoTurnos.textContent = texto;
  avisoTurnos.classList.remove('d-none');
}

formTurno.addEventListener('submit', (evento) => {
  evento.preventDefault(); // evita que el navegador recargue la página con los datos en la URL

  const datos = new FormData(formTurno);

  const nuevoTurno = {
    idTurno: generarId(),
    idMascota: datos.get('idMascota'),
    idVeterinario: datos.get('idVeterinario'),
    fecha: datos.get('fecha'),
    hora: datos.get('hora'),
    motivo: datos.get('motivo').trim()
  };

  // Un veterinario no puede tener dos turnos a la misma fecha y hora
  const ocupado = turnos.some((t) =>
    t.idVeterinario === nuevoTurno.idVeterinario &&
    t.fecha === nuevoTurno.fecha &&
    t.hora === nuevoTurno.hora
  );
  if (ocupado) {
    mostrarAviso('Ese veterinario ya tiene un turno en esa fecha y hora.');
    return;
  }

  turnos.push(nuevoTurno);
  guardarDatos(CLAVE_TURNOS, turnos);
  render();
  formTurno.reset();
  avisoTurnos.classList.add('d-none');
});

// ---------- ELIMINAR UN TURNO ----------
function eliminarTurno(id) {
  const confirmacion = confirm('¿Estás seguro/a de que deseas eliminar este turno?');

  if (confirmacion) {
    // filter conserva todos los turnos menos el que tiene ese id
    turnos = turnos.filter((t) => t.idTurno !== id);
    guardarDatos(CLAVE_TURNOS, turnos);
    render();
  }
}

// ---------- FILTROS (opcional) ----------
// Cada vez que cambia un filtro se vuelve a dibujar la tabla
filtroVeterinario.addEventListener('change', render);
filtroFecha.addEventListener('change', render);

botonLimpiarFiltros.addEventListener('click', () => {
  filtroVeterinario.value = '';
  filtroFecha.value = '';
  render();
});