/* --- NutriDePP: Script Principal --- */

// 1. SELECTORES DE ELEMENTOS
const buscador = document.getElementById('inputBuscador');
const recetas = document.querySelectorAll('.receta-card');
const mensajeSinResultados = document.getElementById('sinResultados');
const btnFavs = document.getElementById('btnVerFavs');
const btnTodas = document.getElementById('btnVerTodas');
const loginForm = document.getElementById('loginForm');

// 2. ESTADO GLOBAL
let filtroSoloFavoritos = false;

/**
 * FUNCIÓN DE FILTRADO INTEGRADA
 * Filtra por texto (título/tags) y por el estado de favoritos simultáneamente.
 */
function filtrar() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    let hayResultados = false;

    recetas.forEach(receta => {
        // Obtenemos datos de la tarjeta
        const titulo = receta.querySelector('h3').innerText.toLowerCase();
        const tags = receta.getAttribute('data-tags')?.toLowerCase() || "";
        const botonFav = receta.querySelector('.btn-fav');
        const esFavorito = botonFav ? botonFav.classList.contains('active') : false;

        // Lógica de coincidencia
        const coincideTexto = titulo.includes(textoBusqueda) || tags.includes(textoBusqueda);
        const cumpleFiltroFav = filtroSoloFavoritos ? esFavorito : true;

        // Mostrar u ocultar
        if (coincideTexto && cumpleFiltroFav) {
            receta.style.display = "block";
            hayResultados = true;
        } else {
            receta.style.display = "none";
        }
    });

    // Mostrar mensaje si no hay nada que coincida
    if (mensajeSinResultados) {
        mensajeSinResultados.style.display = hayResultados ? "none" : "block";
    }
}

/* --- EVENTOS DE BUSQUEDA Y FILTROS --- */

// Escuchar escritura en el buscador
if (buscador) {
    buscador.addEventListener('input', filtrar);
}

// Botón "Ver mis Favoritos"
if (btnFavs) {
    btnFavs.addEventListener('click', () => {
        filtroSoloFavoritos = true;
        btnFavs.classList.add('active-filtro');
        btnTodas.classList.remove('active-filtro');
        filtrar();
    });
}

// Botón "Ver Todas"
if (btnTodas) {
    btnTodas.addEventListener('click', () => {
        filtroSoloFavoritos = false;
        btnTodas.classList.add('active-filtro');
        btnFavs.classList.remove('active-filtro');
        filtrar();
    });
}

/* --- LÓGICA DE FAVORITOS (CORAZONES) --- */

document.querySelectorAll('.btn-fav').forEach(boton => {
    const recetaCard = boton.closest('.receta-card');
    if (!recetaCard) return;

    const recetaId = recetaCard.getAttribute('data-id');

    // Recuperar estado guardado al cargar la página
    if (recetaId && localStorage.getItem('fav-' + recetaId)) {
        boton.classList.add('active');
    }

    // Evento click en el corazón
    boton.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el click afecte a otros elementos
        
        if (!recetaId) return console.error("Falta data-id en esta receta");

        const esAhoraFav = boton.classList.toggle('active');

        if (esAhoraFav) {
            localStorage.setItem('fav-' + recetaId, 'true');
        } else {
            localStorage.removeItem('fav-' + recetaId);
            // Si el usuario está en la pestaña de favoritos, ocultamos la card al quitar el corazón
            if (filtroSoloFavoritos) filtrar();
        }
    });
});

/* --- LÓGICA DE LOGIN Y SESIÓN --- */

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        // Intentar recuperar el usuario registrado previamente
        const usuarioRegistrado = localStorage.getItem('usuarioRegistrado');

        if (usuarioRegistrado) {
            const user = JSON.parse(usuarioRegistrado);

            if (email === user.email && pass === user.password) {
                alert('¡Bienvenido a NutriDePP!');
                sessionStorage.setItem('sesionActiva', 'true'); 
                window.location.href = 'index.html';
            } else {
                alert('Credenciales incorrectas. Intenta de nuevo.');
            }
        } else {
            alert('No se encontró ninguna cuenta. Por favor, regístrate primero.');
        }
    });
}

/**
 * Función global para cerrar sesión (usada en el nav)
 */
function cerrarSesion() {
    if (confirm("¿Seguro que quieres salir?")) {
        sessionStorage.removeItem('sesionActiva');
        window.location.href = 'login.html';
    }
}