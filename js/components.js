export function buildMultipleGridsDOM(
  mode,
  rows,
  cols,
  container,
  onTileClick
) {
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

export function resetKeyboardDOM(container) {
  const keys = container.querySelectorAll(".key");
  keys.forEach((btn) => {
    btn.classList.remove("correct", "present", "absent");
  });
}
export function buildKeyboardDOM(container, handleInputCallback, includeNumbers = false) {
  const layout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BKSP"],
  ];

  if (includeNumbers) {
    layout.unshift(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
  }

  container.innerHTML = "";
  layout.forEach((rowArr) => {
    const row = document.createElement("div");
    row.className = "keyboard-row";
    rowArr.forEach((key) => {
      const btn = document.createElement("button");
      btn.className = "key";
      
      const textSpan = document.createElement("span");
      textSpan.textContent = key === "BKSP" ? "⌫" : key;
      btn.appendChild(textSpan);

      // Multi-board indicators (4 quadrants)
      const indicators = document.createElement("div");
      indicators.className = "key-indicators";
      for (let i = 0; i < 4; i++) {
        const ind = document.createElement("div");
        ind.className = "indicator";
        indicators.appendChild(ind);
      }
      btn.appendChild(indicators);

      if (key === "ENTER" || key === "BKSP") btn.classList.add("large");
      btn.setAttribute("data-key", key);
      btn.onfocus = (e) => e.target.blur(); // Prevent physical Enter from clicking focused virtual key
      btn.onclick = () => handleInputCallback(key);
      row.appendChild(btn);
    });
    container.appendChild(row);
  });
}
