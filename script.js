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

    // --- LÓGICA DE IMAGEN DE RESPALDO ---
    // Si 'receta.imagen' no existe o está vacía, usamos una imagen genérica de comida saludable
    const imgUrl = receta.imagen && receta.imagen.trim() !== "" 
                   ? receta.imagen 
                   : "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800";
    
    const infoExtra = receta.aporta || receta.beneficios || "Nutrición inteligente";

    div.innerHTML = `
        <div class="card-image-container" style="position: relative;">
            <img src="${imgUrl}" 
                 alt="${receta.nombre}" 
                 onerror="this.src='https://via.placeholder.com/800x500?text=NutriDePP+Receta'"
                 style="width:100%; height:180px; object-fit:cover; border-radius:20px 20px 0 0; display: block;">
            
            <button class="btn-fav" title="Favoritos" style="position:absolute; top:12px; right:12px;">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>
        <div class="card-body" style="padding: 15px;">
            <h3 style="font-size: 1.1rem; margin-bottom: 8px;">${receta.nombre}</h3>
            <p style="font-size: 0.85rem; color: #666; min-height: 40px;">${infoExtra}</p>
            <span class="tag">${receta.tag}</span>
        </div>
    `;
    
    listaRecetas.appendChild(div);
}
/* --- INICIALIZACIÓN AL CARGAR --- */

/* --- CARGA DINÁMICA POR TIPO DE DÍA --- */
window.addEventListener('DOMContentLoaded', () => {
    fetch('recetas.json')
        .then(response => response.json())
        .then(data => {
            if (listaRecetas) listaRecetas.innerHTML = ""; 

            const tiposDeDia = ['dia_normal', 'dia_partido', 'dia_entrenamiento'];
            const categorias = ['desayunos', 'almuerzos', 'cenas', 'colaciones'];
            
            // Creamos un Set para rastrear IDs ya procesados
            const idsProcesados = new Set();

            tiposDeDia.forEach(dia => {
                const recetasDelDia = data.recetas[dia];
                
                categorias.forEach(cat => {
                    if (recetasDelDia[cat]) {
                        recetasDelDia[cat].forEach(receta => {
                            // VERIFICACIÓN: Si el ID ya existe en el Set, no la cargamos
                            if (!idsProcesados.has(receta.id)) {
                                idsProcesados.add(receta.id);
                                
                                receta.tipoDia = dia;
                                receta.tag = cat.charAt(0).toUpperCase() + cat.slice(1);
                                
                                crearTarjetaReceta(receta);
                            }
                        });
                    }
                });
            });

            inicializarCorazones();
        })
        .catch(error => console.error("Error al filtrar repetidos:", error));
});

function cargarRecetasPorDia(tipoDeDia = 'dia_normal') {
    fetch('recetas.json')
        .then(res => res.json())
        .then(data => {
            if (listaRecetas) listaRecetas.innerHTML = ""; // Limpiamos la galería actual
            
            const categorias = ['desayunos', 'almuerzos', 'cenas', 'colaciones'];
            const recetasDelDia = data.recetas[tipoDeDia];

            categorias.forEach(cat => {
                if (recetasDelDia[cat]) {
                    recetasDelDia[cat].forEach(receta => {
                        // Agregamos el tag manualmente para que el filtro funcione
                        receta.tag = cat.charAt(0).toUpperCase() + cat.slice(1);
                        crearTarjetaReceta(receta);
                    });
                }
            });
            inicializarCorazones();
        });
}

// Variable global para guardar los datos una vez cargados
let datosRecetas = null;

// Función principal para cargar y mostrar
function mostrarRecetasPorDia(tipo) {
    if (!datosRecetas || !listaRecetas) return;

    // 1. Limpiar la galería actual
    listaRecetas.innerHTML = "";

    // 2. Obtener las recetas del día seleccionado (dia_normal, dia_partido, etc.)
    const diaSeleccionado = datosRecetas.recetas[tipo];
    const categorias = ['desayunos', 'almuerzos', 'cenas', 'colaciones'];

    // 3. Recorrer las categorías y crear las tarjetas
    categorias.forEach(cat => {
        if (diaSeleccionado[cat]) {
            diaSeleccionado[cat].forEach(receta => {
                // Asignamos el tag de categoría para el diseño
                receta.tag = cat.charAt(0).toUpperCase() + cat.slice(1);
                crearTarjetaReceta(receta);
            });
        }
    });

    // 4. Re-inicializar los corazones de favoritos
    inicializarCorazones();
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    fetch('recetas.json')
        .then(res => res.json())
        .then(data => {
            datosRecetas = data; // Guardamos los datos globalmente
            mostrarRecetasPorDia('dia_normal'); // Carga inicial por defecto
        })
        .catch(err => console.error("Error cargando el JSON:", err));

    // Eventos para los botones de TIPO DE DÍA
   

    document.getElementById('btnDiaNormal')?.addEventListener('click', (e) => {
        gestionarActivoDia(e.currentTarget);
        mostrarRecetasPorDia('dia_normal');
    });

    document.getElementById('btnDiaEntreno')?.addEventListener('click', (e) => {
        gestionarActivoDia(e.currentTarget);
        mostrarRecetasPorDia('dia_entrenamiento');
    });

    document.getElementById('btnDiaPartido')?.addEventListener('click', (e) => {
        gestionarActivoDia(e.currentTarget);
        mostrarRecetasPorDia('dia_partido');
    });

});

/**
/**
 * Maneja el estado activo de los botones de día sin afectar a los de búsqueda/favoritos
 */
function gestionarActivoDia(botonSeleccionado) {
    // Buscamos los botones SOLO dentro del contenedor de días
    const contenedorDias = document.querySelector('.filtros-tipo-dia');
    if (contenedorDias) {
        contenedorDias.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.classList.remove('active-filtro');
        });
    }
    // Agregamos la clase al que clickeamos
    botonSeleccionado.classList.add('active-filtro');
}