/**
 * Componentes de Teclado e Grid
 */

export function buildMultipleGridsDOM(mode, rows, cols, container, onTileClick) {
    container.innerHTML = "";
    container.className = "boards-container";
    if (mode === 2) container.classList.add("mode-duo");
    if (mode === 4) container.classList.add("mode-quartet");

    for (let b = 0; b < mode; b++) {
        const grid = document.createElement("main");
        grid.className = "game-grid";
        grid.id = `grid-${b}`;
        grid.style.setProperty("--rows", rows);
        
        for (let i = 0; i < rows; i++) {
            const row = document.createElement("div");
            row.className = "grid-row";
            for (let j = 0; j < cols; j++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.id = `tile-${b}-${i}-${j}`;
                tile.onclick = () => onTileClick(b, i, j);
                row.appendChild(tile);
            }
            grid.appendChild(row);
        }
        container.appendChild(grid);
    }
}

export function buildKeyboardDOM(container, handleInputCallback) {
    const layout = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BKSP"]
    ];

    container.innerHTML = "";
    layout.forEach(rowArr => {
        const row = document.createElement("div");
        row.className = "keyboard-row";
        rowArr.forEach(key => {
            const btn = document.createElement("button");
            btn.className = "key";
            btn.textContent = key === "BKSP" ? "⌫" : key;
            if (key === "ENTER" || key === "BKSP") btn.classList.add("large");
            btn.setAttribute("data-key", key);
            btn.onclick = () => handleInputCallback(key);
            row.appendChild(btn);
        });
        container.appendChild(row);
    });
}
