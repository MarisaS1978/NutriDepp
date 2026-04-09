/* --- NutriDePP: Script Principal --- */

// 1. SELECTORES DE ELEMENTOS
const buscador = document.getElementById('inputBuscador');
const recetas = document.querySelectorAll('.receta-card');
const mensajeSinResultados = document.getElementById('sinResultados');
const btnFavs = document.getElementById('btnVerFavs');
const btnTodas = document.getElementById('btnVerTodas');
const loginForm = document.getElementById('loginForm');
const listaRecetas = document.getElementById('listaRecetas');

// 2. ESTADO GLOBAL
let filtroSoloFavoritos = false;

/**
 * FUNCIÓN DE FILTRADO INTEGRADA
 * Filtra por texto (título/tags) y por el estado de favoritos simultáneamente.
 */
function filtrar() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    let hayResultados = false;

    // Seleccionamos todas las recetas (las del HTML + las creadas dinámicamente)
    const todasLasRecetas = document.querySelectorAll('.receta-card');

    todasLasRecetas.forEach(receta => {
        const titulo = receta.querySelector('h3').innerText.toLowerCase();
        const tags = receta.getAttribute('data-tags')?.toLowerCase() || "";
        const botonFav = receta.querySelector('.btn-fav');
        const esFavorito = botonFav ? botonFav.classList.contains('active') : false;

        const coincideTexto = titulo.includes(textoBusqueda) || tags.includes(textoBusqueda);
        const cumpleFiltroFav = filtroSoloFavoritos ? esFavorito : true;

        if (coincideTexto && cumpleFiltroFav) {
            receta.style.display = "block";
            hayResultados = true;
        } else {
            receta.style.display = "none";
        }
    });

    if (mensajeSinResultados) {
        mensajeSinResultados.style.display = hayResultados ? "none" : "block";
    }
}

/* --- LÓGICA DE FAVORITOS (DELEGACIÓN DE EVENTOS) --- */

// Usamos delegación de eventos para capturar clicks en corazones incluso de recetas nuevas
document.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-fav');
    if (!boton) return;

    const recetaCard = boton.closest('.receta-card');
    if (!recetaCard) return;

    const recetaId = recetaCard.getAttribute('data-id');
    const nombreReceta = recetaCard.querySelector('h3').innerText;

    e.stopPropagation();

    if (!recetaId) return console.error("Falta data-id en esta receta");

    const esAhoraFav = boton.classList.toggle('active');

    if (esAhoraFav) {
        // Guardamos el NOMBRE REAL para que el calendario lo pueda leer
        localStorage.setItem('fav-' + recetaId, nombreReceta);
    } else {
        localStorage.removeItem('fav-' + recetaId);
        // Si estamos viendo solo favoritos, ocultar la tarjeta al desmarcarla
        if (filtroSoloFavoritos) filtrar();
    }
});

/**
 * Marca como activos los corazones de las recetas que ya están en el HTML
 */
function inicializarCorazones() {
    document.querySelectorAll('.btn-fav').forEach(boton => {
        const recetaCard = boton.closest('.receta-card');
        const recetaId = recetaCard?.getAttribute('data-id');
        
        if (recetaId && localStorage.getItem('fav-' + recetaId)) {
            boton.classList.add('active');
        }
    });
}

/* --- EVENTOS DE BÚSQUEDA Y FILTROS --- */

if (buscador) {
    buscador.addEventListener('input', filtrar);
}

if (btnFavs) {
    btnFavs.addEventListener('click', () => {
        filtroSoloFavoritos = true;
        buscador.value = ""; // Limpiamos el buscador al cambiar de filtro
        
        // Manejo de clases
        btnFavs.classList.add('active-filtro');
        btnTodas.classList.remove('active-filtro');
        document.getElementById('btnVerBebidas')?.classList.remove('active-filtro');
        
        filtrar();
    });
}

if (btnTodas) {
    btnTodas.addEventListener('click', () => {
        filtroSoloFavoritos = false;
        buscador.value = ""; // Limpiamos el buscador para ver todo el contenido
        
        // Manejo de clases
        btnTodas.classList.add('active-filtro');
        btnFavs.classList.remove('active-filtro');
        document.getElementById('btnVerBebidas')?.classList.remove('active-filtro');
        
        filtrar();
    });
}

/* --- LÓGICA DE LOGIN --- */
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        
        // Intentamos obtener el usuario
        const usuarioData = localStorage.getItem('usuarioRegistrado');
        console.log("Datos encontrados:", usuarioData); // Esto te ayudará a debuguear

        if (usuarioData) {
            const user = JSON.parse(usuarioData);
            if (email === user.email && pass === user.password) {
                alert('¡Bienvenido a NutriDePP!');
                sessionStorage.setItem('sesionActiva', 'true'); 
                window.location.href = 'index.html';
            } else {
                alert('La contraseña o el correo no coinciden.');
            }
        } else {
            alert('No hay ninguna cuenta registrada con este correo.');
        }
    });
}
function cerrarSesion() {
    if (confirm("¿Seguro que quieres salir?")) {
        sessionStorage.removeItem('sesionActiva');
        window.location.href = 'login.html';
    }
}

/* --- CREACIÓN DE NUEVAS RECETAS --- */

const btnMostrar = document.getElementById('btnMostrarForm');
const contenedorForm = document.getElementById('formRecetaContenedor');
const formNuevaReceta = document.getElementById('formNuevaReceta');

if (btnMostrar) {
    btnMostrar.addEventListener('click', () => {
        contenedorForm.style.display = 'block';
        btnMostrar.style.display = 'none';
    });
}

const btnCancelar = document.getElementById('btnCancelar');
if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
        contenedorForm.style.display = 'none';
        btnMostrar.style.display = 'inline-block';
    });
}

if (formNuevaReceta) {
    formNuevaReceta.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevaReceta = {
            id: "user-" + Date.now(),
            nombre: document.getElementById('nuevoNombre').value,
            desc: document.getElementById('nuevoDesc').value,
            tag: document.getElementById('nuevoTag').value
        };

        // Guardar persistencia
        let recetasGuardadas = JSON.parse(localStorage.getItem('misRecetasPropias')) || [];
        recetasGuardadas.push(nuevaReceta);
        localStorage.setItem('misRecetasPropias', JSON.stringify(recetasGuardadas));

        crearTarjetaReceta(nuevaReceta);

        formNuevaReceta.reset();
        contenedorForm.style.display = 'none';
        btnMostrar.style.display = 'inline-block';
    });
}

function crearTarjetaReceta(receta) {
    if (!listaRecetas) return;

    const div = document.createElement('div');
    div.className = "feature receta-card";
    div.setAttribute('data-id', receta.id);
    div.setAttribute('data-tags', `${receta.nombre} ${receta.tag}`.toLowerCase());

    div.innerHTML = `
        <button class="btn-fav" title="Guardar en favoritos"><i class="fa-solid fa-heart"></i></button>
        <i class="fa-solid fa-utensils"></i>
        <h3>${receta.nombre}</h3>
        <p>${receta.desc}</p>
        <span class="tag">${receta.tag}</span>
    `;
    
    listaRecetas.appendChild(div);

    // Si ya era favorita (en caso de recarga), activar corazón
    if (localStorage.getItem('fav-' + receta.id)) {
        div.querySelector('.btn-fav').classList.add('active');
    }
}

/* --- INICIALIZACIÓN AL CARGAR --- */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar recetas del usuario
    let recetasGuardadas = JSON.parse(localStorage.getItem('misRecetasPropias')) || [];
    recetasGuardadas.forEach(r => crearTarjetaReceta(r));

    // 2. Activar corazones de recetas base
    inicializarCorazones();
});

/**
 * Función para filtrar rápidamente usando los botones de categoría (como Bebidas)
 */
function filtrarPorTag(tag) {
    if (buscador) {
        buscador.value = tag;
        filtroSoloFavoritos = false;
        
        // Manejo de clases: Resaltamos solo Bebidas
        btnTodas?.classList.remove('active-filtro');
        btnFavs?.classList.remove('active-filtro');
        document.getElementById('btnVerBebidas')?.classList.add('active-filtro');
        
        filtrar();
    }
}