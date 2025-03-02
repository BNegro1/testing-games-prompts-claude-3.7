class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.healthElement = document.getElementById('health');
        this.setupCanvas();
        
        this.player = {
            x: 2.5,
            y: 2.5,
            angle: 0,
            speed: 0.05,
            rotationSpeed: 0.05,
            health: 100
        };
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.raycaster = new Raycaster(this.canvas);
        this.weapons = new WeaponSystem();
        
        this.setupEventListeners();
        this.loop();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    setupEventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.up = true; break;
                case 's': this.keys.down = true; break;
                case 'a': this.keys.left = true; break;
                case 'd': this.keys.right = true; break;
                case ' ': this.weapons.fire(); break;
                case 'r': this.weapons.reload(); break;
                case 'q': this.weapons.switchWeapon(); break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.up = false; break;
                case 's': this.keys.down = false; break;
                case 'a': this.keys.left = false; break;
                case 'd': this.keys.right = false; break;
            }
        });
        
        // Bloquear el puntero para controlar la vista
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || 
                                           this.canvas.mozRequestPointerLock ||
                                           this.canvas.webkitRequestPointerLock;
            this.canvas.requestPointerLock();
        });
        
        // Movimiento del ratón para controlar la vista
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas || 
                document.mozPointerLockElement === this.canvas || 
                document.webkitPointerLockElement === this.canvas) {
                this.player.angle += e.movementX * 0.003;
            }
        });
        
        // Disparar con el ratón
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botón izquierdo
                this.weapons.fire();
            }
        });
    }
    
    update() {
        // Actualizar posición del jugador
        const moveSpeed = this.player.speed;
        const rotSpeed = this.player.rotationSpeed;
        
        if (this.keys.up) {
            const newX = this.player.x + Math.cos(this.player.angle) * moveSpeed;
            const newY = this.player.y + Math.sin(this.player.angle) * moveSpeed;
            this.tryMove(newX, newY);
        }
        if (this.keys.down) {
            const newX = this.player.x - Math.cos(this.player.angle) * moveSpeed;
            const newY = this.player.y - Math.sin(this.player.angle) * moveSpeed;
            this.tryMove(newX, newY);
        }
        if (this.keys.left) {
            this.player.angle -= rotSpeed;
        }
        if (this.keys.right) {
            this.player.angle += rotSpeed;
        }
    }
    
    tryMove(newX, newY) {
        // Comprobar colisiones (simplificado)
        const mapX = Math.floor(newX);
        const mapY = Math.floor(newY);
        
        if (mapX < 0 || mapY < 0 || mapX >= this.raycaster.mapSize || mapY >= this.raycaster.mapSize) {
            return; // Fuera del mapa
        }
        
        if (this.raycaster.map[mapY][mapX] === 0) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }
    
    render() {
        this.raycaster.castRays(this.player.x, this.player.y, this.player.angle);
    }
    
    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

// Iniciar el juego cuando la página esté completamente cargada
window.addEventListener('load', () => {
    new Game();
});
