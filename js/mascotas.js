// Clave única para la entidad Mascotas en LocalStorage
const CLAVE_STORAGE = 'mascotas';

// Obtener datos iniciales utilizando la función  de Storage.js
let mascotas = obtenerDatos(CLAVE_STORAGE);

// Referencias a los elementos del DOM
const listadoMascotas = document.getElementById('listado-mascotas');
const total = document.getElementById('total');
const formulario = document.getElementById('form-mascota');
const inputId = document.getElementById('idMascota');
const tituloFormulario = document.getElementById('titulo-formulario');
const botonAgregar = document.getElementById('botonAgregarMascota');
const botonCancelar = document.getElementById('botonCancelar');

// Función para renderizar la tabla y actualizar el contador
function render() {
    listadoMascotas.innerHTML = '';

    if (mascotas.length === 0) {
        listadoMascotas.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-3">
                    No hay mascotas registradas actualmente.
                </td>
            </tr>
        `;
    } else {
        mascotas.forEach((mascota) => {
            listadoMascotas.innerHTML += `
                <tr>
                    <td>${mascota.nombreDuenio}</td>
                    <td><strong>${mascota.nombreMascota}</strong></td>
                    <td>${mascota.color}</td>
                    <td>${mascota.edad}</td>
                    <td>${mascota.peso} kg</td>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm me-1" onclick="cargarFormulario('${mascota.idMascota}')">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarMascota('${mascota.idMascota}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    total.textContent = mascotas.length;
}

// Carga inicial al ingresar a la página
render();

// Captura del envío del formulario con FormData
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const idExistente = inputId.value;

    if (idExistente) {
        // MODO EDICIÓN
        mascotas = mascotas.map((mascota) => {
            if (mascota.idMascota === idExistente) {
                return {
                    idMascota: idExistente,
                    nombreDuenio: datos.get('nombreDuenio').trim(),
                    nombreMascota: datos.get('nombreMascota').trim(),
                    color: datos.get('color').trim(),
                    edad: Number(datos.get('edad')),
                    peso: parseFloat(datos.get('peso'))
                };
            }
            return mascota;
        });
    } else {
        // MODO ALTA (generando ID mediante generarId() de Storage.js)
        const nuevaMascota = {
            idMascota: generarId(),
            nombreDuenio: datos.get('nombreDuenio').trim(),
            nombreMascota: datos.get('nombreMascota').trim(),
            color: datos.get('color').trim(),
            edad: Number(datos.get('edad')),
            peso: parseFloat(datos.get('peso'))
        };
        mascotas.push(nuevaMascota);
    }

    // Persistir usando guardarDatos() de Storage.js
    guardarDatos(CLAVE_STORAGE, mascotas);
    render();
    cancelarEdicion();
});

// Cargar datos en el formulario para modificar
function cargarFormulario(id) {
    const mascota = mascotas.find((m) => m.idMascota === id);
    if (mascota) {
        inputId.value = mascota.idMascota;
        document.getElementById('nombreDuenio').value = mascota.nombreDuenio;
        document.getElementById('nombreMascota').value = mascota.nombreMascota;
        document.getElementById('color').value = mascota.color;
        document.getElementById('edad').value = mascota.edad;
        document.getElementById('peso').value = mascota.peso;

        tituloFormulario.textContent = 'Editar Mascota';
        botonAgregar.innerHTML = '<i class="bi bi-check-circle me-1"></i> Guardar Cambios';
        botonCancelar.classList.remove('d-none');
    }
}

// Eliminar un registro con confirmación
function eliminarMascota(id) {
    const confirmacion = confirm('¿Estás seguro/a de que deseas eliminar este registro de mascota?');
    
    if (confirmacion) {
        mascotas = mascotas.filter((m) => m.idMascota !== id);
        guardarDatos(CLAVE_STORAGE, mascotas);
        render();

        if (inputId.value === id) {
            cancelarEdicion();
        }
    }
}

// Resetear formulario a su estado original
function cancelarEdicion() {
    formulario.reset();
    inputId.value = '';
    tituloFormulario.textContent = 'Nueva Mascota';
    botonAgregar.innerHTML = '<i class="bi bi-check-circle me-1"></i> Agregar Mascota';
    botonCancelar.classList.add('d-none');
}