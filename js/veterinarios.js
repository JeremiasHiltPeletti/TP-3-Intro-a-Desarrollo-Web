// Clave única para la entidad Veterinarios en LocalStorage
const CLAVE_STORAGE = 'veterinarios';

// Obtener datos iniciales utilizando la función de storage.js
let veterinarios = obtenerDatos(CLAVE_STORAGE);

// Referencias a los elementos del DOM
const listadoVeterinarios = document.getElementById('listado-veterinarios');
const total = document.getElementById('total');
const formulario = document.getElementById('form-veterinario');
const inputId = document.getElementById('idVeterinario');
const tituloFormulario = document.getElementById('titulo-formulario');
const botonAgregar = document.getElementById('botonAgregarVeterinario');
const botonCancelar = document.getElementById('botonCancelar');
const buscador = document.getElementById('buscador');

// Mostrar un número como moneda argentina (ejemplo: $ 15.000,00)
function formatoMoneda(valor) {
    return valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

// Función para renderizar la tabla y actualizar el contador
function render() {
    listadoVeterinarios.innerHTML = '';

    // Filtrar según lo que se escribió en el buscador
    const texto = buscador.value.trim().toLowerCase();
    const filtrados = veterinarios.filter((veterinario) =>
        veterinario.nombre.toLowerCase().includes(texto) ||
        veterinario.especializacion.toLowerCase().includes(texto) ||
        String(veterinario.matricula).includes(texto)
    );

    if (veterinarios.length === 0) {
        listadoVeterinarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    No hay veterinarios registrados actualmente.
                </td>
            </tr>
        `;
    } else if (filtrados.length === 0) {
        listadoVeterinarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    No se encontraron veterinarios con esa búsqueda.
                </td>
            </tr>
        `;
    } else {
        filtrados.forEach((veterinario) => {
            listadoVeterinarios.innerHTML += `
                <tr>
                    <td>${veterinario.matricula}</td>
                    <td><strong>${veterinario.nombre}</strong></td>
                    <td>${veterinario.especializacion}</td>
                    <td>${formatoMoneda(veterinario.valorConsulta)}</td>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm me-1" onclick="cargarFormulario('${veterinario.idVeterinario}')">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarVeterinario('${veterinario.idVeterinario}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    total.textContent = veterinarios.length;
}

// Carga inicial al ingresar a la página
render();

// Cada vez que se escribe en el buscador se vuelve a dibujar la tabla
buscador.addEventListener('input', render);

// Captura del envío del formulario con FormData
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const idExistente = inputId.value;
    const matricula = Number(datos.get('matricula'));

    // Validar que la matrícula no esté repetida (sin contar al que se está editando)
    const repetido = veterinarios.find((v) => v.matricula === matricula && v.idVeterinario !== idExistente);
    if (repetido) {
        alert('Ya existe un veterinario registrado con la matrícula ' + matricula + '.');
        return;
    }

    if (idExistente) {
        // MODO EDICIÓN
        veterinarios = veterinarios.map((veterinario) => {
            if (veterinario.idVeterinario === idExistente) {
                return {
                    idVeterinario: idExistente,
                    matricula: matricula,
                    nombre: datos.get('nombre').trim(),
                    especializacion: datos.get('especializacion'),
                    valorConsulta: parseFloat(datos.get('valorConsulta'))
                };
            }
            return veterinario;
        });
    } else {
        // MODO ALTA (generando ID mediante generarId() de storage.js)
        const nuevoVeterinario = {
            idVeterinario: generarId(),
            matricula: matricula,
            nombre: datos.get('nombre').trim(),
            especializacion: datos.get('especializacion'),
            valorConsulta: parseFloat(datos.get('valorConsulta'))
        };
        veterinarios.push(nuevoVeterinario);
    }

    // Persistir usando guardarDatos() de storage.js
    guardarDatos(CLAVE_STORAGE, veterinarios);
    render();
    cancelarEdicion();
});

// Cargar datos en el formulario para modificar
function cargarFormulario(id) {
    const veterinario = veterinarios.find((v) => v.idVeterinario === id);
    if (veterinario) {
        inputId.value = veterinario.idVeterinario;
        document.getElementById('matricula').value = veterinario.matricula;
        document.getElementById('nombre').value = veterinario.nombre;
        document.getElementById('especializacion').value = veterinario.especializacion;
        document.getElementById('valorConsulta').value = veterinario.valorConsulta;

        tituloFormulario.textContent = 'Editar Veterinario';
        botonAgregar.innerHTML = '<i class="bi bi-check-circle me-1"></i> Guardar Cambios';
        botonCancelar.classList.remove('d-none');
    }
}

// Eliminar un registro con confirmación
function eliminarVeterinario(id) {
    const confirmacion = confirm('¿Estás seguro/a de que deseas eliminar este veterinario?');

    if (confirmacion) {
        veterinarios = veterinarios.filter((v) => v.idVeterinario !== id);
        guardarDatos(CLAVE_STORAGE, veterinarios);
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
    tituloFormulario.textContent = 'Nuevo Veterinario';
    botonAgregar.innerHTML = '<i class="bi bi-check-circle me-1"></i> Agregar Veterinario';
    botonCancelar.classList.add('d-none');
}
