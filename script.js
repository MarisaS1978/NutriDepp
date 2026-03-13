const buscador = document.getElementById('inputBuscador');
        const recetas = document.querySelectorAll('.receta-card');
        const mensajeSinResultados = document.getElementById('sinResultados');

        buscador.addEventListener('input', () => {
            const filtro = buscador.value.toLowerCase();
            let hayResultados = false;

            recetas.forEach(receta => {
                const texto = receta.innerText.toLowerCase();
                const tags = receta.getAttribute('data-tags').toLowerCase();

                if (texto.includes(filtro) || tags.includes(filtro)) {
                    receta.style.display = "block";
                    hayResultados = true;
                } else {
                    receta.style.display = "none";
                }
            });

            // Mostrar mensaje si no hay coincidencias
            mensajeSinResultados.style.display = hayResultados ? "none" : "block";
        });

document.querySelectorAll('.btn-fav').forEach(boton => {
    // Al cargar la página, revisamos si ya estaba en favoritos
    const recetaId = boton.parentElement.getAttribute('data-id');
    if (localStorage.getItem('fav-' + recetaId)) {
        boton.classList.add('active');
    }

    boton.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el clic abra la receta completa
        
        boton.classList.toggle('active');
        
        if (boton.classList.contains('active')) {
            localStorage.setItem('fav-' + recetaId, 'true');
            console.log("Guardado en favoritos");
        } else {
            localStorage.removeItem('fav-' + recetaId);
            console.log("Eliminado de favoritos");
        }
    });
});

const btnFavs = document.getElementById('btnVerFavs');
const btnTodas = document.getElementById('btnVerTodas');

// Función para mostrar solo favoritos
btnFavs.addEventListener('click', () => {
    btnFavs.classList.add('active-filtro');
    btnTodas.classList.remove('active-filtro');

    document.querySelectorAll('.receta-card').forEach(receta => {
        const corazon = receta.querySelector('.btn-fav');
        if (corazon.classList.contains('active')) {
            receta.style.display = "block";
        } else {
            receta.style.display = "none";
        }
    });
});

// Función para volver a ver todas
btnTodas.addEventListener('click', () => {
    btnTodas.classList.add('active-filtro');
    btnFavs.classList.remove('active-filtro');
    
    document.querySelectorAll('.receta-card').forEach(receta => {
        receta.style.display = "block";
    });
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailIngresado = document.getElementById('email').value;
    const passIngresada = document.getElementById('password').value;

    // BUSCAR DATOS: Obtenemos el usuario que guardamos en el registro
    const datosGuardados = localStorage.getItem('usuarioRegistrado');

    if (datosGuardados) {
        const usuario = JSON.parse(datosGuardados); // Convertimos el texto a objeto otra vez

        // COMPARAR: ¿Coinciden los datos?
        if (emailIngresado === usuario.email && passIngresada === usuario.password) {
            alert('¡Bienvenido de nuevo a NutriDePP!');
            // Guardamos que el usuario está "logueado" actualmente
            sessionStorage.setItem('sesionActiva', 'true'); 
            window.location.href = 'index.html';
        } else {
            alert('Correo o contraseña incorrectos. Inténtalo de nuevo.');
        }
    } else {
        alert('No hay ninguna cuenta registrada con este correo.');
    }
});

function cerrarSesion() {
    if (confirm("¿Quieres cerrar sesión?")) {
        sessionStorage.removeItem('sesionActiva'); // Borra el estado de logueado
        window.location.href = 'login.html';
    }
}