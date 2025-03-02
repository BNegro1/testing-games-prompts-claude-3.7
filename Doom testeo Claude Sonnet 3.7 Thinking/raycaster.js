class Raycaster {
    constructor(canvas, mapSize = 16, tileSize = 64) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.mapSize = mapSize;
        this.tileSize = tileSize;
        
        // Mapa del nivel (1 representa pared, 0 espacio vacío)
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // Colores para diferentes distancias
        this.wallColors = [
            '#8B0000', // Rojo oscuro (cerca)
            '#B22222',
            '#CD5C5C',
            '#FF0000',
            '#FF4500', 
            '#FF6347',
            '#FF7F50', // Naranja (medio)
            '#CD853F',
            '#8B4513',
            '#A0522D', 
            '#654321',
            '#3A2715',
            '#2A1B0A', // Marrón oscuro (lejos)
        ];
        
        this.floorColor = '#333333';
        this.ceilingColor = '#111111';
        
        this.FOV = Math.PI / 3; // 60 grados en radianes
        this.rayCount = this.width / 2; // Resolución del raycasting
    }

    castRays(playerX, playerY, angle) {
        // Limpiar el canvas
        this.ctx.fillStyle = this.ceilingColor;
        this.ctx.fillRect(0, 0, this.width, this.height / 2);
        this.ctx.fillStyle = this.floorColor;
        this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
        
        // Calcular incremento del ángulo para cada rayo
        const angleIncrement = this.FOV / this.rayCount;
        
        // Calcular ángulo inicial para el primer rayo
        let rayAngle = angle - this.FOV / 2;
        
        // Lanzar todos los rayos
        for (let rayIndex = 0; rayIndex < this.rayCount; rayIndex++) {
            // Normalizar ángulo
            while (rayAngle < 0) rayAngle += 2 * Math.PI;
            while (rayAngle >= 2 * Math.PI) rayAngle -= 2 * Math.PI;
            
            // Dirección del rayo
            const rayDirX = Math.cos(rayAngle);
            const rayDirY = Math.sin(rayAngle);
            
            // Simulación básica de intersección
            let distance = this.findWallDistance(playerX, playerY, rayDirX, rayDirY);
            
            // Corregir efecto ojo de pez
            distance = distance * Math.cos(angle - rayAngle);
            
            // Calcular altura de la pared
            const wallHeight = Math.min(this.height, this.height / distance * 2);
            
            // Determinar color basado en la distancia
            const colorIndex = Math.min(this.wallColors.length - 1, 
                                       Math.floor(distance * 2));
            const wallColor = this.wallColors[colorIndex];
            
            // Dibujar columna (pared)
            const columnWidth = this.width / this.rayCount;
            const x = rayIndex * columnWidth;
            const wallTop = (this.height - wallHeight) / 2;
            
            this.ctx.fillStyle = wallColor;
            this.ctx.fillRect(x, wallTop, columnWidth + 1, wallHeight);
            
            // Avanzar al siguiente rayo
            rayAngle += angleIncrement;
        }
    }
    
    findWallDistance(playerX, playerY, dirX, dirY) {
        // Algoritmo simplificado de DDA (Digital Differential Analysis)
        let mapX = Math.floor(playerX);
        let mapY = Math.floor(playerY);
        
        let sideDistX, sideDistY;
        
        // Longitud del rayo desde una posición x/y al siguiente x/y
        const deltaDistX = Math.abs(1 / dirX);
        const deltaDistY = Math.abs(1 / dirY);
        
        let stepX, stepY;
        let hit = 0;
        let side;
        
        if (dirX < 0) {
            stepX = -1;
            sideDistX = (playerX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - playerX) * deltaDistX;
        }
        
        if (dirY < 0) {
            stepY = -1;
            sideDistY = (playerY - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - playerY) * deltaDistY;
        }
        
        // DDA algorithm
        while (hit === 0) {
            // Saltar al siguiente cuadrado del mapa
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            
            // Comprobar si el rayo ha alcanzado una pared
            if (mapX < 0 || mapX >= this.mapSize || mapY < 0 || mapY >= this.mapSize) {
                hit = 1; // Fuera del mapa
                return 5; // Distancia por defecto
            } else if (this.map[mapY][mapX] > 0) {
                hit = 1; // Pared alcanzada
            }
        }
        
        // Calcular distancia perpendicular a la pared
        let wallDist;
        if (side === 0) {
            wallDist = (mapX - playerX + (1 - stepX) / 2) / dirX;
        } else {
            wallDist = (mapY - playerY + (1 - stepY) / 2) / dirY;
        }
        
        return wallDist;
    }
}
