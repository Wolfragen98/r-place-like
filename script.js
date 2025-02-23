const canvas = document.getElementById("grid-canvas");
const ctx = canvas.getContext("2d");
const colorPalette = document.getElementById("color-palette");

let currentColor = "#000000"; // Výchozí barva
let pixelSize = 20; // Výchozí velikost pixelu
let rows = 500; // Počet řádků
let cols = 500; // Počet sloupců
let offsetX = 0; // Posunutí na ose X
let offsetY = 0; // Posunutí na ose Y
let isDragging = false; // Kontrola, zda je pravé tlačítko drženo
let startX, startY; // Počáteční pozice při dragování

// Generování barev pro paletu
const colors = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF", "#000000",
    "#FFC0CB", "#800080", "#808080", "#008000", "#FFA500", "#800000", "#808000", "#ADD8E6",
    "#D3D3D3", "#A52A2A", "#00008B", "#006400"
];

// Pole pro uložení stavů pixelů
let pixelStates = {};

// Funkce pro změnu barvy
function changeColor(color) {
    currentColor = color;
}

// Funkce pro kreslení pixelu
function drawPixel(x, y) {
    pixelStates[`${x},${y}`] = currentColor;

    // Vykreslení pixelu na canvas
    ctx.fillStyle = currentColor;
    ctx.fillRect(x * pixelSize - offsetX, y * pixelSize - offsetY, pixelSize, pixelSize);
}

// Funkce pro vykreslení mřížky (pixelů a čar)
function renderGrid() {
    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    // Vykreslení všech pixelů
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Pokud má pixel barvu, použijeme ji
            if (pixelStates[`${x},${y}`]) {
                ctx.fillStyle = pixelStates[`${x},${y}`];
                ctx.fillRect(x * pixelSize - offsetX, y * pixelSize - offsetY, pixelSize, pixelSize);
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(x * pixelSize - offsetX, y * pixelSize - offsetY, pixelSize, pixelSize);
            }
        }
    }

    // Vykreslení mřížky (čáry)
    ctx.strokeStyle = "#CCCCCC"; // Barva čar mřížky
    ctx.lineWidth = 1;

    // Svislé čáry
    for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * pixelSize - offsetX, 0);
        ctx.lineTo(x * pixelSize - offsetX, canvas.height);
        ctx.stroke();
    }

    // Vodorovné čáry
    for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * pixelSize - offsetY);
        ctx.lineTo(canvas.width, y * pixelSize - offsetY);
        ctx.stroke();
    }
}

// Funkce pro vytvoření barevné palety
function createColorPalette() {
    colors.forEach(color => {
        const button = document.createElement("button");
        button.style.backgroundColor = color;
        button.addEventListener("click", () => changeColor(color));
        colorPalette.appendChild(button);
    });
}

// Funkce pro zoomování
function zoom(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // Zoom in nebo out
    const newPixelSize = pixelSize * zoomFactor;

    if (newPixelSize >= 10 && newPixelSize <= 40) {
        const zoomRatio = newPixelSize / pixelSize;
        
        // Posun mřížky podle pozice myši
        offsetX = mouseX - (mouseX - offsetX) * zoomRatio;
        offsetY = mouseY - (mouseY - offsetY) * zoomRatio;
        
        pixelSize = newPixelSize;
    }

    renderGrid();
}

// Funkce pro posouvání mřížky pomocí klávesnice
function moveGrid(event) {
    const moveSpeed = 20; // Rychlost posouvání

    if (event.key === "ArrowUp") {
        offsetY -= moveSpeed;
    } else if (event.key === "ArrowDown") {
        offsetY += moveSpeed;
    } else if (event.key === "ArrowLeft") {
        offsetX -= moveSpeed;
    } else if (event.key === "ArrowRight") {
        offsetX += moveSpeed;
    }

    // Zamezíme posunutí mřížky mimo oblast
    offsetX = Math.max(0, Math.min(offsetX, canvas.width - cols * pixelSize));
    offsetY = Math.max(0, Math.min(offsetY, canvas.height - rows * pixelSize));

    renderGrid();
}

// Funkce pro zpracování pravého tlačítka myši a posouvání mřížky
function startDrag(event) {
    if (event.button === 2) { // Pravé tlačítko myši
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        event.preventDefault(); // Zabraňuje zobrazení kontextového menu
    }
}

function dragMove(event) {
    if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        
        offsetX -= dx;
        offsetY -= dy;

        // Zamezíme posunutí mřížky mimo oblast
        offsetX = Math.max(0, Math.min(offsetX, canvas.width - cols * pixelSize));
        offsetY = Math.max(0, Math.min(offsetY, canvas.height - rows * pixelSize));

        startX = event.clientX;
        startY = event.clientY;

        renderGrid();
    }
}

function stopDrag(event) {
    if (event.button === 2) { // Pravé tlačítko myši
        isDragging = false;
    }
}

// Přidání event listenerů pro zoomování, posouvání pomocí klávesnice a dragování
window.addEventListener('wheel', zoom);
window.addEventListener('keydown', moveGrid);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragMove);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('contextmenu', (event) => event.preventDefault()); // Zabráníme kontextovému menu pravého tlačítka

// Inicializace stránky
window.onload = function() {
    createColorPalette();
    renderGrid();
};

// Kliknutí na canvas pro kreslení
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left + offsetX) / pixelSize);
    const y = Math.floor((event.clientY - rect.top + offsetY) / pixelSize);
    drawPixel(x, y);
});
