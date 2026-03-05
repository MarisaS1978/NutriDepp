document.addEventListener('keyup', e => {
    // Si el cambio viene del id "buscador"
    if (e.target.matches('#buscador')) {
        const query = e.target.value.toLowerCase();
        
        document.querySelectorAll('.receta-card').forEach(receta => {
            // Buscamos dentro del texto de la tarjeta
            const nombre = receta.getAttribute('data-nombre').toLowerCase();
            
            if (nombre.includes(query)) {
                receta.classList.remove('hidden');
            } else {
                receta.classList.add('hidden');
            }
        });
    }
});