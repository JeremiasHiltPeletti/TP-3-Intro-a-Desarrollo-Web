// Panel de administración
// Usa obtenerDatos de storage.js y el nombre guardado por auth.js

// Saludo con el nombre del usuario que inició sesión
document.getElementById('nombreUsuario').textContent =
  sessionStorage.getItem('usuario') || 'administrador';

// Cantidad de registros de cada módulo, leída desde LocalStorage
function mostrarContador(idElemento, clave) {
  const cantidad = obtenerDatos(clave).length;
  document.getElementById(idElemento).textContent =
    cantidad + (cantidad === 1 ? ' registrado' : ' registrados');
}

mostrarContador('contadorMascotas', 'mascotas');
mostrarContador('contadorVeterinarios', 'veterinarios');
mostrarContador('contadorTurnos', 'turnos');