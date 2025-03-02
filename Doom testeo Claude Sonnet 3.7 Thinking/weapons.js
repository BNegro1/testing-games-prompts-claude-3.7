class WeaponSystem {
    constructor() {
        this.weaponElement = document.getElementById('weapon');
        this.weaponImage = document.getElementById('weaponImage');
        this.ammoElement = document.getElementById('ammo');
        
        // Configuración de armas
        this.weapons = {
            pistol: {
                name: "Pistola",
                damage: 10,
                ammo: 50,
                fireRate: 500, // ms entre disparos
                reloadTime: 1000,
                image: this.createWeaponImage('#555', '#333', 0.4)
            },
            shotgun: {
                name: "Escopeta",
                damage: 40,
                ammo: 20,
                fireRate: 800,
                reloadTime: 1500,
                image: this.createWeaponImage('#855', '#553', 0.6)
            }
        };
        
        this.currentWeapon = 'pistol';
        this.lastFireTime = 0;
        this.isReloading = false;
        
        // Establecer arma inicial
        this.setWeapon(this.currentWeapon);
    }
    
    createWeaponImage(color1, color2, size) {
        // Crea una imagen de arma simple con SVG
        const svgWidth = 200;
        const svgHeight = 200;
        
        const svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <rect x="${svgWidth * (0.5 - size/2)}" y="${svgHeight * 0.1}" width="${svgWidth * size}" height="${svgHeight * 0.2}" fill="${color1}" />
            <rect x="${svgWidth * (0.5 - size/4)}" y="${svgHeight * 0.3}" width="${svgWidth * size/2}" height="${svgHeight * 0.6}" fill="${color2}" />
        </svg>`;
        
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    
    setWeapon(weaponName) {
        if (this.weapons[weaponName]) {
            this.currentWeapon = weaponName;
            this.weaponImage.src = this.weapons[weaponName].image;
            this.updateAmmoDisplay();
        }
    }
    
    updateAmmoDisplay() {
        this.ammoElement.textContent = `MUNICIÓN: ${this.weapons[this.currentWeapon].ammo}`;
    }
    
    fire() {
        const now = Date.now();
        const weapon = this.weapons[this.currentWeapon];
        
        // Verificar si podemos disparar
        if (this.isReloading || 
            weapon.ammo <= 0 || 
            now - this.lastFireTime < weapon.fireRate) {
            return false;
        }
        
        // Registrar el disparo
        this.lastFireTime = now;
        weapon.ammo--;
        this.updateAmmoDisplay();
        
        // Animación de disparo
        this.weaponElement.classList.remove('weapon-fire');
        void this.weaponElement.offsetWidth; // Forzar reinicio de animación
        this.weaponElement.classList.add('weapon-fire');
        
        // Sonido de disparo (simplificado)
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...';
        audio.volume = 0.2;
        audio.play().catch(e => {}); // Capturar error si el navegador bloquea autoplay
        
        return true;
    }
    
    switchWeapon() {
        // Alternar entre armas disponibles
        this.currentWeapon = this.currentWeapon === 'pistol' ? 'shotgun' : 'pistol';
        this.setWeapon(this.currentWeapon);
    }
    
    reload() {
        if (this.isReloading) return;
        
        this.isReloading = true;
        const weapon = this.weapons[this.currentWeapon];
        
        setTimeout(() => {
            // Recarga simplificada
            if (this.currentWeapon === 'pistol') {
                weapon.ammo = 50;
            } else {
                weapon.ammo = 20;
            }
            this.isReloading = false;
            this.updateAmmoDisplay();
        }, weapon.reloadTime);
    }
}
