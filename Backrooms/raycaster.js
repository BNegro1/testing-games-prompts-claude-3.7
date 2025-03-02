class Raycaster {
    constructor(canvas, mapa, texturas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mapa = mapa;
        this.texturas = texturas;
        
        this.establecerTamaño();
        window.addEventListener('resize', () => this.establecerTamaño());
    }
    
    establecerTamaño() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ancho = this.canvas.width;
        this.alto = this.canvas.height;
    }
    
    renderizar(jugador) {
        const { x, y, dirección, planoCámara } = jugador;
        
        // Limpiar pantalla
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.ancho, this.alto);
        
        // Dibujar techo (negro) y suelo (color de alfombra de Backrooms)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.ancho, this.alto / 2);
        this.ctx.fillStyle = '#847e56';
        this.ctx.fillRect(0, this.alto / 2, this.ancho, this.alto / 2);
        
        // Para cada columna de la pantalla
        for (let x = 0; x < this.ancho; x++) {
            // Calcular posición y dirección del rayo
            const cámaraX = 2 * x / this.ancho - 1;
            const rayDirX = Math.cos(dirección) + planoCámara * cámaraX;
            const rayDirY = Math.sin(dirección) + planoCámara * cámaraX;
            
            // Posición inicial del rayo (posición del jugador)
            let mapX = Math.floor(jugador.x);
            let mapY = Math.floor(jugador.y);
            
            // Longitud del rayo desde una posición lateral a la siguiente
            const deltaDistX = Math.abs(1 / rayDirX);
            const deltaDistY = Math.abs(1 / rayDirY);
            
            // Calcular paso y distancia lateral inicial
            let pasoX, pasoY;
            let sideDistX, sideDistY;
            
            if (rayDirX < 0) {
                pasoX = -1;
                sideDistX = (jugador.x - mapX) * deltaDistX;
            } else {
                pasoX = 1;
                sideDistX = (mapX + 1.0 - jugador.x) * deltaDistX;
            }
            
            if (rayDirY < 0) {
                pasoY = -1;
                sideDistY = (jugador.y - mapY) * deltaDistY;
            } else {
                pasoY = 1;
                sideDistY = (mapY + 1.0 - jugador.y) * deltaDistY;
            }
            
            // DDA (Algoritmo Digital Diferencial)
            let golpeaPared = false;
            let lado = 0; // 0 para paredes NS, 1 para paredes EO
            
            while (!golpeaPared) {
                // Saltar al siguiente cuadrado del mapa en dirección X o Y
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += pasoX;
                    lado = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += pasoY;
                    lado = 1;
                }
                
                // Verificar si el rayo golpea una pared
                if (this.mapa.datos[mapY][mapX] > 0) {
                    golpeaPared = true;
                }
            }
            
            // Calcular distancia perpendicular a la pared
            let distanciaPared;
            if (lado === 0) {
                distanciaPared = (mapX - jugador.x + (1 - pasoX) / 2) / rayDirX;
            } else {
                distanciaPared = (mapY - jugador.y + (1 - pasoY) / 2) / rayDirY;
            }
            
            // Calcular altura de la línea a dibujar
            const alturaLínea = Math.floor(this.alto / distanciaPared);
            
            // Calcular píxel más bajo y más alto para rellenar la franja actual
            let drawStart = Math.floor(-alturaLínea / 2 + this.alto / 2);
            if (drawStart < 0) drawStart = 0;
            let drawEnd = Math.floor(alturaLínea / 2 + this.alto / 2);
            if (drawEnd >= this.alto) drawEnd = this.alto - 1;
            
            // Elegir textura de pared
            const texNum = this.mapa.datos[mapY][mapX] - 1;
            
            // Calcular valor exacto donde fue golpeada la pared
            let wallX;
            if (lado === 0) {
                wallX = jugador.y + distanciaPared * rayDirY;
            } else {
                wallX = jugador.x + distanciaPared * rayDirX;
            }
            wallX -= Math.floor(wallX);
            
            // Coordenada x de la textura
            let texX = Math.floor(wallX * this.texturas[texNum].width);
            if ((lado === 0 && rayDirX > 0) || (lado === 1 && rayDirY < 0)) {
                texX = this.texturas[texNum].width - texX - 1;
            }
            
            // Dibujar la franja vertical
            const imagenData = this.texturas[texNum];
            
            // Efecto pixelado (menor calidad de textura)
            const factorPixel = 4; // Mayor número = más pixelado
            texX = Math.floor(texX / factorPixel) * factorPixel;
            
            // Color base de la pared amarilla de los Backrooms
            let colorPared = '#f2e6aa';
            
            // Oscurecer paredes según la distancia y orientación
            const factorOscuridad = 1 - Math.min(0.7, distanciaPared / 15);
            const r = Math.floor(242 * factorOscuridad);
            const g = Math.floor(230 * factorOscuridad);
            const b = Math.floor(170 * factorOscuridad);
            
            // Paredes EO son más oscuras
            colorPared = lado === 1 ? `rgb(${r-20},${g-20},${b-20})` : `rgb(${r},${g},${b})`;
            
            // Efecto de luz fluorescente
            const flickerIntensity = 0.05;
            const flickerEffect = 1 - flickerIntensity + Math.random() * flickerIntensity * 2;
            
            // Aplicar efecto de parpadeo a las paredes
            const fr = Math.floor(Math.min(255, r * flickerEffect));
            const fg = Math.floor(Math.min(255, g * flickerEffect));
            const fb = Math.floor(Math.min(255, b * flickerEffect));
            
            colorPared = `rgb(${fr},${fg},${fb})`;
            
            // Dibujar la línea
            this.ctx.fillStyle = colorPared;
            this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
            
            // Guardar la distancia para cada línea vertical (para el minimapa)
            this.zBuffer = this.zBuffer || new Array(this.ancho).fill(0);
            this.zBuffer[x] = distanciaPared;
        }
    }
    
    // Dibujar el minimapa
    dibujarMinimapa(jugador, minimapaElement) {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = minimapaElement.offsetWidth;
        ctx.canvas.height = minimapaElement.offsetHeight;
        
        const escala = 4; // Escala del minimapa
        const tamañoCeldaMinimapa = this.mapa.tamañoCelda / escala;
        
        // Dibujar fondo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Dibujar el mapa
        for (let y = 0; y < this.mapa.datos.length; y++) {
            for (let x = 0; x < this.mapa.datos[y].length; x++) {
                if (this.mapa.datos[y][x] === 1) {
                    ctx.fillStyle = '#f2e6aa'; // Color de pared
                    ctx.fillRect(
                        x * tamañoCeldaMinimapa - jugador.x * tamañoCeldaMinimapa + ctx.canvas.width / 2,
                        y * tamañoCeldaMinimapa - jugador.y * tamañoCeldaMinimapa + ctx.canvas.height / 2,
                        tamañoCeldaMinimapa, tamañoCeldaMinimapa
                    );
                }
            }
        }
        
        // Dibujar al jugador
        ctx.fillStyle = '#ff0000'; // Color del jugador
        ctx.beginPath();
        ctx.arc(
            ctx.canvas.width / 2,
            ctx.canvas.height / 2,
            3, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Dibujar dirección
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.lineTo(
            ctx.canvas.width / 2 + Math.cos(jugador.dirección) * 8,
            ctx.canvas.height / 2 + Math.sin(jugador.dirección) * 8
        );
        ctx.stroke();
        
        // Actualizar el minimapa
        minimapaElement.innerHTML = '';
        minimapaElement.appendChild(ctx.canvas);
    }
}
