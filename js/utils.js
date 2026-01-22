/**
 * Remove acentos e caracteres especiais, converte para maiúsculas
 * @param {string} str
 * @returns {string}
 */
export function normalizeWord(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export const StatsManager = {
  KEY: "termo_stats_v2",

  load() {
    const stats = localStorage.getItem(this.KEY);
    const defaultModeStats = () => ({
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: {},
    });

    if (!stats) {
      return {
        1: defaultModeStats(),
        2: defaultModeStats(),
        4: defaultModeStats(),
      };
    }
    return JSON.parse(stats);
  },

  save(allStats) {
    localStorage.setItem(this.KEY, JSON.stringify(allStats));
  },
};

export function generateShareText(status, currentRow, cols, mode) {
  const modeName = mode === 1 ? "Mono" : mode === 2 ? "Dueto" : "Quarteto";
  const title = `Termo Infinito (${modeName}) ${
    status === "won" ? currentRow : "X"
  }/${mode === 1 ? 6 : mode === 2 ? 7 : 9}\n\n`;

  let grid = "";
  if (mode === 1) {
    for (let i = 0; i < currentRow; i++) {
      for (let j = 0; j < cols; j++) {
        const tile = document.getElementById(`tile-0-${i}-${j}`);
        if (tile.classList.contains("correct")) grid += "🟩";
        else if (tile.classList.contains("present")) grid += "🟨";
        else grid += "⬛";
      }
      grid += "\n";
    }
  } else {
    grid = `Joguei o modo ${modeName} e ${
      status === "won" ? "venci" : "perdi"
    }!`;
  }

  return title + grid;
}
