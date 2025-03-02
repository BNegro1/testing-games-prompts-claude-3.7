// Función para crear una textura procedural
function crearTextura(ancho, alto, func) {
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(ancho, alto);
    
    for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
            const {r, g, b, a} = func(x, y);
            const idx = (y * ancho + x) * 4;
            imageData.data[idx] = r;
            imageData.data[idx + 1] = g;
            imageData.data[idx + 2] = b;
            imageData.data[idx + 3] = a;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

// Crear textura para la pared
const texturaPared = crearTextura(64, 64, (x, y) => {
    // Color base amarillo de los Backrooms
    let r = 242, g = 230, b = 170;
    
    // Añadir variación para simular manchas y deterioro
    const variación = Math.random() * 0.2 - 0.1;
    r = Math.max(0, Math.min(255, r + r * variación));
    g = Math.max(0, Math.min(255, g + g * variación));
    b = Math.max(0, Math.min(255, b + b * variación));
    
    // Añadir líneas horizontales para simular paneles
    if ((y % 16 === 0) || (y % 16 === 15)) {
        r -= 20;
        g -= 20;
        b -= 20;
    }
    
    // Añadir líneas verticales
    if ((x % 32 === 0) || (x % 32 === 31)) {
        r -= 15;
        g -= 15;
        b -= 15;
    }
    
    return {r, g, b, a: 255};
});

// Crear textura para la alfombra
const texturaAlfombra = crearTextura(64, 64, (x, y) => {
    // Color base de la alfombra de los Backrooms
    let r = 132, g = 126, b = 86;
    
    // Añadir variación para simular manchas y deterioro
    const variación = Math.random() * 0.3 - 0.15;
    r = Math.max(0, Math.min(255, r + r * variación));
    g = Math.max(0, Math.min(255, g + g * variación));
    b = Math.max(0, Math.min(255, b + b * variación));
    
    // Añadir patrón de alfombra
    if ((x % 8 === 0) || (y % 8 === 0)) {
        r += 10;
        g += 10;
        b += 10;
    }
    
    return {r, g, b, a: 255};
});

// Crear textura para el techo
const texturaTecho = crearTextura(64, 64, (x, y) => {
    // Color base del techo (blanco con tono amarillento de luces fluorescentes)
    let r = 240, g = 240, b = 230;
    
    // Añadir variación para simular manchas y deterioro
    const variación = Math.random() * 0.1 - 0.05;
    r = Math.max(0, Math.min(255, r + r * variación));
    g = Math.max(0, Math.min(255, g + g * variación));
    b = Math.max(0, Math.min(255, b + b * variación));
    
    // Añadir patrón para paneles del techo
    if ((x % 16 < 2) || (y % 16 < 2)) {
        r -= 20;
        g -= 20;
        b -= 20;
    }
    
    return {r, g, b, a: 255};
});

// Exportar las texturas
const TEXTURAS = [texturaPared, texturaAlfombra, texturaTecho];
