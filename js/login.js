// Lógica de la página login
// (usa las funciones de auth.js: haySesion e iniciarSesion)

const formLogin = document.getElementById('form-login');
const mensajeError = document.getElementById('mensajeError');
const botonLogin = document.getElementById('botonLogin');

// Si ya hay una sesión iniciada, no tiene sentido mostrar el login
if (haySesion()) {
  window.location.replace('mascotas.html');
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.classList.remove('d-none');
}

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();               // evita que la página se recargue
  mensajeError.classList.add('d-none');  // oculta el error anterior

  const datos = new FormData(formLogin);
  botonLogin.disabled = true;            // evita enviar dos veces
  botonLogin.textContent = 'Ingresando...';

  try {
    await iniciarSesion(datos.get('usuario').trim(), datos.get('clave'));
    window.location.href = 'mascotas.html'; // login correcto: vamos al panel
  } catch (error) {
    // Si no hay internet, fetch lanza un TypeError; si las credenciales
    // son incorrectas, es el Error que lanzamos en iniciarSesion.
    if (error instanceof TypeError) {
      mostrarError('No se pudo conectar con el servidor. Revisá tu conexión.');
    } else {
      mostrarError(error.message);
    }
    botonLogin.disabled = false;
    botonLogin.textContent = 'Ingresar';
  }
});