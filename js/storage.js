// Funciones compartidas para guardar y leer datos en el LocalStorage.
// Lo usan las páginas de Mascotas y Veterinarios (y más adelante Turnos e Historia Clínica).

// LEER: trae la lista guardada bajo una clave (por ejemplo "mascotas" y "veterinarios").
// Si todavía no hay nada guardado, devuelve una lista vacía.
function obtenerDatos(clave) {
  const texto = localStorage.getItem(clave); // el LocalStorage guarda texto
  return texto ? JSON.parse(texto) : [];     // JSON.parse convierte ese texto en una lista de objetos
}

// GUARDAR: guarda una lista completa bajo una clave.
function guardarDatos(clave, lista) {
  const texto = JSON.stringify(lista);       // JSON.stringify convierte la lista en texto
  localStorage.setItem(clave, texto);
}

// ID: genera un identificador único para cada registro nuevo.
function generarId() {
  return crypto.randomUUID();
}