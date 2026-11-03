// ============================================================
// Inicio de sesión de administradores (API DummyJSON)
// ============================================================

// Claves con las que guardamos los datos en sessionStorage
const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

// Páginas que solo puede usar un administrador con sesión iniciada
const PAGINAS_ADMIN = ['mascotas.html', 'veterinarios.html', 'turnos.html', 'historia.html'];

// ---------- 1. ¿HAY SESIÓN? ----------
// Hay sesión si existe un token guardado en sessionStorage.
function haySesion() {
  return sessionStorage.getItem(CLAVE_TOKEN) !== null;
}

// ---------- 2. INICIAR SESIÓN (fetch a DummyJSON) ----------
// Devuelve: si las credenciales son correctas guarda el token,
// y si no, lanza un error que la página de login muestra al usuario.
async function iniciarSesion(usuario, clave) {
  const respuesta = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password: clave })
  });

  // DummyJSON responde con error (400) si el usuario o la contraseña no son válidos
  if (!respuesta.ok) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  const datos = await respuesta.json();

  // Guardamos el token (y el nombre, para mostrarlo si hace falta) en sessionStorage.
  // sessionStorage se borra solo al cerrar la pestaña.
  sessionStorage.setItem(CLAVE_TOKEN, datos.accessToken || datos.token);
  sessionStorage.setItem(CLAVE_USUARIO, datos.firstName || datos.username);
}

// ---------- 3. CERRAR SESIÓN ----------
function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
  window.location.href = 'login.html';
}

// ---------- 4. PROTECCIÓN DE PÁGINAS ----------
// Se ejecuta apenas carga el scriptsi es una página de administración y no hay sesión,
// manda al usuario al login.
function protegerPagina() {
  const paginaActual = window.location.pathname.split('/').pop();
  if (PAGINAS_ADMIN.includes(paginaActual) && !haySesion()) {
    window.location.replace('login.html');
  }
}
protegerPagina();

// ---------- 5. BARRA DE NAVEGACIÓN SEGÚN LA SESIÓN ----------
// Elementos con data-admin     -> solo se ven con sesión iniciada
// Elementos con data-sin-sesion -> solo se ven sin sesión (el acceso al login)
function actualizarNavbar() {
  const logueado = haySesion();

  document.querySelectorAll('[data-admin]').forEach((elemento) => {
    elemento.classList.toggle('d-none', !logueado);
  });
  document.querySelectorAll('[data-sin-sesion]').forEach((elemento) => {
    elemento.classList.toggle('d-none', logueado);
  });

  const botonCerrar = document.getElementById('btnCerrarSesion');
  if (botonCerrar) {
    botonCerrar.addEventListener('click', (evento) => {
      evento.preventDefault();
      cerrarSesion();
    });
  }
}

// El menú existe recién cuando el HTML terminó de cargarse
document.addEventListener('DOMContentLoaded', actualizarNavbar);