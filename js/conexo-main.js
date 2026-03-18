import { CONEXO_THEMES } from "./conexo-words.js";

const ConexoStatsManager = {
  KEY: "conexo_game_stats",

  load() {
    const stats = localStorage.getItem(this.KEY);
    const defaultStats = () => ({
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
    });

    if (!stats) {
      return {
        easy: defaultStats(),
        medium: defaultStats(),
        hard: defaultStats(),
      };
    }
    return JSON.parse(stats);
  },

  save(allStats) {
    localStorage.setItem(this.KEY, JSON.stringify(allStats));
  },
};

const levels = {
  easy: { numThemes: 4, time: 180 }, // 16 words, 3 min
  medium: { numThemes: 6, time: 180 }, // 24 words, 3 min
  hard: { numThemes: 8, time: 150 }, // 32 words, 2.5 min
};

let gameStats = ConexoStatsManager.load();

let currentLevel = "easy";
let activeThemes = [];
let allWords = [];
let selectedWords = [];
let solvedThemes = [];
let timerInterval = null;
let timeRemaining = 0;
let isGameOver = false;
let isTimerStarted = false;

// DOM Elements
const container = document.getElementById("conexo-container");
const timerDisplay = document.getElementById("game-timer");
const toast = document.getElementById("toast");
const gameModal = document.getElementById("game-modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const btnNewGame = document.getElementById("btn-new-game");
const difficultyBtns = document.querySelectorAll(".diff-btn");
const helpModal = document.getElementById("help-modal");
const btnHelpTrigger = document.getElementById("btn-help-trigger");
const btnCloseHelp = document.getElementById("btn-close-help");
const statsModal = document.getElementById("stats-modal");
const btnStatsTrigger = document.getElementById("btn-stats-trigger");
const btnCloseStats = document.getElementById("btn-close-stats");

function showStats() {
  const diffStats = gameStats[currentLevel];
  document.getElementById("stat-played").textContent = diffStats.played;
  document.getElementById("stat-wins").textContent =
    Math.round((diffStats.wins / (diffStats.played || 1)) * 100) + "%";
  document.getElementById("stat-streak").textContent = diffStats.currentStreak;
  document.getElementById("stat-max-streak").textContent = diffStats.maxStreak;
  statsModal.classList.add("active");
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  initGame(currentLevel);
});

function setupEventListeners() {
  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      difficultyBtns.forEach((b) => b.classList.remove("active-mode"));
      e.target.classList.add("active-mode");
      currentLevel = e.target.getAttribute("data-level");
      initGame(currentLevel);
    });
  });

  btnNewGame.addEventListener("click", () => {
    gameModal.classList.remove("active");
    initGame(currentLevel);
  });

  btnHelpTrigger.addEventListener("click", () => {
    helpModal.classList.add("active");
  });

  btnCloseHelp.addEventListener("click", () => {
    helpModal.classList.remove("active");
  });

  btnStatsTrigger.addEventListener("click", () => {
    showStats();
  });

  btnCloseStats.addEventListener("click", () => {
    statsModal.classList.remove("active");
  });
}

function initGame(levelKey) {
  isGameOver = false;
  isTimerStarted = false;
  clearInterval(timerInterval);

  const levelSettings = levels[levelKey];
  timeRemaining = levelSettings.time;

  // Select random themes
  const shuffledThemes = [...CONEXO_THEMES].sort(() => 0.5 - Math.random());
  activeThemes = shuffledThemes.slice(0, levelSettings.numThemes);

  // Extract and shuffle words
  allWords = [];
  activeThemes.forEach((t) => {
    t.words.forEach((word) => {
      allWords.push({
        text: word,
        themeIndex: t.theme,
      });
    });
  });

  allWords.sort(() => 0.5 - Math.random());

  selectedWords = [];
  solvedThemes = [];

  updateTimerDisplay();
  renderGrid();
}

function startTimer() {
  timerDisplay.classList.remove("low-time");
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 10 && timeRemaining > 0) {
      if (!timerDisplay.classList.contains("low-time")) {
        timerDisplay.classList.add("low-time");
      }
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  timerDisplay.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function renderGrid() {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "conexo-grid";

  // First, add solved theme bars
  solvedThemes.forEach((themeName) => {
    const themeData = activeThemes.find((t) => t.theme === themeName);
    const bar = document.createElement("div");
    bar.className = "conexo-theme-bar";
    bar.innerHTML = `
      <div class="conexo-theme-title">${themeData.theme}</div>
      <div class="conexo-theme-words">${themeData.words.join(", ")}</div>
    `;
    grid.appendChild(bar);
  });

  // Then, add remaining words
  const remainingWords = allWords.filter(
    (w) => !solvedThemes.includes(w.themeIndex),
  );

  remainingWords.forEach((wordObj) => {
    const btn = document.createElement("div");
    btn.className = "conexo-word";
    btn.textContent = wordObj.text;

    if (selectedWords.some((w) => w.text === wordObj.text)) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => handleWordClick(wordObj, btn));
    grid.appendChild(btn);
  });

  container.appendChild(grid);
}

function handleWordClick(wordObj, btnElement) {
  if (isGameOver) return;

  if (!isTimerStarted) {
    isTimerStarted = true;
    startTimer();
  }

  const selectedIndex = selectedWords.findIndex((w) => w.text === wordObj.text);

  if (selectedIndex !== -1) {
    // Deselect
    selectedWords.splice(selectedIndex, 1);
    btnElement.classList.remove("selected");
  } else {
    // Select
    if (selectedWords.length < 4) {
      selectedWords.push(wordObj);
      btnElement.classList.add("selected");

      if (selectedWords.length === 4) {
        checkSelection();
      }
    }
  }
}

function checkSelection() {
  const firstTheme = selectedWords[0].themeIndex;
  const isMatch = selectedWords.every((w) => w.themeIndex === firstTheme);

  if (isMatch) {
    solvedThemes.push(firstTheme);
    selectedWords = [];
    showToast("TEMA ENCONTRADO!");

    setTimeout(() => {
      renderGrid();

      // Check win condition
      if (solvedThemes.length === activeThemes.length) {
        endGame(true);
      }
    }, 500);
  } else {
    // Shake animation
    const selectedElements = document.querySelectorAll(".conexo-word.selected");
    selectedElements.forEach((el) => {
      el.classList.add("shake");
      setTimeout(() => el.classList.remove("shake"), 500);
    });

    showToast("Palavras incorretas.", true);
    setTimeout(() => {
      selectedWords = [];
      renderGrid();
    }, 800);
  }
}

function endGame(isWin) {
  isGameOver = true;
  isTimerStarted = false;
  clearInterval(timerInterval);

  const diffStats = gameStats[currentLevel];
  diffStats.played++;

  const icon = document.getElementById("modal-icon");

  if (isWin) {
    diffStats.wins++;
    diffStats.currentStreak++;
    diffStats.maxStreak = Math.max(
      diffStats.currentStreak,
      diffStats.maxStreak,
    );

    modalTitle.textContent = "VOCÊ VENCEU!";
    modalTitle.className = "modal-title-win";
    modalTitle.style.color = "var(--success)";
    modalText.innerHTML = `Parabéns! Você encontrou todos os temas com <b>${updateTimerDisplayToString()}</b> restantes no nível ${getLevelName(currentLevel)}.`;
    icon.innerHTML =
      '<svg style="width: 3rem; height: 3rem; color: var(--success);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path></svg>';
    createConfetti();
  } else {
    diffStats.currentStreak = 0;

    modalTitle.textContent = "TEMPO ESGOTADO";
    modalTitle.className = "modal-title-lose";
    modalTitle.style.color = "var(--error)";
    modalText.innerHTML = `As categorias que faltavam eram exibidas agora. Tente novamente no nível ${getLevelName(currentLevel)}!`;
    icon.innerHTML =
      '<svg style="width: 3rem; height: 3rem; color: var(--error);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path></svg>';
    solveRemaining();
  }

  ConexoStatsManager.save(gameStats);

  setTimeout(() => {
    gameModal.classList.add("active");
    setTimeout(showStats, 2000); // Exibe as estatísticas logo após a vitória/derrota
  }, 1000);
}

function createConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;
  container.innerHTML = "";
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#6366f1"];
  for (let i = 0; i < 50; i++) {
    const div = document.createElement("div");
    div.className = "confetti";
    div.style.left = Math.random() * 100 + "vw";
    div.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    div.style.animationDelay = Math.random() * 4 + "s";
    div.style.width = Math.random() * 1 + 0.5 + "vw";
    div.style.height = div.style.width;
    container.appendChild(div);
  }
}

function updateTimerDisplayToString() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getLevelName(level) {
  switch (level) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "hard":
      return "Difícil";
    default:
      return "Fácil";
  }
}

function solveRemaining() {
  activeThemes.forEach((theme) => {
    if (!solvedThemes.includes(theme.theme)) {
      solvedThemes.push(theme.theme);
    }
  });
  renderGrid();
}

let toastTimeout;
function showToast(message, isError = false) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");

  if (isError) {
    toast.style.backgroundColor = "var(--error)";
  } else {
    toast.style.backgroundColor = "var(--success)";
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    // reset to default style from CSS
    setTimeout(() => {
      toast.style.backgroundColor = "var(--card-bg)";
    }, 300);
  }, 2000);
}
