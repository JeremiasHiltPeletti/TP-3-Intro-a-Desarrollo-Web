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
            <button class="btn btn-outline-success btn-sm me-1" onclick="imprimirComprobante('${turno.idTurno}')">
              Comprobante
            </button>
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

// ---------- COMPROBANTE DEL TURNO (opcional) ----------
// Abre una ventana con el comprobante y lanza el diálogo de impresión.
// Desde ahí se puede imprimir o elegir "Guardar como PDF" como destino.
function imprimirComprobante(id) {
  const turno = turnos.find((t) => t.idTurno === id);
  if (!turno) return;

  const mascota = obtenerDatos(CLAVE_MASCOTAS).find((m) => m.idMascota === turno.idMascota);
  const duenio = mascota ? mascota.nombreDuenio : '-';

  // Dirección completa del logo (la ventana nueva no sabe dónde está la carpeta assets)
  const urlLogo = new URL('assets/logo/LogoHuellitas/isotipo-512.png', window.location.href).href;

  const ventana = window.open('', '_blank', 'width=700,height=800');
  if (!ventana) {
    alert('Tu navegador bloqueó la ventana. Permití las ventanas emergentes para imprimir el comprobante.');
    return;
  }

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante de turno</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1b2a22; margin: 40px; }
    .comprobante { max-width: 560px; margin: 0 auto; border: 2px solid #14463b; border-radius: 12px; padding: 32px; }
    .encabezado { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .encabezado img { width: 72px; height: 72px; }
    h1 { margin: 0; color: #14463b; font-size: 26px; }
    h2 { margin: 4px 0 0; font-size: 16px; font-weight: normal; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #ddd; }
    td:first-child { color: #555; width: 38%; }
    td:last-child { font-weight: bold; }
    .pie { margin-top: 28px; font-size: 13px; color: #555; text-align: center; }
  </style>
</head>
<body>
  <div class="comprobante">
    <div class="encabezado">
      <img src="${urlLogo}" alt="Veterinaria Huellitas">
      <div>
        <h1>Veterinaria Huellitas</h1>
        <h2>Comprobante de turno</h2>
      </div>
    </div>
    <table>
      <tr><td>Nº de turno</td><td>${escaparHTML(String(turno.idTurno).slice(0, 8).toUpperCase())}</td></tr>
      <tr><td>Fecha</td><td>${formatearFecha(turno.fecha)}</td></tr>
      <tr><td>Hora</td><td>${turno.hora} hs</td></tr>
      <tr><td>Mascota</td><td>${escaparHTML(nombreMascota(turno.idMascota))}</td></tr>
      <tr><td>Dueño</td><td>${escaparHTML(duenio)}</td></tr>
      <tr><td>Veterinario</td><td>${escaparHTML(nombreVeterinario(turno.idVeterinario))}</td></tr>
      <tr><td>Motivo</td><td>${escaparHTML(turno.motivo)}</td></tr>
    </table>
    <p class="pie">
      Av. Siempre Viva 123, Ceres, Santa Fe · (03491) 000-000<br>
      Por favor, presentate unos minutos antes del horario del turno.
    </p>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`);
  ventana.document.close();
}