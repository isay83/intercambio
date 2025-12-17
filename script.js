const apiURL = 'https://sheetdb.io/api/v1/ysymcpx0wcc13';
const imgbbKey = '88cae489c485c1b8555e8b08a8ed070e';
const IMAGEN_DEFAULT = 'regalo.jpg';

const grid = document.getElementById('grid-participantes');
const form = document.getElementById('form-deseo');
const selectNombre = document.getElementById('selectNombre');
const modal = document.getElementById('modal-container');

// --- 1. LÓGICA DEL MODAL ---
function abrirModal() {
    modal.classList.add('show');
}

function cerrarModal() {
    modal.classList.remove('show');
}

// Cerrar si hacen click afuera del cuadro blanco
modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});

// --- 2. LÓGICA DE DATOS ---

async function cargarNombres() {
    try {
        const response = await fetch(`${apiURL}?sheet=Participantes`);
        const data = await response.json();

        selectNombre.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>';
        data.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.nombre;
            option.textContent = persona.nombre;
            selectNombre.appendChild(option);
        });
    } catch (error) { console.error(error); }
}

async function cargarDeseos() {
    grid.innerHTML = '<div class="loading">Cargando deseos...</div>';
    try {
        const response = await fetch(`${apiURL}?sheet=Regalos`);
        const data = await response.json();
        mostrarTarjetas(data);
    } catch (error) {
        grid.innerHTML = '<p>Error cargando datos.</p>';
    }
}

function mostrarTarjetas(lista) {
    grid.innerHTML = '';

    lista.reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-nombre', item.nombre.toLowerCase());

        // LOGICA DE IMAGEN:
        // Si hay link en item.imagen, úsalo. Si no, usa la local.
        const imagenSrc = (item.imagen && item.imagen.trim() !== "")
            ? item.imagen
            : IMAGEN_DEFAULT;

        // Al hacer click en la imagen, llamamos a verImagen()
        card.innerHTML = `
            <img src="${imagenSrc}" 
                 class="card-img" 
                 alt="Regalo" 
                 onclick="verImagen('${imagenSrc}')">
            
            <div class="card-body">
                <h3>${item.nombre}</h3>
                <p>🎁 ${item.deseo}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- 3. BUSCADOR EN TIEMPO REAL ---
function filtrarRegalos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const tarjetas = document.querySelectorAll('.card');

    tarjetas.forEach(card => {
        const nombreEnTarjeta = card.getAttribute('data-nombre');
        if (nombreEnTarjeta.includes(texto)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 4. ENVÍO DEL FORMULARIO (Igual que antes, ajustado al nuevo flujo) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Subiendo...';

    const nombre = selectNombre.value;
    const deseo = document.getElementById('inputDeseo').value;
    const archivo = document.getElementById('inputFoto').files[0];
    let urlImagen = '';

    try {
        if (archivo) {
            const formData = new FormData();
            formData.append('image', archivo);
            const resImg = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: 'POST', body: formData });
            const dataImg = await resImg.json();
            if (!dataImg.success) throw new Error('Error subiendo imagen');
            urlImagen = dataImg.data.url;
        }

        const nuevoDeseo = { data: [{ nombre, deseo, imagen: urlImagen }] };

        await fetch(`${apiURL}?sheet=Regalos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoDeseo)
        });

        alert('¡Deseo agregado!');
        form.reset();
        cerrarModal(); // Cerramos el modal automáticamente
        cargarDeseos(); // Recargamos la grilla de atrás

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
});

const lightbox = document.getElementById('lightbox');
const imgGrande = document.getElementById('img-grande');

function verImagen(ruta) {
    imgGrande.src = ruta;
    lightbox.classList.add('active');
}

function cerrarLightbox() {
    lightbox.classList.remove('active');
    // Limpiamos el src para que no se quede la imagen vieja cargada
    setTimeout(() => { imgGrande.src = ''; }, 200);
}

// Inicializar
cargarNombres();
cargarDeseos();