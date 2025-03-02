// Variables globales
let raycaster;
let jugador;
let teclas = {};
let ultimoTiempo = 0;
let efectoParpadeo = 0;

// Inicialización del juego
function iniciarJuego() {
    // Inicializar el canvas
    const canvas = document.getElementById('gameCanvas');
    const minimapa = document.getElementById('minimapa');
    const coordsElement = document.getElementById('coords');
    
    // Inicializar el jugador en el punto de spawn
    jugador = {
        x: MAPA.spawn.x,
        y: MAPA.spawn.y,
        dirección: MAPA.spawn.dirección,
        planoCámara: 0.66,  // Campo de visión
        velocidad: 3.0,     // Velocidad de movimiento
        velocidadGiro: 2.0  // Velocidad de rotación
    };
    
    // Inicializar el raycaster
    raycaster = new Raycaster(canvas, MAPA, TEXTURAS);
    
    // Eventos de teclado
    window.addEventListener('keydown', (e) => {
        teclas[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        teclas[e.key] = false;
    });
    
    // Oscurecer la pantalla inicialmente para efecto dramático
    canvas.style.filter = "brightness(0)";
    setTimeout(() => {
        canvas.style.filter = "brightness(1)";
        canvas.style.transition = "filter 2s ease-in";
    }, 500);
    
    // Iniciar el bucle del juego
    requestAnimationFrame(bucleJuego);
    
    // Usar puntero de bloqueo para una experiencia más inmersiva
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        canvas.requestPointerLock();
    });
    
    // Controlar el movimiento del ratón (girar la cámara)
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            jugador.dirección += e.movementX * 0.002;
        }
    });
}

// Bucle principal del juego
function bucleJuego(tiempoActual) {
    // Calcular delta de tiempo para movimiento suave
    const deltaTime = (tiempoActual - ultimoTiempo) / 1000;
    ultimoTiempo = tiempoActual;
    
    // Procesar entrada del usuario
    procesarEntrada(deltaTime);
    
    // Actualizar efectos visuales
    actualizarEfectos(deltaTime);
    
    // Renderizar escena
    raycaster.renderizar(jugador);
    
    // Actualizar minimapa
    raycaster.dibujarMinimapa(jugador, document.getElementById('minimapa'));
    
    // Actualizar coordenadas
    document.getElementById('coords').textContent = `${Math.floor(jugador.x)}, ${Math.floor(jugador.y)}`;
    
    // Continuar el bucle
    requestAnimationFrame(bucleJuego);
}

// Procesar entrada del usuario
function procesarEntrada(deltaTime) {
    // Variables para la dirección y el plano de la cámara
    const dirX = Math.cos(jugador.dirección);
    const dirY = Math.sin(jugador.dirección);
    const planoX = -Math.sin(jugador.dirección) * jugador.planoCámara;
    const planoY = Math.cos(jugador.dirección) * jugador.planoCámara;
    
    // Velocidad ajustada al tiempo
    const velocidadMovimiento = jugador.velocidad * deltaTime;
    const velocidadRotación = jugador.velocidadGiro * deltaTime;
    
    // Movimiento adelante/atrás
    if (teclas['w'] || teclas['ArrowUp']) {
        const nuevaX = jugador.x + dirX * velocidadMovimiento;
        const nuevaY = jugador.y + dirY * velocidadMovimiento;
        if (!MAPA.hayPared(nuevaX, jugador.y)) jugador.x = nuevaX;
        if (!MAPA.hayPared(jugador.x, nuevaY)) jugador.y = nuevaY;
    }
    if (teclas['s'] || teclas['ArrowDown']) {
        const nuevaX = jugador.x - dirX * velocidadMovimiento;
        const nuevaY = jugador.y - dirY * velocidadMovimiento;
        if (!MAPA.hayPared(nuevaX, jugador.y)) jugador.x = nuevaX;
        if (!MAPA.hayPared(jugador.x, nuevaY)) jugador.y = nuevaY;
    }
    
    // Movimiento lateral (strafing)
    if (teclas['a'] || teclas['ArrowLeft']) {
        const nuevaX = jugador.x - planoX * velocidadMovimiento;
        const nuevaY = jugador.y - planoY * velocidadMovimiento;
        if (!MAPA.hayPared(nuevaX, jugador.y)) jugador.x = nuevaX;
        if (!MAPA.hayPared(jugador.x, nuevaY)) jugador.y = nuevaY;
    }
    if (teclas['d'] || teclas['ArrowRight']) {
        const nuevaX = jugador.x + planoX * velocidadMovimiento;
        const nuevaY = jugador.y + planoY * velocidadMovimiento;
        if (!MAPA.hayPared(nuevaX, jugador.y)) jugador.x = nuevaX;
        if (!MAPA.hayPared(jugador.x, nuevaY)) jugador.y = nuevaY;
    }
    
    // Rotación con teclas Q y E
    if (teclas['q']) {
        jugador.dirección -= velocidadRotación;
    }
    if (teclas['e']) {
        jugador.dirección += velocidadRotación;
    }
    
    // Correr con Shift
    if (teclas['Shift']) {
        jugador.velocidad = 5.0;
    } else {
        jugador.velocidad = 3.0;
    }
}

// Actualizar efectos visuales del juego
function actualizarEfectos(deltaTime) {
    // Efecto de parpadeo aleatorio de luces fluorescentes
    efectoParpadeo += deltaTime;
    if (efectoParpadeo > 3 + Math.random() * 5) {
        efectoParpadeo = 0;
        // Parpadeo de luz
        const canvas = document.getElementById('gameCanvas');
        canvas.style.filter = "brightness(0.7)";
        
        // Sonido de luces fluorescentes (opcional)
        if (Math.random() > 0.7) {
            reproducirSonidoFluorescente();
        }
        
        // Restablecer después de un breve parpadeo
        setTimeout(() => {
            canvas.style.filter = "brightness(1)";
        }, 100);
    }
}

// Función para reproducir sonido de luces fluorescentes
function reproducirSonidoFluorescente() {
    // En una implementación completa, aquí podrías añadir código para reproducir sonidos
    // Por ahora lo dejamos como placeholder
}

// Función para comprobar colisiones
function hayColision(x, y) {
    return MAPA.hayPared(x, y);
}
